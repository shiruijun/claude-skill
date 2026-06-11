# Step 10: 完成

## 10.1 生成 README.md

使用 [templates/README.md](templates/README.md) 模板，写入 `$BASE_DIR/README.md`。

## 10.2 执行 /retro（可选，团队复盘）

如团队需要复盘：
```
Skill({
  skill: "retro",
  args: "对本次 {ticketId} 的交付进行复盘。"
})
```

## 10.3 更新状态

```bash
cat > .jb-pm/state.json << EOF
{
  ...原内容...
  "status": "completed",
  "completedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
```

## 10.4 输出完成报告

```
✅ 工程交付流水线完成

📄 {baseDir}/spec.md
📄 {baseDir}/ceo-review.md
📄 {baseDir}/design-review.md
📄 {baseDir}/plans/plan.md
💻 代码变更（git commits）
📄 {baseDir}/review-report.md
📄 {baseDir}/qa-report.md
📄 {baseDir}/deploy-report.md
📄 {baseDir}/release-notes.md
📄 {baseDir}/README.md

下一步：功能已上线生产环境，进入运营监控阶段。
```