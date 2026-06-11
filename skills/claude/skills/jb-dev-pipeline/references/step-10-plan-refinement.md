# Step 1a: 计划细化

> **策略**：将宏观 plan 细化为 bite-sized 代码级任务，每个任务可独立执行。

## 检查

如果 `phases.planRefinement == true` 且 `$BASE_DIR/plans/tasks.md` 存在：

AskUserQuestion：
> `plans/tasks.md` 已存在，复用还是重新执行？
> - **A)** 复用
> - **B)** 重新执行

## 执行

基于 `plans/plan.md` 中的后端任务和前端任务，细化为 **bite-sized 代码级任务**。

每个任务必须包含：
- 目标文件路径
- 变更类型（新增/修改/删除）
- 具体执行步骤（原子级）
- 验收标准（可验证）
- 依赖的前置任务

## 产出

使用 [templates/tasks.md](templates/tasks.md) 模板，写入 `$BASE_DIR/plans/tasks.md`。

## 确认

Read 工具读取 `tasks.md`，AskUserQuestion：
> `tasks.md` 确认？
> - **A)** 确认，进入 Git 设置
> - **B)** 需要修改
> - **C)** 重新执行

确认后更新 `phases.planRefinement = true`。