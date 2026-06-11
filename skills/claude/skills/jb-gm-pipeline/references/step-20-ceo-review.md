# Step 2: 战略确认（/plan-ceo-review）

## 2.1 检查是否已完成

如果 `phases.ceoReview == true` 且 `ceo-review.md` 存在：

AskUserQuestion（复用/重新执行逻辑同上）。

## 2.2 执行 /plan-ceo-review

```
Skill({
  skill: "plan-ceo-review",
  args: "基于以下需求进行战略评审：\n{spec.md 内容}"
})
```

## 2.3 产出 ceo-review.md

使用 [templates/ceo-review.md](templates/ceo-review.md) 模板，写入 `$BASE_DIR/ceo-review.md`。

## 2.4 人工确认

Read 工具读取 ceo-review.md，AskUserQuestion 确认。

更新 `phases.ceoReview = true`。
