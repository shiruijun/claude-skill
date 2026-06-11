---
name: jb-finish-sync
description: |
  经贝需求完成同步流水线。在 jb-dev-pipeline 完成后触发，对 PRD、技术设计文档、测试用例进行逆向对账和同步，
  产出 sync-report.md 作为变更历史记录。触发词：/jb-finish-sync
version: 1.0.0
source: superpowers-driven
---

# 经贝需求完成同步流水线（JB Finish Sync）

在 `jb-dev-pipeline` 完成后，对 PRD、技术设计文档、测试用例进行**逆向对账**，确保文档与代码实现保持同步，产出变更历史记录。

> **核心原则**：文档是代码的镜子，不是代码的预言机。实现后的文档同步比设计时的文档预测更有价值。

## 前置条件

- `jb-dev-pipeline` 已完成（`.jb-dev-pipeline/${TICKET}.json` 中 `status` = `completed`）
- 当前目录下存在 `ai-doc/迭代/` 目录结构
- 存在 `jb-dev-pipeline` 的 `CHANGELOG-impl.md`（代码变更记录）

## 整体流程

| Step | 阶段 | Agent/Skill | 产出文档 | 参考 |
|------|------|------------|---------|------|
| 0 | 输入解析与状态初始化 | — | — | [step-00-init](references/step-00-init.md) |
| 1 | PRD 现状对账 | `superpowers:systematic-debugging` | `prd.md`（状态更新） | [step-10-prd-sync](references/step-10-prd-sync.md) |
| 2 | 后端设计同步 | `code-reviewer` + `architect` | `design/backend/*.md` | [step-20-backend-sync](references/step-20-backend-sync.md) |
| 3 | 前端设计同步 | `code-reviewer` + `architect` | `design/frontend/*.md` | [step-30-frontend-sync](references/step-30-frontend-sync.md) |
| 4 | 测试用例同步 | `qa` | `test/case/cases.md` | [step-40-testcase-sync](references/step-40-testcase-sync.md) |
| 5 | 变更报告生成 | — | `sync-report.md` | [step-50-sync-report](references/step-50-sync-report.md) |
| 6 | 完成 | — | — | [step-60-completion](references/step-60-completion.md) |

## 状态机

```
NO_STATE ──→ initialized ──→ completed
```

| 状态 | 说明 | 处理 |
|------|------|------|
| `NO_STATE` | 首次使用 | 检查前置条件，创建状态文件，进入 Step 1 |
| `initialized` | 正常执行中 | 按 Step 1→6 顺序推进 |
| `completed` | 同步已完成 | 询问查看报告或开始新的同步 |

## 执行入口

解析用户输入得到 TICKET 后：
1. 读取 `.jb-finish-sync/active.json` 获取活跃 ticket
2. 读取 `.jb-finish-sync/${TICKET}.json` 获取 phases 状态
3. 找到第一个 `false` 的 phase，跳转到对应 Step

## 中断恢复

| phases 状态 | 从哪继续 | 参考 |
|-------------|---------|------|
| `inputCheck=false` | Step 0 | [step-00](references/step-00-init.md) |
| `prdSync=false` | Step 1 | [step-10](references/step-10-prd-sync.md) |
| `backendSync=false` | Step 2 | [step-20](references/step-20-backend-sync.md) |
| `frontendSync=false` | Step 3 | [step-30](references/step-30-frontend-sync.md) |
| `testcaseSync=false` | Step 4 | [step-40](references/step-40-testcase-sync.md) |
| `syncReport=false` | Step 5 | [step-50](references/step-50-sync-report.md) |
| 全部为 true | Step 6 | [step-60](references/step-60-completion.md) |

## 偏差分级标准

| 级别 | 定义 | 同步策略 |
|------|------|---------|
| **CRITICAL** | 严重违背设计意图，架构级问题 | 高亮告警，写入 sync-report，要求人工确认 |
| **HIGH** | 实现与设计有重大偏差，可能影响功能 | 写入 sync-report 作为技术债 |
| **MEDIUM** | 细节偏差（字段命名、参数、边界条件） | 写入 sync-report，附自动化修复建议 |
| **LOW** | 风格/naming 不一致 | 仅记录，不展示给用户 |

## 与 jb-dev-pipeline 的衔接

| jb-dev-pipeline 产出 | jb-finish-sync 输入 |
|---------------------|---------------------|
| `CHANGELOG-impl.md` | 代码变更文件清单 |
| `test/test-report.md` | 测试通过/失败状态 |
| `review/code-review-report.md` | 代码审查发现的问题 |
| `review/security-review-report.md` | 安全审查发现的问题 |

## 附录

### 附录 A: 文档同步策略

| 文档 | 处理方式 | 说明 |
|------|---------|------|
| `prd.md` | 部分更新 | 只更新功能点状态、验收标准达成情况，不改原始需求描述 |
| `design/backend/*.md` | 覆盖更新 | 以代码实现为准更新 |
| `design/frontend/*.md` | 覆盖更新 | 以代码实现为准更新 |
| `test/case/cases.md` | 覆盖更新 | 以代码实现和测试结果为准更新 |
| `sync-report.md` | 新增 | 记录所有偏差和技术债，作为变更历史 |

### 附录 B: 强制质量门禁

| 阶段 | 门禁 | 要求 |
|------|------|------|
| PRD 对账 | 功能点覆盖 | 必须逐一检查每个功能点是否在代码中有对应实现 |
| 设计同步 | 偏差记录 | 所有 CRITICAL/HIGH 必须记录到 sync-report |
| 测试用例同步 | 覆盖率检查 | 统计实际代码中有多少比例有对应测试用例 |
| 变更报告 | 完成性 | 必须包含：偏差清单、技术债、分级告警、文档同步摘要 |

### 附录 C: 模型选择建议

| 任务类型 | 推荐模型 |
|---------|---------|
| 文档对账（轻量分析） | Haiku 4.5 |
| 代码与设计对比（多文件） | Sonnet 4.6 |
| CRITICAL 偏差分析 / 架构级问题 | Opus 4.6 |
| 测试用例对账 | Sonnet 4.6 |
