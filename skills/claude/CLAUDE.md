# CLAUDE.md

本文件为 Claude Code 在此代码库中工作时提供指导。

**工作区根目录：** `%WORKSPACE_ROOT%`

> **说明**：编码原则、安全规范、Git 工作流、测试要求等通用规范由全局 rules 提供，参见 `~/.claude/rules/`。本文档仅包含多仓库工作区特有的内容。

---

## 工作区概览

这是**多仓库工作区**（非 monorepo）。`%WORKSPACE_ROOT%` 聚合了有励/经贝企业平台的多个独立 Git 仓库。工作区根目录**不是** Git 仓库——每个子目录都有独立的 `.git`。所有 Git 操作必须针对具体的子仓库目录。

---

## 技术栈

| 类别 | 技术 |
|------|------|
| **Java 版本** | JDK 8（`%JAVA_HOME%`） |
| **后端框架** | Spring Boot 2.2.9 / Spring Cloud Hoxton.SR7 / Spring Cloud Alibaba 2.2.3 |
| **ORM** | MyBatis-Plus 3.4.1 + PageHelper |
| **服务注册与配置** | Nacos |
| **网关** | Spring Cloud Gateway + Sentinel |
| **数据库** | MySQL (utf8mb4)、Redis (Redisson 3.11.5)、Caffeine |
| **前端（旧）** | Vue 2.7 + Vite + Element UI |
| **前端（新）** | Vue 3 + Vite + TypeScript |
| **CI/CD** | GitLab CI → Docker → Harbor → K8s |

---

## 服务地图

| 服务 | 端口 | 仓库目录 | 用途 |
|------|------|----------|------|
| platform-gateway | 9900 | `xiaogj-youli-platform-gateway/` | 平台统一网关，内部服务入口 |
| open-gateway | 9901 | `xiaogj-youli-platform-opengateway/` | 开放平台网关，外部 API 接入 |
| mdm | 9902 | `xiaogj-youli-mdm/` | 主数据管理，商品/供应商/客户等基础数据 |
| crm | 9903 | `xiaogj-youli-crm/` | 客户关系、菜单、权限管理 |
| amoeba | 9904 | `xiaogj-youli-amoeba/` | 经贝管家核心服务，财务核算与审批流程引擎 |
| data-analysis | 9905 | `xiaogj-youli-data-analysis/` | 数据分析平台 |
| data-etl | 9906 | `xiaogj-youli-data-etl/` | 数据 ETL 处理 |
| data-sync | 9908 | `xiaogj-youli-data-sync/` | 主数据同步服务 |
| manage | 18080 | `xiaogj-youli-manage/` | 系统管理后台，租户/用户/权限管理 |
| inventory | 9920 | `xiaogj-youli-inventory/xiaogj-youli-inventory/` | 进销存管理 |
| inventory-reconcile | 9921 | `xiaogj-youli-inventory/xiaogj-youli-inventory/` | 进销存对账 |

**共享库**（无运行时端口）：
- `xiaogj-youli-common-starter/` — 父 POM + 所有共享 starter
- `xiaogj-youli-router-distributor/` — 多租户路由/灰度发布 starter

---

## 前端项目

| 目录 | 技术栈 | UI 组件库 | 用途 |
|------|--------|----------|------|
| `xiaogj-youli-platform-web/` | Vue 2.7 + Vite | Element UI | 经贝管家 PC 端 |
| `jingbei-h5/` | Vue 3 + Vite + TS | Vant 4 | 经贝管家移动端 |
| `xiaogj-youli-manage/xiaogj-youli-manage-frontend/` | Vue 3 + Vite + TS | Ant Design Vue | 经贝管家管理 PC 端 |
| `xiaogj-youli-inventory/xiaogj-youli-inventory-frontend/` | Vue 3 + Vite + TS + Less | Arco Design Vue | 进销存 PC 端 |

---

## 本地开发前置条件

- **JDK 8**：系统环境变量 `JAVA_HOME` 需指向 JDK 8 目录
- **Maven 3.6+**：添加到 PATH
- **Node.js 18+**：前端构建用
- **Nacos**：所有后端服务依赖 Nacos 进行配置和注册
- **MySQL + Redis**：数据库和缓存，见 Nacos 配置

---

## 构建命令

### 后端（Java/Maven）

```bash
# 构建单个服务（从仓库根目录执行）
mvn clean package -T 1C -Dmaven.test.skip=true -Dmaven.compile.fork=true \
    -Dmaven.javadoc.skip=true -Dcheckstyle.skip=true -Dpmd.skip=true -Dspotbugs.skip=true

# 安装到本地仓库（当下游服务依赖此模块时需要）
mvn clean install -Dmaven.test.skip=true
```

