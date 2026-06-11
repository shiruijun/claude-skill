# Step 6: 完成

## 执行

### 6.1 更新状态文件

```bash
TICKET_STATE_FILE=".jb-finish-sync/${TICKET_ID}.json"

cat > "$TICKET_STATE_FILE" << EOF
{
  "version": "1.0.0",
  "status": "completed",
  "ticketId": "$TICKET_ID",
  "featureName": "$FEATURE_NAME",
  "baseDir": "$BASE_DIR",
  "version": "$VERSION",
  "phases": {
    "inputCheck": true,
    "prdSync": true,
    "backendSync": true,
    "frontendSync": true,
    "testcaseSync": true,
    "syncReport": true
  },
  "completedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "summary": {
    "prdFeatures": {
      "total": n,
      "implemented": n,
      "partial": n,
      "notImplemented": n
    },
    "deviations": {
      "critical": n,
      "high": n,
      "medium": n,
      "low": n
    },
    "testCoverage": {
      "backend": "nn%",
      "frontend": "nn%"
    }
  }
}
EOF
```

### 6.2 更新 / 创建 README

在 `$BASE_DIR/README.md` 中追加同步完成状态：

```markdown
## 文档同步状态

> 以下内容由 jb-finish-sync 自动生成

| 阶段 | 文档 | 同步状态 | 完成时间 |
|------|------|---------|---------|
| PRD 对账 | `prd.md` | ✅ 已同步 | {DATE} |
| 后端设计同步 | `design/backend/*.md` | ✅ 已同步 | {DATE} |
| 前端设计同步 | `design/frontend/*.md` | ✅ 已同步 | {DATE} |
| 测试用例同步 | `test/case/cases.md` | ✅ 已同步 | {DATE} |
| 变更报告 | `sync-report.md` | ✅ 已生成 | {DATE} |

---

**同步报告**：[sync-report.md](./sync-report.md)
```

### 6.3 输出完成报告

```
✅ 需求完成同步流水线完成

需求ID: {TICKET_ID}
功能名称: {FEATURE_NAME}
版本: {VERSION}

📄 变更报告: {BASE_DIR}/sync-report.md

同步结果摘要：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PRD 对账
  功能点：{n} 已实现 / {n} 部分 / {n} 未实现
  CRITICAL/HIGH 偏差：{n}

后端设计同步
  架构偏差：{n} | 数据库偏差：{n} | API 偏差：{n}

前端设计同步
  架构偏差：{n} | 组件偏差：{n} | API 偏差：{n}

测试覆盖率
  后端：{nn}% | 前端：{nn}%

偏差分级
  CRITICAL: {n} | HIGH: {n} | MEDIUM: {n} | LOW: {n}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ 需要人工确认的 CRITICAL 偏差：
  - {偏差1}
  - {偏差2}

💡 建议的后续行动：
  - 人工评审 CRITICAL 偏差
  - 将 HIGH 偏差纳入技术债 backlog
  - 补充未实现功能点的测试用例

下一步：
  → 发布评审（提交前确认）
  → 合并代码
```

## 状态：completed

如果用户再次输入同一 ticket：

AskUserQuestion：
> 检测到已有完成的同步报告：`{TICKET_ID} {FEATURE_NAME}`
>
> 请选择：
> - **A)** 开始新的同步（保留旧状态，输入新 ticket）
> - **B)** 查看已完成的 sync-report.md
> - **C)** 查看同步摘要
