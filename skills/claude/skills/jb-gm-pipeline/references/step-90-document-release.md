# Step 9: 文档更新（/document-release）

## 9.1 检查是否已完成

如果 `phases.documentRelease == true`：

AskUserQuestion：
> 文档更新已完成，是否重新执行？
> - A) 完成流水线
> - B) 更新文档

## 9.2 执行 /document-release

```
Skill({
  skill: "document-release",
  args: "更新所有文档以匹配本次发布内容。"
})
```

## 9.3 产出 release-notes.md

使用 [templates/release-notes.md](templates/release-notes.md) 模板，写入 `$BASE_DIR/release-notes.md`。

## 9.4 人工确认

更新 `phases.documentRelease = true`。