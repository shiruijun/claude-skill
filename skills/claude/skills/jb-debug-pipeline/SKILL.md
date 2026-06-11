# 经贝生产环境 Bug 修复流水线（JB Debug Pipeline）

系统化地定位、分析、修复**生产环境**中的 Bug，产出经过验证的可合并 hotfix 分支。

> **核心原则**：先复现 → hotfix 分支隔离 → 根因分析 → 方案设计 → TDD 修复 → 两阶段审查 → 回归验证 → 分支收尾（tag + cherry-pick）。每个阶段必须有产出，每个质量门禁必须通过。
>
> **铁律**：没有根因分析，不允许提出修复方案。症状修复即失败。
>
> **适用范围**：仅处理生产环境（P0/P1/P2）Bug。测试环境 Bug 走正常开发流程。

## 前置条件

- 已明确生产环境 Bug 编号（飞书需求 ID 或内部 Bug ID）
- 当前目录下存在 `ai-doc/bugfix/` 目录结构
- Git 仓库状态干净，无未提交修改
- 已确认 Bug 影响的生产版本

## 整体流程

| Step | 阶段 | Agent/Skill | 产出文档 | 参考 |
|------|------|------------|---------|------|
| 0 | 输入解析与状态初始化 | — | — | [step-00-init](references/step-00-init.md) |
| 1 | 生产 Bug 复现 | — | `reproduce/bug-reproduction-report.md` | [step-10-bug-reproduction](references/step-10-bug-reproduction.md) |
| 1b | Hotfix 分支设置 | `superpowers:using-git-worktrees` | — | [step-11-hotfix-branch-setup](references/step-11-hotfix-branch-setup.md) |
| 2 | 根因分析 | `superpowers:systematic-debugging` | `analysis/root-cause-analysis.md` | [step-20-root-cause-analysis](references/step-20-root-cause-analysis.md) |
| 3 | 修复方案设计 | — | `analysis/fix-design.md` | [step-30-fix-design](references/step-30-fix-design.md) |
| 4 | TDD 修复 | `tdd-guide` | `test/tdd-report.md` | [step-40-tdd-fix](references/step-40-tdd-fix.md) |
| 5 | 代码审查 | `code-reviewer` | `review/code-review-report.md` | [step-50-code-review](references/step-50-code-review.md) |
| 6 | 回归测试验证 | — | `test/regression-test-report.md` | [step-60-regression-test](references/step-60-regression-test.md) |
| 7 | 完成收尾（tag + cherry-pick） | `superpowers:finishing-a-development-branch` | `deploy/hotfix-deployment.md` | [step-70-finish](references/step-70-finish.md) |
| 8 | 完成 | — | `README-fix.md` | [step-80-completion](references/step-80-completion.md) |

> 各阶段产出文档的 Markdown 模板参见 [references/templates/](references/templates/)。

## 状态机

```
NO_STATE ──→ initialized ──→ completed
```

| 状态 | 说明 | 处理 |
|------|------|------|
| `NO_STATE` | 首次使用 | 创建状态文件，进入 Step 1 |
| `initialized` | 正常执行中 | 按 Step 0→8 顺序推进 |
| `completed` | Bug 修复已完成 | 询问复用/查看/新建 |

## 执行入口

解析用户输入得到 BUG_ID 后：
1. 读取 `.jb-debug-pipeline/active.json` 获取活跃 bug
2. 读取 `.jb-debug-pipeline/${BUG_ID}.json` 获取 phases 状态
3. 找到第一个 `false` 的 phase，跳转到对应 Step

## 中断恢复

| phases 状态 | 从哪继续 | 参考 |
|-------------|---------|------|
| `bugReproduction=false` | Step 1 | [step-10](references/step-10-bug-reproduction.md) |
| `hotfixBranchSetup=false` | Step 1b | [step-11](references/step-11-hotfix-branch-setup.md) |
| `rootCauseAnalysis=false` | Step 2 | [step-20](references/step-20-root-cause-analysis.md) |
| `fixDesign=false` | Step 3 | [step-30](references/step-30-fix-design.md) |
| `tddFix=false` | Step 4 | [step-40](references/step-40-tdd-fix.md) |
| `codeReview=false` | Step 5 | [step-50](references/step-50-code-review.md) |
| `regressionTest=false` | Step 6 | [step-60](references/step-60-regression-test.md) |
| `finish=false` | Step 7 | [step-70](references/step-70-finish.md) |
| 全部为 true | Step 8 | [step-80](references/step-80-completion.md) |

## 附录

### 附录 A: 与 systematic-debugging 的衔接

| systematic-debugging 阶段 | jb-debug-pipeline 对应 |
|---------------------------|------------------------|
| Phase 1: Root Cause Investigation | Step 2 根因分析 |
| Phase 2: Pattern Analysis | Step 2 根因分析 |
| Phase 3: Hypothesis and Testing | Step 2 根因分析 |
| Phase 4: Implementation | Step 4 TDD 修复 |

### 附录 B: 强制质量门禁

| 阶段 | 门禁 | 要求 |
|------|------|------|
| Bug 复现 | 可复现性 | 必须有稳定的复现步骤 |
| Hotfix 分支 | 分支正确性 | 必须从 master 创建，命名规范 |
| 根因分析 | 根因确认 | 必须明确 WHAT 和 WHY |
| 修复方案 | 方案评审 | 无架构级反对意见 |
| TDD 修复 | 测试覆盖率 | >= 80% 行覆盖 |
| 代码审查 | 问题级别 | 无 CRITICAL / HIGH |
| 回归测试 | 编译+测试 | 全部通过，无原有测试被破坏 |

### 附录 C: 模型选择建议

| 任务类型 | 推荐模型 |
|---------|---------|
| 简单 Bug 复现（单组件） | Haiku 4.5 |
| 标准 Bug 分析与修复 | Sonnet 4.6 |
| 复杂根因分析 / 架构级 Bug | Opus 4.6 |
| 安全相关 Bug 修复 | Opus 4.6 |

### 附录 D: 红灯信号 — 立即停止并回归根因分析

如果在修复过程中出现以下情况，**立即停止，返回 Step 2**：

- "先临时修一下，后面再仔细查"
- "改一下试试，看行不行"
- 一次修改多个地方试图"碰运气"
- "虽然不太懂，但这应该能工作"
- 已连续尝试 3 次修复仍未解决问题
- 每次修复都在新地方引发新问题
