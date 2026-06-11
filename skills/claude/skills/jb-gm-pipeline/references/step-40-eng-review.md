# Step 4: 工程锁定（/plan-eng-review + /autoplan）

## 4.1 检查是否已完成

如果 `phases.engReview == true` 且 `plans/plan.md` 存在：

AskUserQuestion：
> plans/plan.md 已存在，复用还是重新执行？
> - A) 复用
> - B) 重新执行

## 4.2 执行 /plan-eng-review

```
Skill({
  skill: "plan-eng-review",
  args: "基于以下需求锁定工程方案：\n{spec.md 内容}\n\n{design-review.md 内容}"
})
```

## 4.3 执行 /autoplan（可选，快速模式）

如果用户选择快速模式，直接调用 `/autoplan` 一次性完成 CEO → design → eng → DX 评审：

```
Skill({
  skill: "autoplan",
  args: "基于以下需求自动运行完整规划评审：\n{spec.md 内容}"
})
```

## 4.4 产出 plans/plan.md

使用 [templates/plan.md](templates/plan.md) 模板，写入 `$BASE_DIR/plans/plan.md`。

## 4.5 人工确认

Read 工具读取 plans/plan.md，AskUserQuestion 确认。

更新 `phases.engReview = true`。
