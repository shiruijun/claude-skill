# Step 5: 实施计划

## 检查

如果 `phases.implementationPlan == true` 且 `plans/plan.md` 存在：

AskUserQuestion（复用/重新执行逻辑同上）。

## 执行

基于所有设计文档，生成宏观实施计划。

## 产出

使用 [templates/plan.md](templates/plan.md) 模板，写入 `$BASE_DIR/plans/plan.md`。

## 确认

Read 工具读取，AskUserQuestion 确认。

确认后更新 `phases.implementationPlan = true`。