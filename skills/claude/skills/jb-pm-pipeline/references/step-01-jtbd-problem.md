# Step 1: 明确雇佣目标（JTBD + Problem Statement）

## 1.1 检查是否已完成

如果 `phases.jtbdProblemStatement == true` 且 `problem-statement.md` 存在：

AskUserQuestion：
> problem-statement.md 已存在，复用还是重新执行？
> - A) 复用
> - B) 重新执行

## 1.2 收集用户补充信息

在正式开始需求分析前，询问用户是否有额外信息需要纳入设计：

AskUserQuestion：
> 除飞书文档外，是否有其他信息需要补充纳入本次需求设计？
> 例如：业务背景、特殊约束、已有讨论记录、竞品参考、相关代码位置、技术限制等。
> - A) 无补充，直接开始
> - B) 有补充信息（请在下方输入）

**如果选择 B**：
1. 将用户输入内容追加写入 `$BASE_DIR/additional-context.md`
2. 更新 ticket 状态文件：`additionalContext = true`
3. 将此内容保存为 `ADDITIONAL_CONTEXT` 变量，后续所有 Step 自动注入

**如果选择 A**：`ADDITIONAL_CONTEXT = ""`，状态不变。

## 1.3 执行 /jobs-to-be-done

```js
Skill({
  skill: "jobs-to-be-done",
  args: "基于需求 {ticketId} 明确用户要雇佣产品做什么：\n{featureName}\n\n请帮助定义 JTBD、触发场景和期望结果。\n\n---\n📎 **外部需求文档参考**（来自 {larkDocUrl}）：\n{EXTERNAL_DOC}\n\n📎 **用户补充信息**：\n{ADDITIONAL_CONTEXT}"
})
```

## 1.4 执行 /problem-statement

基于 `/jobs-to-be-done` 的输出：

```js
Skill({
  skill: "problem-statement",
  args: "基于以下 JTBD 分析，明确核心问题陈述：\n{jobs-to-be-done 输出}\n\n---\n📎 **外部需求文档参考**（来自 {larkDocUrl}）：\n{EXTERNAL_DOC}\n\n📎 **用户补充信息**：\n{ADDITIONAL_CONTEXT}"
})
```

## 1.5 产出 problem-statement.md

使用 Write 工具创建 `$BASE_DIR/problem-statement.md`，基于模板 [templates/problem-statement.md](templates/problem-statement.md) 填充内容。

## 1.6 人工确认

Read 工具读取 `problem-statement.md`，AskUserQuestion：
> 确认 problem-statement.md？
> - A) 确认，进入下一步
> - B) 需要修改
> - C) 重新执行

确认后更新 `phases.jtbdProblemStatement = true`。
