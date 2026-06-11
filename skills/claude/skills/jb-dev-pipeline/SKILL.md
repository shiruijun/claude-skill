---
name: jb-dev-pipeline
description: 经贝编码交付流水线。基于 jb-td-pipeline 产出的技术设计，系统化完成代码开发、单元测试、代码审查、安全审查，产出可合并的代码分支。触发词：/jb-dev-pipeline、编码交付、开发实现
version: 1.0.0
source: superpowers-driven
---

# 经贝编码交付流水线（JB Dev Pipeline）

基于 `jb-td-pipeline` 产出的技术设计文档，系统化地完成代码开发、单元测试、代码审查、安全审查，产出可合并的代码分支。

> **核心原则**：测试先行 → 编码实现 → 两阶段审查 → 构建验证 → 分支收尾。每个阶段必须有产出，每个质量门禁必须通过。

## 前置条件

- `jb-td-pipeline` 已完成（`.jb-td-pipeline/{ticketId}.json` 中 `status` = `completed`）
- 当前目录下存在 `ai-doc/迭代/` 目录结构
- Git 仓库状态干净，无未提交修改

## 整体流程

| Step | 阶段 | Agent/Skill | 产出文档 | 参考 |
|------|------|------------|---------|------|
| 0 | 输入解析与状态初始化 | — | — | [step-00-init](references/step-00-init.md) |
| 1a | 计划细化 | — | plans/tasks.md | [step-10-plan-refinement](references/step-10-plan-refinement.md) |
| 1b | Git Worktree 设置 | superpowers:using-git-worktrees | — | [step-11-git-setup](references/step-11-git-setup.md) |
| 2 | 测试先行（TDD） | tdd-guide | test/tdd-report.md | [step-20-tdd](references/step-20-tdd.md) |
| 3 | 编码实现 | superpowers:subagent-driven-development | CHANGELOG-impl.md | [step-30-implementation](references/step-30-implementation.md) |
| 4 | 代码审查 | code-reviewer | review/code-review-report.md | [step-40-code-review](references/step-40-code-review.md) |
| 5 | 安全审查 | security-reviewer | review/security-review-report.md | [step-50-security-review](references/step-50-security-review.md) |
| 6 | 构建验证 | build-error-resolver | test/test-report.md | [step-60-build-verify](references/step-60-build-verify.md) |
| 7 | 完成收尾 | superpowers:finishing-a-development-branch | — | [step-70-finish](references/step-70-finish.md) |
| 8 | 完成 | — | README-impl.md | [step-80-completion](references/step-80-completion.md) |

> 各阶段产出文档的 Markdown 模板参见 [references/templates/](references/templates/)。

## 状态机

```
NO_STATE ──→ initialized ──→ completed
```

| 状态 | 说明 | 处理 |
|------|------|------|
| `NO_STATE` | 首次使用 | 创建状态文件，进入 Step 1a |
| `initialized` | 正常执行中 | 按 Step 0→8 顺序推进 |
| `completed` | 编码交付已完成 | 询问复用/查看/新建 |

## 执行入口

解析用户输入得到 TICKET 后：
1. 读取 `.jb-dev-pipeline/active.json` 获取活跃 ticket
2. 读取 `.jb-dev-pipeline/${TICKET}.json` 获取 phases 状态
3. 找到第一个 `false` 的 phase，跳转到对应 Step

## 中断恢复

| phases 状态 | 从哪继续 | 参考 |
|-------------|---------|------|
| `planRefinement=false` | Step 1a | [step-10](references/step-10-plan-refinement.md) |
| `gitSetup=false` | Step 1b | [step-11](references/step-11-git-setup.md) |
| `tdd=false` | Step 2 | [step-20](references/step-20-tdd.md) |
| `implementation=false` | Step 3 | [step-30](references/step-30-implementation.md) |
| `codeReview=false` | Step 4 | [step-40](references/step-40-code-review.md) |
| `securityReview=false` | Step 5 | [step-50](references/step-50-security-review.md) |
| `buildVerify=false` | Step 6 | [step-60](references/step-60-build-verify.md) |
| `finish=false` | Step 7 | [step-70](references/step-70-finish.md) |
| 全部为 true | Step 8 | [step-80](references/step-80-completion.md) |

## 附录

### 附录 A: 与 jb-td-pipeline 的衔接

| jb-td-pipeline 产出 | jb-dev-pipeline 输入 |
|---------------------|---------------------|
| `design/backend/architecture.md` | 编码依据 |
| `design/backend/api.md` | 接口实现依据 |
| `design/frontend/architecture.md` | 前端编码依据 |
| `design/frontend/components.md` | 组件实现依据 |
| `design/frontend/api-integration.md` | API 集成依据 |
| `plans/plan.md` | 细化为 `tasks.md` |

### 附录 B: 强制质量门禁

| 阶段 | 门禁 | 要求 |
|------|------|------|
| TDD | 测试覆盖率 | >= 80% 行覆盖 |
| 代码审查 | 问题级别 | 无 CRITICAL / HIGH |
| 安全审查 | 问题级别 | 无 CRITICAL / HIGH |
| 构建验证 | 编译+测试 | 全部通过 |

### 附录 C: 模型选择建议

| 任务类型 | 推荐模型 |
|---------|---------|
| 机械实现（1-2 文件） | Haiku 4.5 |
| 标准编码（多文件） | Sonnet 4.6 |
| 架构/审查/复杂调试 | Opus 4.6 |
| 安全审查 | Opus 4.6 |
