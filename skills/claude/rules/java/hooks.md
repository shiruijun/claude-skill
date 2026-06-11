---
paths:
  - "**/*.java"
  - "**/pom.xml"
---
# Java Hooks

> 本文件扩展自 [common/hooks.md](../common/hooks.md)，适用于 **Maven + Java 8** 项目。

## PostToolUse Hooks

在 `~/.claude/settings.json` 中配置：

### 格式化（Spotless）

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "cd $FILE_DIR && mvn spotless:apply -q",
        "description": "Apply code formatting with Maven Spotless"
      }
    ]
  }
}
```

### 编译检查

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "cd $WORKSPACE_ROOT && mvn compile -q -pl $MODULE_NAME -am",
        "description": "Compile Java file to verify syntax"
      }
    ]
  }
}
```

### Checkstyle 检查

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "cd $WORKSPACE_ROOT && mvn checkstyle:check -q -pl $MODULE_NAME",
        "description": "Run Checkstyle on modified Java files"
      }
    ]
  }
}
```

## PreToolUse Hooks

### 禁止提交敏感信息

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "command": "grep -i -E '(password|secret|api.?key|token)\\s*=\\s*[\"'][^\"']+[\"']' $FILE_PATH && echo '[Hook] BLOCKED: Potential secret found' && exit 2 || exit 0",
        "description": "Block commits with hardcoded secrets"
      }
    ]
  }
}
```

## Maven 常用命令

```bash
# 编译
mvn compile

# 运行测试
mvn test

# 跳过测试编译
mvn test -Dmaven.test.skip=true

# 运行特定测试类
mvn test -Dtest=EcomSpecialOrderServiceTest

# 生成覆盖率报告
mvn test jacoco:report

# 检查依赖
mvn dependency:tree

# 清理构建
mvn clean
```

## 项目构建顺序

由于项目是多模块 Maven 项目，依赖顺序：

```
xiaogj-youli-common-starter/     → 公共依赖库
    ↓
xiaogj-youli-*/xiaogj-*-api/   → 各服务 API 模块
    ↓
xiaogj-youli-*/xiaogj-*-service/ → 各服务实现模块
```

构建单个服务时：
```bash
cd xiaogj-youli-data-etl
mvn clean package -T 1C -Dmaven.test.skip=true
```

## IDE 配置建议

### IntelliJ IDEA
- 安装 Alibaba Java Coding Guidelines 插件
- 设置代码格式化：Settings → Code Style → Java → 导入 eclipse-codestyle.xml
- 开启 Checkstyle 插件

### VS Code
- 安装 Extension Pack for Java
- 开启 Format on Save
- 配置 Checkstyle 扩展
