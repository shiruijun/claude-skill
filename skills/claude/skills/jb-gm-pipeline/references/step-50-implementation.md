# Step 5: 编码实现

## 5.1 检查是否已完成

如果 `phases.implementation == true`：

AskUserQuestion：
> 编码实现阶段已完成，是否重新进入开发？
> - A) 跳过，进入审查
> - B) 继续开发

## 5.2 开发模式选择

AskUserQuestion：
> 选择开发模式：
> - A) 自主开发（直接编码）
> - B) 结对编程（/pair-agent）
> - C) 谨慎模式（/careful — 高 stakes 场景）

**选 A**：直接根据 plans/plan.md 开始编码实现。

**选 B**：
```
Skill({
  skill: "pair-agent",
  args: "基于以下实施计划开始结对编程：\n{plans/plan.md 内容}"
})
```

**选 C**：
```
Skill({
  skill: "careful",
  args: "基于以下实施计划进入谨慎开发模式：\n{plans/plan.md 内容}"
})
```

## 5.3 上下文保存（可选）

开发过程中如需中断，调用 `/context-save` 保存当前工作状态：
```
Skill({
  skill: "context-save",
  args: "保存当前开发上下文，ticket: {ticketId}"
})
```

## 5.4 产出实现标记

无需产出新文档，以 git commit 和代码变更作为交付物。

更新 `phases.implementation = true`。