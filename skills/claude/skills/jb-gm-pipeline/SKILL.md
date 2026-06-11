---
name: jb-gm-pipeline
description: |
  经贝工程交付主流程（Engineering Delivery Pipeline）。
  基于 garrytan/gstack 的 AI 工程工作流，从规划到发布的完整软件工厂。

  核心阶段：需求澄清 → 战略确认 → 设计方案 → 工程锁定 → 编码实现 → 代码审查 → 设计验证 → 发布上线 → 文档更新。

  触发词：/jb-gm-pipeline、产品流水线、工程交付流水线
version: 1.0.0
source: superpowers-driven
---

# 经贝工程交付流水线（JB GM Pipeline）

基于 gstack 的 AI 工程工作流，从规划到发布的完整软件工厂。

---

## 前置条件

必须已执行 `/jb-pm-init` 完成初始化，`.jb-pm/state.json` 存在且 `status == initialized`。

如果未初始化，输出错误并提示先运行 `/jb-pm-init`。

---

## 整体流程

| Step | 阶段 | Skill / 模式 | 产出文档 | 参考 |
|------|------|-------------|---------|------|
| 0 | 状态读取与初始化 | — | state.json | [step-00](references/step-00-init.md) |
| 1 | 需求澄清 | /office-hours | spec.md | [step-10](references/step-10-office-hours.md) |
| 2 | 战略确认 | /plan-ceo-review | ceo-review.md | [step-20](references/step-20-ceo-review.md) |
| 3 | 设计方案 | /plan-design-review | design-review.md | [step-30](references/step-30-design-review.md) |
| 4 | 工程锁定 | /plan-eng-review + /autoplan | plans/plan.md | [step-40](references/step-40-eng-review.md) |
| 5 | 编码实现 | 自主开发 / /pair-agent / /careful | 代码变更 | [step-50](references/step-50-implementation.md) |
| 6 | 代码审查 | /review + /codex | review-report.md | [step-60](references/step-60-code-review.md) |
| 7 | 设计验证 | /design-review + /qa + /browse | qa-report.md | [step-70](references/step-70-qa-verification.md) |
| 8 | 发布上线 | /ship + /land-and-deploy + /canary | deploy-report.md | [step-80](references/step-80-ship.md) |
| 9 | 文档更新 | /document-release | release-notes.md | [step-90](references/step-90-document-release.md) |
| 10 | 完成 | — | README.md | [step-100](references/step-100-completion.md) |

## 状态机

```
NO_STATE ──→ waiting-ticket-number ──→ initialized ──→ completed
```

| 状态 | 说明 | 处理 |
|------|------|------|
| `NO_STATE` | 首次使用 | 自动调用 `/jb-pm-init` |
| `waiting-ticket-number` | 等待飞书编号 | 接收编号后完成初始化 |
| `initialized` | 正常执行中 | 按 Step 0~10 顺序推进 |
| `completed` | 当前需求已完成 | 询问是否开始新需求 |

状态文件：`.jb-pm/state.json`

## 执行入口

解析用户输入得到 TICKET 后：
1. 读取 `.jb-pm/state.json` 获取当前状态
2. 读取 `phases` 完成状态
3. 找到第一个 `false` 的 phase，跳转到对应 Step 继续执行

## 中断恢复

读取 `state.json`，根据 `phases` 中第一个 `false` 的字段定位断点：

| phases 状态 | 从哪继续 | 参考 |
|-------------|---------|------|
| `officeHours=false` | Step 1 | [step-10](references/step-10-office-hours.md) |
| `ceoReview=false` | Step 2 | [step-20](references/step-20-ceo-review.md) |
| `designReview=false` | Step 3 | [step-30](references/step-30-design-review.md) |
| `engReview=false` | Step 4 | [step-40](references/step-40-eng-review.md) |
| `implementation=false` | Step 5 | [step-50](references/step-50-implementation.md) |
| `codeReview=false` | Step 6 | [step-60](references/step-60-code-review.md) |
| `qaVerification=false` | Step 7 | [step-70](references/step-70-qa-verification.md) |
| `ship=false && deploy=false` | Step 8 | [step-80](references/step-80-ship.md) |
| `documentRelease=false` | Step 9 | [step-90](references/step-90-document-release.md) |
| 全部为 true | Step 10 | [step-100](references/step-100-completion.md) |

## 辅助技能池（按需调用）

| 层级 | 技能 |
|------|------|
| 规划层 | plan-devex-review, plan-tune |
| 调试层 | investigate, health, freeze/unfreeze/guard |
| 设计层 | design-consultation, design-shotgun, design-html, devex-review |
| 测试层 | qa, qa-only, scrape, skillify, connect-chrome, setup-browser-cookies |
| 发布层 | setup-deploy, landing-report |
| 记忆层 | context-save, context-restore, learn, retro |

## 上下文管理

### 保存上下文

开发中如需切换任务：
```
Skill({ skill: "context-save", args: "保存当前工作状态" })
```

### 恢复上下文

回到之前的任务：
```
Skill({ skill: "context-restore", args: "恢复到之前保存的工作状态" })
```

### 持续学习

```
Skill({ skill: "learn", args: "管理 gstack 跨会话学习记录" })
```