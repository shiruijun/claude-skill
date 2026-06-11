# Step 7: 完成收尾（Finishing Branch）

> **策略**：调用 finishing-a-development-branch skill 完成分支收尾。

## 检查

如果 `phases.finish == true`：

AskUserQuestion（复用/重新执行逻辑同上）。

## 执行

调用 `superpowers:finishing-a-development-branch` skill。

流程：
1. 验证所有测试通过（已在上一步确认）
2. 确定 base branch
3. 向用户呈现 4 个选项：
   - 本地合并回 base branch
   - Push 并创建 Pull Request
   - 保持分支不变（稍后处理）
   - 丢弃本次工作
4. 执行用户选择

## 确认

AskUserQuestion 确认选项选择。

确认后更新 `phases.finish = true`。
