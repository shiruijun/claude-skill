# Step 3: 设计方案（/plan-design-review）

## 3.1 检查是否已完成

如果 `phases.designReview == true` 且 `design-review.md` 存在：

AskUserQuestion（复用/重新执行逻辑同上）。

## 3.2 执行 /plan-design-review

```
Skill({
  skill: "plan-design-review",
  args: "基于以下需求和战略评估进行设计评审：\n{spec.md 内容}\n\n{ceo-review.md 内容}"
})
```

## 3.3 产出 design-review.md

使用 [templates/design-review.md](templates/design-review.md) 模板，写入 `$BASE_DIR/design-review.md`。

## 3.4 人工确认

更新 `phases.designReview = true`。
