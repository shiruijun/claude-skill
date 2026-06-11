# Step 6: 完成

## 执行

1. 生成 `README.md`
2. 更新状态文件为 `completed`
3. 输出完成报告

## 产出

**`$BASE_DIR/README.md`：**

```markdown
# {ticketId} {featureName} — 技术设计

| 阶段 | 文档 | 状态 |
|------|------|------|
| 代码预分析 | [design/codegraph-summary.md](./design/codegraph-summary.md) | ✅ |
| 技术头脑风暴 | [design/brainstorm.md](./design/brainstorm.md) | ✅ |
| 后端架构设计 | [design/backend/architecture.md](./design/backend/architecture.md) | ✅ |
| 后端详细设计 | [design/backend/database.md](./design/backend/database.md) + [design/backend/api.md](./design/backend/api.md) | ✅ |
| 前端架构设计 | [design/frontend/architecture.md](./design/frontend/architecture.md) | ✅ |
| 前端详细设计 | [design/frontend/components.md](./design/frontend/components.md) + [design/frontend/api-integration.md](./design/frontend/api-integration.md) | ✅ |
| 工程评审 | [design/eng-review.md](./design/eng-review.md) | ✅ |
| 实施计划 | [plans/plan.md](./plans/plan.md) | ✅ |
```

**状态更新：**

```bash
TICKET_STATE_FILE=".jb-td-pipeline/{ticketId}.json"

cat > "$TICKET_STATE_FILE" << EOF
{
  "version": "1.0.0",
  "status": "completed",
  "ticketId": "{ticketId}",
  "featureName": "{featureName}",
  "baseDir": "{baseDir}",
  "prdPath": "{prdPath}",
  "phases": {
    "codegraph": true,
    "brainstorm": true,
    "backendArch": true,
    "backendDetail": true,
    "frontendArch": true,
    "frontendDetail": true,
    "engReview": true,
    "implementationPlan": true
  },
  "completedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
```

**完成报告：**

```
✅ 技术设计流水线完成

📄 {baseDir}/design/codegraph-summary.md
📄 {baseDir}/design/brainstorm.md
📄 {baseDir}/design/backend/architecture.md
📄 {baseDir}/design/backend/database.md
📄 {baseDir}/design/backend/api.md
📄 {baseDir}/design/frontend/architecture.md
📄 {baseDir}/design/frontend/components.md
📄 {baseDir}/design/frontend/api-integration.md
📄 {baseDir}/design/eng-review.md
📄 {baseDir}/plans/plan.md
📄 {baseDir}/README.md

下一步：
- 开发团队基于 plans/plan.md 进入编码实现阶段
- 可调用 /jb-gm-pipeline 进行完整的工程交付
- 或调用 superpowers:executing-plans / superpowers:subagent-driven-development 直接执行
```
