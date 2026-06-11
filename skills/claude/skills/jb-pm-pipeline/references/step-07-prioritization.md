# Step 7: 优先级排序（Prioritization）

## 7.1 检查是否已完成

如果 `phases.prioritization == true` 且 `prioritization.md` 存在：

AskUserQuestion（同 [Step 1 复用逻辑](step-01-jtbd-problem.md#11-检查是否已完成)）。

## 7.2 执行 /prioritization-advisor

```js
Skill({
  skill: "prioritization-advisor",
  args: "基于以下用户故事地图，对功能和故事进行优先级排序：\n{user-story-map.md 内容}\n\n---\n📎 **外部需求文档参考**（来自 {larkDocUrl}）：\n{EXTERNAL_DOC}"
})
```

## 7.3 产出 prioritization.md

使用 Write 工具创建 `$BASE_DIR/prioritization.md`，基于模板 [templates/prioritization.md](templates/prioritization.md) 填充内容。

## 7.4 人工确认

Read 工具读取 `prioritization.md`，AskUserQuestion 确认。

更新 `phases.prioritization = true`。