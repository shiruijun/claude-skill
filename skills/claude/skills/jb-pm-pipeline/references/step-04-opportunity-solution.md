# Step 4: 机会与方案（Opportunity Solution Tree）

## 4.1 检查是否已完成

如果 `phases.opportunitySolution == true` 且 `opportunity-solution-tree.md` 存在：

AskUserQuestion（同 [Step 1 复用逻辑](step-01-jtbd-problem.md#11-检查是否已完成)）。

## 4.2 执行 /opportunity-solution-tree

```js
Skill({
  skill: "opportunity-solution-tree",
  args: "基于以下用户理解和旅程地图，构建机会解决方案树：\n{persona.md 内容}\n\n{journey-map.md 内容}\n\n---\n📎 **外部需求文档参考**（来自 {larkDocUrl}）：\n{EXTERNAL_DOC}"
})
```

## 4.3 产出 opportunity-solution-tree.md

使用 Write 工具创建 `$BASE_DIR/opportunity-solution-tree.md`，基于模板 [templates/opportunity-solution-tree.md](templates/opportunity-solution-tree.md) 填充内容。

## 4.4 人工确认

Read 工具读取 `opportunity-solution-tree.md`，AskUserQuestion 确认。

更新 `phases.opportunitySolution = true`。
