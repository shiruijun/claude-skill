# Step 3b: 前端详细设计（并行）

> **策略**：基于已确认的前端架构，并行产出 components 和 api-integration。

## 检查

如果 `phases.frontendDetail == true` 且 `design/frontend/components.md` 和 `design/frontend/api-integration.md` 均存在：

AskUserQuestion：
> 前端详细设计已存在，复用还是重新执行？
> - **A)** 复用
> - **B)** 重新执行

## 执行

并行启动两个 agent：

**Agent 1 — 组件设计：**

```
Agent({
  subagent_type: "architect",
  prompt: "基于以下前端架构设计，进行组件设计：\n\nPRD：\n{prd.md 全文}\n\n前端架构：\n{design/frontend/architecture.md 全文}\n\n后端 API：\n{design/backend/api.md 全文}\n\n代码现状摘要（由 CodeGraph 预分析产出）：\n{design/codegraph-summary.md 全文}\n\n只产出 components.md，包含组件清单、Props/Emits/Slots、数据流、关键逻辑。"
})
```

**Agent 2 — API 集成设计：**

```
Agent({
  subagent_type: "architect",
  prompt: "基于以下前端架构设计，进行 API 集成设计：\n\nPRD：\n{prd.md 全文}\n\n前端架构：\n{design/frontend/architecture.md 全文}\n\n后端 API：\n{design/backend/api.md 全文}\n\n代码现状摘要（由 CodeGraph 预分析产出）：\n{design/codegraph-summary.md 全文}\n\n前端请求规范：\n- FetchService 封装\n- Token 管理（ls + useUser store）\n- 统一错误处理（errorHandler / handler / appHandler）\n\n只产出 api-integration.md，包含 API 模块映射、请求封装、错误处理、Loading 状态、数据缓存策略。"
})
```

## 产出

- 使用 [templates/frontend-components.md](templates/frontend-components.md) 模板，写入 `$BASE_DIR/design/frontend/components.md`
- 使用 [templates/frontend-api-integration.md](templates/frontend-api-integration.md) 模板，写入 `$BASE_DIR/design/frontend/api-integration.md`

## 确认

Read 工具读取两份文件，AskUserQuestion：
> 前端详细设计已生成（components + api-integration），确认？
> - **A)** 确认，进入工程评审
> - **B)** 需要修改
> - **C)** 重新执行

确认后更新 `phases.frontendDetail = true`。