### 前端

```bash
npm install
npm run dev      # 开发服务器
npm run build    # 生产构建
```

---

## 数据库规范

> 本规范为 ai-jb 项目特有，通用 SQL 规范参见 rules/common。

- **表前缀：** `t_yl_{domain}_{biz}`（如 `t_yl_amb_*`、`t_yl_crm_*`）
- **主键：** `bigint id`（分布式 ID 生成，非自增）
- **审计字段：** `create_time`、`update_time`、`deleted`（逻辑删除，默认 `0`）
- **多租户：** `company_id` 做租户隔离
- **金额字段：** `decimal(18,2)` 用于金额；`decimal(18,6)` 用于税率/百分比
- **索引命名：** `pk_*`（主键）、`uk_*`（唯一）、`idx_*`（普通）

---

## 编码原则

1. **编码前先思考**
   - 不随意假设，不掩盖困惑，明确权衡方案。
   - 清晰说明你的假设。如有不确定，主动提问。
   - 若存在多种理解方式，应全部列出，不暗自选定。
   - 若有更简洁的方案，主动提出；合理时可给出不同建议。
   - 若内容不清晰，立即停止。明确指出困惑点并提问。

2. **简洁优先**
   - 用最少代码解决问题，不做任何预判性设计。
   - 不实现需求以外的任何功能。
   - 单次使用的代码不做抽象封装。
   - 不添加未被要求的"灵活性"或"可配置性"。
   - 不为不可能出现的场景编写异常处理。
   - 若本可 50 行实现却写了 200 行，应重写。

3. **精准修改**
   - 只修改必需内容，只清理自身产生的冗余代码。
   - 不"优化"相邻代码、注释或格式。
   - 不重构没有问题的逻辑。
   - 遵循项目现有风格，即便你有不同写法。
   - 发现无关的死代码，只需提示，不擅自删除。
   - 删除因你的改动而失效的导入、变量、函数。
   - 除非明确要求，否则不删除原本就存在的死代码。

4. **目标驱动执行**
   - 定义成功标准，循环验证直至通过。
   - "添加校验"→"为非法输入编写测试用例并使其通过"
   - "修复 Bug"→"编写可复现问题的测试用例并使其通过"
   - "重构 X"→"确保重构前后测试均能正常通过"

## 编码规范

- 遵循**阿里巴巴 Java 开发手册**（泰山版）
- 统一使用 UTF-8 编码
- 作者：`%USERNAME%`，时间戳格式：`yyyy-MM-dd HH:mm:ss`
- Dto/Vo/Bo/配置类使用 Lombok
- 校验错误信息必须为中文，提供清晰的业务指引
- 图表：仅使用 Mermaid，不使用 ASCII art
- 只做最小必要改动——不做无关重构
- 严格控制魔法值，提取为具名常量或枚举。
- `if / else`、`switch`、循环、异常处理等结构保持清晰，避免过深嵌套。

## 前端工程约束

- **`vite.config.js` 的本地调试/代理配置等变更，禁止提交到远端仓库**。提交前必须确认 `vite.config.js` 不在本次 commit 中，除非是经过评审的正式构建配置调整。

## 提交检查

- **commit 后必须二次确认**。执行 `git commit` 后，立即通过 `git show --stat` 或 `git diff HEAD~1` 检查本次提交的文件列表与 diff 内容，确认无截断、无异常，再继续后续操作。
- **若发现文件截断，禁用 fscache 后重新提交**：执行 `git -c core.fscache=false add <file>` 强制从文件系统重新读取完整文件，避免 Windows 上 `core.fscache` 缓存错误元数据导致的截断问题。

---

## 输出文件

> 使用 superpowers 输出文档前，需与用户确认当前迭代版本号和飞书需求 ID。

### 文档存放根目录

所有 AI 生成的需求文档统一输出到 `ai-doc/` 下。

### 目录结构规范

```
ai-doc/
├── README.md                         # 文档索引（必须）
└── 迭代/
    └── <迭代版本号>/                 # 如 v1.0.0
        └── <飞书需求ID>-<功能名称>/  # 如 FE-D1234-密码登录重构
            ├── spec.md               # 需求规格（必须）
            ├── design/               # 技术设计目录
            │   ├── database.md
            │   └── api.md
            └── plan.md               # 实施计划（可选）
```

### 关键参考文件

- `AGENTS.md` — 工作区级开发规范（权威）
- `ai-doc/` — 业务文档、测试报告、SQL 脚本
- `yl/` — 发版说明、部署脚本、公共配置
