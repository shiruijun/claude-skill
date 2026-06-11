# Step 8: 完成

> **策略**：生成交付看板，更新状态为 completed。

## 执行

### 生成交付看板

使用 [templates/README-impl.md](templates/README-impl.md) 模板，写入 `$BASE_DIR/README-impl.md`。

### 更新状态

```bash
# 更新该需求的专属状态文件（保留，不删除）
cat > ".jb-dev-pipeline/{ticketId}.json" << EOF
{
  "version": "1.0.0",
  "status": "completed",
  "ticketId": "{ticketId}",
  "featureName": "{featureName}",
  "baseDir": "{baseDir}",
  "phases": {
    "planRefinement": true,
    "gitSetup": true,
    "tdd": true,
    "implementation": true,
    "codeReview": true,
    "securityReview": true,
    "buildVerify": true,
    "finish": true
  },
  "completedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

# active.json 保持不变（仍指向该需求，方便用户随时回到已完成的需求查看报告）
```

### 输出完成报告

```
✅ 编码交付流水线完成

📄 {baseDir}/plans/tasks.md              — 可执行任务清单
📄 {baseDir}/test/tdd-report.md          — TDD 报告
📄 {baseDir}/CHANGELOG-impl.md           — 实现变更记录
📄 {baseDir}/review/code-review-report.md    — 代码审查报告
📄 {baseDir}/review/security-review-report.md — 安全审查报告
📄 {baseDir}/test/test-report.md         — 测试报告
📄 {baseDir}/README-impl.md              — 交付看板
```
