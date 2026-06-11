# Step 5: 反向验证（Press Release）

## 5.1 检查是否已完成

如果 `phases.pressRelease == true` 且 `press-release.md` 存在：

AskUserQuestion（同 [Step 1 复用逻辑](step-01-jtbd-problem.md#11-检查是否已完成)）。

## 5.2 执行 /press-release

```js
Skill({
  skill: "press-release",
  args: "基于以下机会解决方案树，撰写内部新闻稿反向验证价值：\n{opportunity-solution-tree.md 内容}\n\n---\n📎 **外部需求文档参考**（来自 {larkDocUrl}）：\n{EXTERNAL_DOC}"
})
```

## 5.3 产出 press-release.md

使用 Write 工具创建 `$BASE_DIR/press-release.md`，基于模板 [templates/press-release.md](templates/press-release.md) 填充内容。

## 5.4 人工确认

Read 工具读取 `press-release.md`，AskUserQuestion：
> 确认 press-release.md？如果新闻稿无法让人兴奋，建议回到 Step 4 重新评估机会。
> - A) 确认，进入下一步
> - B) 需要修改
> - C) 回到 Step 4 重新评估

确认后更新 `phases.pressRelease = true`。
