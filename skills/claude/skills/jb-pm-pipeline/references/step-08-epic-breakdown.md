# Step 8: 故事拆分（Epic Breakdown）

## 8.1 检查是否已完成

如果 `phases.epicBreakdown == true` 且 `epics.md` 存在：

AskUserQuestion（同 [Step 1 复用逻辑](step-01-jtbd-problem.md#11-检查是否已完成)）。

## 8.2 执行 /epic-breakdown-advisor

```js
Skill({
  skill: "epic-breakdown-advisor",
  args: "基于以下优先级排序和用户故事地图，拆分成可交付的 Epic 和用户故事：\n{prioritization.md 内容}\n\n{user-story-map.md 内容}\n\n---\n📎 **外部需求文档参考**（来自 {larkDocUrl}）：\n{EXTERNAL_DOC}"
})
```

## 8.3 产出 epics.md

使用 Write 工具创建 `$BASE_DIR/epics.md`，基于模板 [templates/epics.md](templates/epics.md) 填充内容。

## 8.4 人工确认

Read 工具读取 `epics.md`，AskUserQuestion 确认。

更新 `phases.epicBreakdown = true`。