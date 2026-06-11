# Step 6: 代码审查（/review + /codex）

## 6.1 检查是否已完成

如果 `phases.codeReview == true`：

AskUserQuestion：
> 代码审查已完成，是否重新审查？
> - A) 跳过，进入验证
> - B) 重新审查

## 6.2 执行 /review

```
Skill({
  skill: "review",
  args: "对当前分支进行 PR 前审查，关注：\n1. 生产环境 bug\n2. 边界情况\n3. 测试覆盖\n4. 性能问题"
})
```

## 6.3 执行 /codex（第二意见，可选）

如需 OpenAI Codex 的第二意见：
```
Skill({
  skill: "codex",
  args: "对以下代码变更提供第二意见审查：\n{git diff 内容}"
})
```

## 6.4 产出 review-report.md（可选）

如审查发现重大问题，使用 [templates/review-report.md](templates/review-report.md) 模板，写入 `$BASE_DIR/review-report.md`。

## 6.5 人工确认

审查通过后更新 `phases.codeReview = true`。