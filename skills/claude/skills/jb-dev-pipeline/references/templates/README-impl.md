---
ticket: {ticketId}
version: {从 prd.md 读取的版本号}
---

# {ticketId} {featureName} — 编码交付看板

| 阶段 | 文档 | 状态 |
|------|------|------|
| 计划细化 | [plans/tasks.md](./plans/tasks.md) | ✅ |
| Git 隔离 | feat/{ticketId}-{featureName} | ✅ |
| TDD | [test/tdd-report.md](./test/tdd-report.md) | ✅ |
| 编码实现 | [CHANGELOG-impl.md](./CHANGELOG-impl.md) | ✅ |
| 代码审查 | [review/code-review-report.md](./review/code-review-report.md) | ✅ |
| 安全审查 | [review/security-review-report.md](./review/security-review-report.md) | ✅ |
| 构建验证 | [test/test-report.md](./test/test-report.md) | ✅ |
| 分支收尾 | feat/{ticketId}-{featureName} | ✅ |

## 质量门禁

| 门禁 | 要求 | 结果 |
|------|------|------|
| 测试覆盖率 | >= 80% | ✅ 85% |
| 代码审查 | 无 CRITICAL / HIGH | ✅ 通过 |
| 安全审查 | 无 CRITICAL / HIGH | ✅ 通过 |
| 构建通过 | 编译 + 测试全部通过 | ✅ 通过 |
