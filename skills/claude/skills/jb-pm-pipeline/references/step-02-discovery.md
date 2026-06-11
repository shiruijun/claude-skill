# Step 2: 发现流程（Discovery Process）

## 2.1 检查是否已完成

如果 `phases.discoveryProcess == true` 且 `discovery-report.md` 存在：

AskUserQuestion（同 [Step 1 复用逻辑](step-01-jtbd-problem.md#11-检查是否已完成)）。

## 2.2 执行 /discovery-process

```js
Skill({
  skill: "discovery-process",
  args: "基于以下问题陈述 orchestrate 完整发现流程：\n{problem-statement.md 内容}\n\n---\n📎 **外部需求文档参考**（来自 {larkDocUrl}）：\n{EXTERNAL_DOC}"
})
```

## 2.3 产出 discovery-report.md

使用 Write 工具创建 `$BASE_DIR/discovery-report.md`，基于模板 [templates/discovery-report.md](templates/discovery-report.md) 填充内容。

## 2.4 人工确认

Read 工具读取 `discovery-report.md`，AskUserQuestion 确认。

更新 `phases.discoveryProcess = true`。
