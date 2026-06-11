# Step 6: 用户故事映射（User Story Mapping）

## 6.1 检查是否已完成

如果 `phases.userStoryMapping == true` 且 `user-story-map.md` 存在：

AskUserQuestion（同 [Step 1 复用逻辑](step-01-jtbd-problem.md#11-检查是否已完成)）。

## 6.2 执行 /user-story-mapping

```js
Skill({
  skill: "user-story-mapping",
  args: "基于以下新闻稿和机会树，规划用户故事地图和 MVP 范围：\n{press-release.md 内容}\n\n{opportunity-solution-tree.md 内容}\n\n---\n📎 **外部需求文档参考**（来自 {larkDocUrl}）：\n{EXTERNAL_DOC}"
})
```

## 6.3 产出 user-story-map.md

使用 Write 工具创建 `$BASE_DIR/user-story-map.md`，基于模板 [templates/user-story-map.md](templates/user-story-map.md) 填充内容。

## 6.4 人工确认

Read 工具读取 `user-story-map.md`，AskUserQuestion 确认。

更新 `phases.userStoryMapping = true`。
