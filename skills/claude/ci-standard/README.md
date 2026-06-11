# 项目 CI 规范

本文档定义经贝/有励企业平台所有项目的 GitLab CI 配置标准，涵盖**前端项目**和**后端 Java 项目**。

---

## 目录

- [概述](#概述)
- [前端项目 CI 规范](#前端项目-ci-规范)
  - [涉及文件](#涉及文件)
  - [四环境配置](#四环境配置)
  - [GitLab CI 模板规范](#gitlab-ci-模板规范)
  - [Dockerfile 规范](#dockerfile-规范)
  - [K8s 部署模板规范](#k8s-部署模板规范)
- [后端 Java 项目 CI 规范](#后端-java-项目-ci-规范)
  - [涉及文件](#涉及文件-1)
  - [四环境配置](#四环境配置-1)
  - [GitLab CI 模板规范](#gitlab-ci-模板规范-1)
  - [Dockerfile 规范](#dockerfile-规范-1)
  - [K8s 部署模板规范](#k8s-部署模板规范-1)
- [环境分支规范](#环境分支规范)
- [变更流程](#变更流程)

---

## 概述

项目采用 **GitLab CI + Kaniko + Kubernetes** 自动化构建部署流程：

```
代码提交 → GitLab CI 编译 → Kaniko 打包镜像 → kubectl 部署到 K8s
```

### 四套环境

| 环境 | 源码分支 | 部署命名空间 | 触发方式 |
|------|----------|-------------|----------|
| dev | `clouddev/release/merge` | `x3dev` | 自动构建 + 手动部署 |
| dev2 | `clouddev2/release/merge` | `x3dev2` | 自动构建 + 手动部署 |
| test | `test/release/merge` | `x3test` | 自动构建 + 手动部署 |
| sit | `sit/release/merge` | `x3sit` | 自动构建 + 手动部署 |

---

## 前端项目 CI 规范

适用项目：`xiaogj-youli-platform-web`、`jingbei-h5`

### 涉及文件

| 文件 | 用途 |
|------|------|
| `.gitlab-ci.yml` | GitLab CI 流水线配置 |
| `Dockerfile` | 容器镜像构建文件 |
| `deployment.yaml` | Kubernetes 部署模板 |

### 四环境配置

#### 环境变量标准

```yaml
variables:
  # === 镜像仓库配置 ===
  IMAGE_REGISTRY: "xiaogj-registry-vpc.cn-hangzhou.cr.aliyuncs.com"
  IMAGE_NAMESPACE: "xgj"
  IMAGE_NAME: "$IMAGE_REGISTRY/$IMAGE_NAMESPACE/$CI_PROJECT_NAME:$CI_COMMIT_SHORT_SHA"

  # === 前端构建镜像 ===
  BUILD_IMAGE: "xiaogj-registry-vpc.cn-hangzhou.cr.aliyuncs.com/base/node:18.14.2"
  KANIKO_IMAGE: "xiaogj-registry-vpc.cn-hangzhou.cr.aliyuncs.com/base/kaniko:v1.0"
  K8S_CTL_IMAGE: "xiaogj-registry-vpc.cn-hangzhou.cr.aliyuncs.com/base/k8sctl:v1"

  NPM_CONFIG_CACHE: "/root/.npm_cache"
  NPM_CONFIG_REGISTRY: "https://registry.npmmirror.com"
```

### GitLab CI 模板规范

#### 构建阶段模板

```yaml
.fe_build_template: &fe_build
  stage: build_code
  tags:
    - ack
  image: $BUILD_IMAGE
  script:
    - echo "--- [1/3] 配置 npm 缓存 ---"
    - mkdir -p $NPM_CONFIG_CACHE
    - npm config set cache $NPM_CONFIG_CACHE --global
    - npm config set registry $NPM_CONFIG_REGISTRY

    - echo "--- [2/3] 执行前端编译 ---"
    - npm install
    - npm run build

    - echo "--- [3/3] 收集构建产物 ---"
  artifacts:
    name: "dist_${CI_COMMIT_SHORT_SHA}"
    expire_in: 1 hour
    paths:
      - dist/
      - Dockerfile
```

#### 镜像打包模板

```yaml
.fe_push_template: &fe_push
  stage: package_image
  tags:
    - ack
  image: $KANIKO_IMAGE
  script:
    - echo "--- Kaniko 开始封装并推送镜像 ---"
    - mkdir -p /kaniko/.docker
    - echo "{\"auths\":{\"$IMAGE_REGISTRY\":{\"username\":\"$REGISTRY_USER\",\"password\":\"$REGISTRY_PWD\"}}}" > /kaniko/.docker/config.json
    - /kaniko/executor --context $CI_PROJECT_DIR --dockerfile $CI_PROJECT_DIR/Dockerfile --destination $IMAGE_NAME --cache=true --ignore-path=/var/mail --ignore-path=/var/spool/mail
```

#### K8s 部署模板

```yaml
.fe_deploy_template: &fe_deploy
  tags:
    - ack
  image: $K8S_CTL_IMAGE
  script:
    - echo "--- 正在部署至环境 $TARGET_NS ---"
    - sed -i "s|\${IMAGE_NAME}|$IMAGE_NAME|g" deployment.yaml
    - sed -i "s|\${CI_PROJECT_NAME}|$CI_PROJECT_NAME|g" deployment.yaml
    - sed -i "s|\${TARGET_NS}|$TARGET_NS|g" deployment.yaml
    - mkdir -p ~/.kube && cp "$KUBE_CONFIG" ~/.kube/config
    - kubectl apply -f deployment.yaml
    - kubectl rollout status deployment/$CI_PROJECT_NAME -n $TARGET_NS
```

#### Job 任务定义

```yaml
stages:
  - build_code
  - package_image
  - deploy_dev
  - deploy_dev2
  - deploy_test
  - deploy_sit

# dev
build_dev:
  <<: *fe_build
  variables:
    TARGET_NS: "x3dev"
  only:
    - clouddev/release/merge

package_dev:
  <<: *fe_push
  needs: ["build_dev"]
  only:
    - clouddev/release/merge

deploy_dev:
  <<: *fe_deploy
  stage: deploy_dev
  variables:
    TARGET_NS: "x3dev"
  when: manual
  only:
    - clouddev/release/merge

# dev2
build_dev2:
  <<: *fe_build
  variables:
    TARGET_NS: "x3dev2"
  only:
    - clouddev2/release/merge

package_dev2:
  <<: *fe_push
  needs: ["build_dev2"]
  only:
    - clouddev2/release/merge

deploy_dev2:
  <<: *fe_deploy
  stage: deploy_dev2
  variables:
    TARGET_NS: "x3dev2"
  when: manual
  only:
    - clouddev2/release/merge

# test
build_test:
  <<: *fe_build
  variables:
    TARGET_NS: "x3test"
  only:
    - test/release/merge

package_test:
  <<: *fe_push
  needs: ["build_test"]
  only:
    - test/release/merge

deploy_test:
  <<: *fe_deploy
  stage: deploy_test
  variables:
    TARGET_NS: "x3test"
  when: manual
  only:
    - test/release/merge

# sit
build_sit:
  <<: *fe_build
  variables:
    TARGET_NS: "x3sit"
  only:
    - sit/release/merge

package_sit:
  <<: *fe_push
  needs: ["build_sit"]
  only:
    - sit/release/merge

deploy_sit:
  <<: *fe_deploy
  stage: deploy_sit
  variables:
    TARGET_NS: "x3sit"
  when: manual
  only:
    - sit/release/merge
```

### Dockerfile 规范

#### 标准模板

```dockerfile
FROM xiaogj-registry-vpc.cn-hangzhou.cr.aliyuncs.com/base/nginx:prd
RUN rm -rf /var/mail /var/spool/mail && ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
COPY dist/ /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
```

#### 要求

- 基础镜像：使用公司私有仓库 `nginx:prd`
- 时区：统一设置为 Asia/Shanghai
- 清理：删除 mail spool 避免容器膨胀
- 复制：dist 目录到 nginx html 目录
- 必须包含 nginx.conf 配置文件

### K8s 部署模板规范

#### deployment.yaml 标准模板

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${CI_PROJECT_NAME}
  namespace: ${TARGET_NS}
  labels:
    app: ${CI_PROJECT_NAME}
spec:
  replicas: 1
  selector:
    matchLabels:
      app: ${CI_PROJECT_NAME}
  template:
    metadata:
      labels:
        app: ${CI_PROJECT_NAME}
      name: ${CI_PROJECT_NAME}
    spec:
      containers:
      - name: ${CI_PROJECT_NAME}
        image: ${IMAGE_NAME}
        imagePullPolicy: Always
        ports:
        - containerPort: 80
          protocol: TCP
        resources:
          requests:
            cpu: 10m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
```

#### 变量替换说明

| 变量 | 来源 | 说明 |
|------|------|------|
| `${CI_PROJECT_NAME}` | GitLab CI 预定义 | 项目名称 |
| `${TARGET_NS}` | Job variables | K8s 命名空间 |
| `${IMAGE_NAME}` | GitLab CI variables | 完整镜像地址 |

---

## 后端 Java 项目 CI 规范

适用项目：`xiaogj-youli-amoeba`、`xiaogj-youli-crm`、`xiaogj-youli-mdm`、`xiaogj-youli-platform-gateway`、`xiaogj-youli-platform-opengateway`、`xiaogj-youli-data-analysis`、`xiaogj-youli-data-etl`、`xiaogj-youli-data-sync` 等

### 涉及文件

| 文件 | 用途 |
|------|------|
| `.gitlab-ci.yml` | GitLab CI 流水线配置 |
| `Dockerfile` | 容器镜像构建文件 |
| `deployment.yaml` | Kubernetes 部署模板 |

### 四环境配置

#### 环境变量标准

```yaml
variables:
  # === 每个新项目仅需修改这部分 ===
  SERVER_PORT: "9904"  # 修改为实际服务端口

  # === 镜像仓库配置 ===
  IMAGE_REGISTRY: "xiaogj-registry-vpc.cn-hangzhou.cr.aliyuncs.com"
  IMAGE_NAMESPACE: "xgj"
  IMAGE_NAME: "$IMAGE_REGISTRY/$IMAGE_NAMESPACE/$CI_PROJECT_NAME:$CI_COMMIT_SHORT_SHA"
  NAS_M2_BASE: "/root/.m2"
```

### GitLab CI 模板规范

#### 构建阶段模板

```yaml
.build_template: &build_logic
  stage: build_and_package
  tags:
    - ack
  image: xiaogj-registry-vpc.cn-hangzhou.cr.aliyuncs.com/base/mavendocker:3.8.6-jdk-8-kaniko
  script:
    - echo "--- [1/3] 动态初始化 NAS 环境隔离路径 ---"
    - export MAVEN_REPO_LOCAL="${NAS_M2_BASE}/repository/${TARGET_NS}"
    - export MAVEN_CLI_OPTS="-s /root/.m2/settings.xml --batch-mode -DskipTests -Dmaven.repo.local=$MAVEN_REPO_LOCAL"
    - mkdir -p $MAVEN_REPO_LOCAL

    - echo "--- [2/3] 执行 Maven 编译 ---"
    - export MAVEN_OPTS="-Xmx2560m -XX:MaxMetaspaceSize=512m"
    - mvn $MAVEN_CLI_OPTS clean install -DskipTests -U

    - echo "--- [3/3] 定位 JAR 并使用 Kaniko 构建镜像 ---"
    - JAR_PATH=$(find . -name "*.jar" | grep "target/" | grep -v "sources" | xargs du -b | sort -nr | head -n 1 | cut -f2)
    - echo "Detected JAR:$JAR_PATH"
    - cp $JAR_PATH ./app.jar
    - mkdir -p /kaniko/.docker
    - echo "{\"auths\":{\"$IMAGE_REGISTRY\":{\"username\":\"$REGISTRY_USER\",\"password\":\"$REGISTRY_PWD\"}}}" > /kaniko/.docker/config.json
    - /kaniko/executor --context $CI_PROJECT_DIR --dockerfile $CI_PROJECT_DIR/Dockerfile --destination $IMAGE_NAME --cache=true --single-snapshot --ignore-path=/var/mail --ignore-path=/var/spool/mail --build-arg JAR_FILE=app.jar
```

#### K8s 部署模板

```yaml
.deploy_template: &deploy_logic
  tags:
    - ack
  image: xiaogj-registry-vpc.cn-hangzhou.cr.aliyuncs.com/base/k8sctl:v1
  script:
    - echo "--- 正在部署至环境 $TARGET_NS ---"
    - sed -i "s|\${IMAGE_NAME}|$IMAGE_NAME|g" deployment.yaml
    - sed -i "s|\${CI_PROJECT_NAME}|$CI_PROJECT_NAME|g" deployment.yaml
    - sed -i "s|\${TARGET_NS}|$TARGET_NS|g" deployment.yaml
    - sed -i "s|\${SERVER_PORT}|$SERVER_PORT|g" deployment.yaml
    - mkdir -p ~/.kube && cp "$KUBE_CONFIG" ~/.kube/config
    - kubectl apply -f deployment.yaml
    - kubectl rollout status deployment/$CI_PROJECT_NAME -n $TARGET_NS
```

#### Job 任务定义

```yaml
stages:
  - build_and_package
  - deploy_dev
  - deploy_dev2
  - deploy_test
  - deploy_sit

# dev 环境
build_dev:
  <<: *build_logic
  variables:
    TARGET_NS: "x3dev"
  only:
    - clouddev/release/merge

deploy_dev:
  <<: *deploy_logic
  stage: deploy_dev
  variables:
    TARGET_NS: "x3dev"
  when: manual
  only:
    - clouddev/release/merge

# dev2 环境
build_dev2:
  <<: *build_logic
  variables:
    TARGET_NS: "x3dev2"
  only:
    - clouddev2/release/merge

deploy_dev2:
  <<: *deploy_logic
  stage: deploy_dev2
  variables:
    TARGET_NS: "x3dev2"
  when: manual
  only:
    - clouddev2/release/merge

# test 环境
build_test:
  <<: *build_logic
  variables:
    TARGET_NS: "x3test"
  only:
    - test/release/merge

deploy_test:
  <<: *deploy_logic
  stage: deploy_test
  variables:
    TARGET_NS: "x3test"
  when: manual
  only:
    - test/release/merge

# sit 环境
build_sit:
  <<: *build_logic
  variables:
    TARGET_NS: "x3sit"
  only:
    - sit/release/merge

deploy_sit:
  <<: *deploy_logic
  stage: deploy_sit
  variables:
    TARGET_NS: "x3sit"
  when: manual
  only:
    - sit/release/merge
```

### Dockerfile 规范

#### 标准模板

```dockerfile
# 基础镜像
FROM xiaogj-registry-vpc.cn-hangzhou.cr.aliyuncs.com/base/xiaogj-x3-base:v1.0

# 时区优化
RUN rm -rf /var/mail /var/spool/mail && \
    ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    echo 'Asia/Shanghai' >/etc/timezone

# 准备工作目录和挂载点
WORKDIR /app
VOLUME /tmp
VOLUME /logs

# 拷贝 jar 包
ARG JAR_FILE=app.jar
COPY ${JAR_FILE} app.jar

# 环境变量优化
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/logs/ -Duser.timezone=Asia/Shanghai -Dfile.encoding=UTF-8"

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
```

#### 要求

- 基础镜像：使用公司私有仓库 `xiaogj-x3-base:v1.0`
- 时区：统一设置为 Asia/Shanghai
- 清理：删除 mail spool 避免容器膨胀
- JVM 优化：使用容器支持参数 `-XX:+UseContainerSupport`
- 启动模式：使用 exec 模式确保 SIGTERM 信号正常处理优雅停机

### K8s 部署模板规范

#### deployment.yaml 标准模板

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${CI_PROJECT_NAME}
  namespace: ${TARGET_NS}
  labels:
    app: ${CI_PROJECT_NAME}
spec:
  replicas: 1
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 1
  selector:
    matchLabels:
      app: ${CI_PROJECT_NAME}
  template:
    metadata:
      labels:
        app: ${CI_PROJECT_NAME}
    spec:
      hostNetwork: false
      containers:
        - name: ${CI_PROJECT_NAME}
          image: ${IMAGE_NAME}
          imagePullPolicy: Always
          ports:
            - containerPort: ${SERVER_PORT}
              protocol: TCP
          resources:
            requests:
              cpu: "10m"
              memory: "50Mi"
            limits:
              cpu: "1"
              memory: "2048Mi"
          env:
            - name: JAVA_TOOL_OPTIONS
              value: '-Xmx1024m -Xms512m'
            - name: SPRING_PROFILES
              valueFrom:
                configMapKeyRef:
                  name: nacosconfig
                  key: nacos.env
            - name: NACOS_NAMESPACE
              valueFrom:
                configMapKeyRef:
                  name: nacosconfig
                  key: nacos.namespace
            - name: NACOS_SERVER_ADDR
              valueFrom:
                configMapKeyRef:
                  name: nacosconfig
                  key: nacos.host
            - name: NACOS_USERNAME
              valueFrom:
                configMapKeyRef:
                  name: nacosconfig
                  key: nacos.username
            - name: NACOS_PASSWORD
              valueFrom:
                configMapKeyRef:
                  name: nacosconfig
                  key: nacos.password
          lifecycle:
            preStop:
              exec:
                command: ["/bin/sh", "-c", "sleep 10"]
```

#### 变量替换说明

| 变量 | 来源 | 说明 |
|------|------|------|
| `${CI_PROJECT_NAME}` | GitLab CI 预定义 | 项目名称 |
| `${TARGET_NS}` | Job variables | K8s 命名空间 |
| `${IMAGE_NAME}` | GitLab CI variables | 完整镜像地址 |
| `${SERVER_PORT}` | Job variables | 服务监听端口 |

#### 资源限制建议

| 服务类型 | CPU Limit | Memory Limit |
|----------|-----------|--------------|
| 标准微服务 | 1 | 2048Mi |
| 高内存服务（如 amoeba） | 3 | 3072Mi |
| 轻量服务 | 500m | 1024Mi |

---

## 环境分支规范

### 分支与环境映射

```
clouddev/release/merge  ──→  dev 环境 (x3dev)
clouddev2/release/merge ──→  dev2 环境 (x3dev2)
test/release/merge       ──→  test 环境 (x3test)
sit/release/merge        ──→  sit 环境 (x3sit)
```

### 各环境特性

| 环境 | 自动构建 | 自动部署 | 用途 |
|------|----------|----------|------|
| dev | ✅ | ❌ 手动 | 开发联调 |
| dev2 | ✅ | ❌ 手动 | 开发联调2 |
| test | ✅ | ❌ 手动 | 测试验收 |
| sit | ✅ | ❌ 手动 | 预发布验收 |

**注意**：所有环境构建自动，部署均为手动触发（`when: manual`）。

---

## 变更流程

### 1. 规范变更

当需要修改 CI 规范时：

1. 更新本文档
2. 在 `sit/release/merge` 分支验证新配置
3. 将 `sit/release/merge` 合并到 `test/release/merge`、`dev2/release/merge`、`dev/release/merge`

### 2. 单项目配置变更

当单个项目需要调整 CI 配置时：

1. 在对应环境的分支上进行修改（如修改 dev 环境，先在 `clouddev/release/merge` 修改）
2. 提交并推送
3. 手动触发部署验证
4. 验证通过后，同步到其他环境分支

### 3. 同步模式

```
sit/release/merge  (基准分支，最完善配置)
       ↓ 合并
test/release/merge
       ↓ 合并
dev2/release/merge
       ↓ 合并
dev/release/merge
```

建议从 sit 基准出发，逐层向下合并，确保各环境配置一致。

---

## 附录：项目端口参考

### 后端 Java 服务

| 服务 | 端口 | 说明 |
|------|------|------|
| platform-gateway | 9900 | 平台统一网关 |
| opengateway | 9901 | 开放平台网关 |
| mdm | 9902 | 主数据管理 |
| crm | 9903 | 客户关系管理 |
| amoeba | 9904 | 经贝管家核心服务 |
| data-analysis | 9905 | 数据分析平台 |
| data-etl | 9906 | 数据 ETL 处理 |
| data-sync | 9908 | 主数据同步服务 |
| manage | 18080 | 系统管理后台 |

### 前端项目

| 项目 | 端口 | 说明 |
|------|------|------|
| xiaogj-youli-platform-web | 80 | PC 端管理后台 |
| jingbei-h5 | 80 | 移动端 H5 应用 |
