# Step 1: 需求澄清（/office-hours）

## 1.1 检查是否已完成

如果 `phases.officeHours == true` 且 `spec.md` 存在：

AskUserQuestion：
> spec.md 已存在，复用还是重新执行？
> - A) 复用
> - B) 重新执行

## 1.2 执行 /office-hours

```
Skill({
  skill: "office-hours",
  args: "基于需求 {ticketId} 进行产品澄清：\n{featureName}\n\n请帮助澄清需求范围、用户场景、功能点。"
})
```

## 1.3 产出 spec.md

使用 [templates/spec.md](templates/spec.md) 模板，写入 `$BASE_DIR/spec.md`。

内容根据 /office-hours 输出填充。

## 1.4 人工确认

Read 工具读取 spec.md，AskUserQuestion：
> 确认 spec.md？
> - A) 确认，进入下一步
> - B) 需要修改
> - C) 重新执行 /office-hours

确认后更新 `phases.officeHours = true`。
