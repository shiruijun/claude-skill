# Step 7: 设计验证（/design-review + /qa + /browse）

## 7.1 检查是否已完成

如果 `phases.qaVerification == true`：

AskUserQuestion：
> 验证已完成，是否重新验证？
> - A) 跳过，进入发布
> - B) 重新验证

## 7.2 执行 /design-review（实时站点审查）

如前端有可见变更：
```
Skill({
  skill: "design-review",
  args: "对当前部署进行视觉审计，检查设计质量、一致性、响应式。"
})
```

## 7.3 执行 /qa（浏览器自动化测试）

```
Skill({
  skill: "qa",
  args: "打开真实浏览器，测试以下用户流程：\n1. 功能主流程\n2. 边界情况\n3. 错误处理\n4. 响应式布局"
})
```

## 7.4 执行 /qa-only（仅报告模式，可选）

如不想自动修复，只生成报告：
```
Skill({
  skill: "qa-only",
  args: "对当前功能进行 QA 测试，仅生成报告不自动修复。"
})
```

## 7.5 执行 /browse（页面检查）

如需要检查特定页面：
```
Skill({
  skill: "browse",
  args: "导航到功能页面，验证状态、截图、响应式布局。"
})
```

## 7.6 产出 qa-report.md

使用 [templates/qa-report.md](templates/qa-report.md) 模板，写入 `$BASE_DIR/qa-report.md`。

## 7.7 人工确认

验证通过后更新 `phases.qaVerification = true`。