# 经贝技术设计流水线（JB TD Pipeline）

基于 `jb-pm-pipeline` 产出的 PRD，系统化地完成前后端技术设计，输出架构文档、数据库设计、API 设计和可执行的实施计划。

## 前置条件

- 必须已完成 `jb-pm-pipeline`，产出 `prd.md`
- 当前目录下需存在 `ai-doc/迭代/` 目录结构（由 `jb-pm-pipeline` 创建）

## 整体流程

| Step | 阶段 | Agent/Skill | 产出文档 | 参考 |
|------|------|------------|---------|------|
| 0 | 输入解析与状态初始化 | — | — | [step-00-init](references/step-00-init.md) |
| 0.5 | 代码预分析 | CodeGraph MCP | design/codegraph-summary.md | [step-05-codegraph](references/step-05-codegraph.md) |
| 1 | 技术头脑风暴 | superpowers:brainstorming + general-purpose | design/brainstorm.md | [step-10-brainstorm](references/step-10-brainstorm.md) |
| 2a | 后端架构设计 | architect | design/backend/architecture.md | [step-20-backend-arch](references/step-20-backend-arch.md) |
| 2b | 后端详细设计 | architect (并行×2) | design/backend/database.md + design/backend/api.md | [step-21-backend-detail](references/step-21-backend-detail.md) |
| 3a | 前端架构设计 | architect | design/frontend/architecture.md | [step-30-frontend-arch](references/step-30-frontend-arch.md) |
| 3b | 前端详细设计 | architect (并行×2) | design/frontend/components.md + design/frontend/api-integration.md | [step-31-frontend-detail](references/step-31-frontend-detail.md) |
| 4 | 工程评审 | plan-eng-review | design/eng-review.md | [step-40-eng-review](references/step-40-eng-review.md) |
| 5 | 实施计划 | — | plans/plan.md | [step-50-plan](references/step-50-plan.md) |
| 6 | 完成 | — | README.md | [step-60-completion](references/step-60-completion.md) |

> 各阶段产出文档的 Markdown 模板参见 [references/templates/](references/templates/)。

## 状态机

```
NO_STATE ──→ initialized ──→ completed
```

| 状态 | 说明 | 处理 |
|------|------|------|
| `NO_STATE` | 首次使用 | 创建状态文件，进入 Step 0.5 |
| `initialized` | 正常执行中 | 按 Step 0→6 顺序推进 |
| `completed` | 当前需求已完成 | 询问复用/查看/新建 |

## 执行入口

解析用户输入得到 TICKET 后：
1. 读取 `.jb-td-pipeline/active.json` 获取活跃 ticket
2. 读取 `.jb-td-pipeline/${TICKET}.json` 获取 phases 状态
3. 找到第一个 `false` 的 phase，跳转到对应 Step

## 中断恢复

| phases 状态 | 从哪继续 | 参考 |
|-------------|---------|------|
| `codegraph=false` | Step 0.5 | [step-05](references/step-05-codegraph.md) |
| `brainstorm=false` | Step 1 | [step-10](references/step-10-brainstorm.md) |
| `backendArch=false` | Step 2a | [step-20](references/step-20-backend-arch.md) |
| `backendDetail=false` | Step 2b | [step-21](references/step-21-backend-detail.md) |
| `frontendArch=false` | Step 3a | [step-30](references/step-30-frontend-arch.md) |
| `frontendDetail=false` | Step 3b | [step-31](references/step-31-frontend-detail.md) |
| `engReview=false` | Step 4 | [step-40](references/step-40-eng-review.md) |
| `implementationPlan=false` | Step 5 | [step-50](references/step-50-plan.md) |
| 全部为 true | Step 6 | [step-60](references/step-60-completion.md) |
