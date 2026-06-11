# Step 4: 工程评审

## 检查

如果 `phases.engReview == true` 且 `design/eng-review.md` 存在：

AskUserQuestion（复用/重新执行逻辑同上）。

## 执行

调用 `plan-eng-review`：

```
Skill({
  skill: "plan-eng-review",
  args: "基于以下技术设计进行工程评审：\n\nPRD：{prd.md 摘要}\n\n头脑风暴：{brainstorm.md 摘要}\n\n后端架构：{design/backend/architecture.md}\n后端数据库：{design/backend/database.md}\n后端 API：{design/backend/api.md}\n\n前端架构：{design/frontend/architecture.md}\n前端组件：{design/frontend/components.md}\n前端 API 集成：{design/frontend/api-integration.md}"
})
```

## 产出

使用 [templates/eng-review.md](templates/eng-review.md) 模板，写入 `$BASE_DIR/design/eng-review.md`。

## 确认

Read 工具读取，AskUserQuestion 确认。

如果评审结论为 **No-Go**，AskUserQuestion：
> 评审建议回到 Step 2 或 Step 3 修改设计。
> - **A)** 回到后端设计
> - **B)** 回到前端设计
> - **C)** 继续（接受风险）

确认后更新 `phases.engReview = true`。