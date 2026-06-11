# Step 3: 用户理解（Customer Understanding）

## 3.1 检查是否已完成

如果 `phases.customerUnderstanding == true` 且 `persona.md` 和 `journey-map.md` 存在：

AskUserQuestion（同 [Step 1 复用逻辑](step-01-jtbd-problem.md#11-检查是否已完成)）。

## 3.2 执行 /proto-persona

```js
Skill({
  skill: "proto-persona",
  args: "基于以下发现报告创建用户画像：\n{discovery-report.md 内容}\n\n---\n📎 **外部需求文档参考**（来自 {larkDocUrl}）：\n{EXTERNAL_DOC}"
})
```

## 3.3 执行 /customer-journey-map

基于 persona 输出：

```js
Skill({
  skill: "customer-journey-map",
  args: "基于以下用户画像绘制客户旅程地图：\n{proto-persona 输出}\n\n---\n📎 **外部需求文档参考**（来自 {larkDocUrl}）：\n{EXTERNAL_DOC}"
})
```

## 3.4 产出 persona.md 与 journey-map.md

使用 Write 工具创建两个文件：
- `$BASE_DIR/persona.md` — 基于 [templates/persona.md](templates/persona.md)
- `$BASE_DIR/journey-map.md` — 基于 [templates/journey-map.md](templates/journey-map.md)

## 3.5 人工确认

Read 工具读取 `persona.md` 和 `journey-map.md`，AskUserQuestion 确认。

更新 `phases.customerUnderstanding = true`。
