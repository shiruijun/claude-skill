---
name: jb-pm-pipeline
description: |
  经贝产品发现主流程（Product Discovery Pipeline）。
  PRD 的完整产品发现与设计流程。

  核心阶段：
  1. 明确雇佣目标（jobs-to-be-done + problem-statement）
  2. 发现流程（discovery-process + discovery-interview-prep + problem-framing-canvas）
  3. 用户理解（customer-journey-map + proto-persona）
  4. 机会与方案（opportunity-solution-tree）
  5. 反向验证（press-release）
  6. 用户故事映射（user-story-mapping）
  7. 优先级排序（prioritization-advisor）
  8. 故事拆分（epic-breakdown-advisor）
  9. PRD 产出（prd-development + user-story + user-story-splitting）

  辅助技能池（按需调用）：
  - 策略层：product-strategy-session, positioning-workshop, roadmap-planning, pestel-analysis, tam-sam-som-calculator
  - 研究层：discovery-interview-prep, problem-framing-canvas, pol-probe-advisor
  - 决策层：feature-investment-advisor, prioritization-advisor
  - 沟通层：press-release, recommendation-canvas
  - 工作坊：workshop-facilitation, customer-journey-mapping-workshop, user-story-mapping-workshop

triggers:
  - /jb-pm-pipeline
  - 产品发现流水线
  - PM 流水线
---

# 经贝产品发现流水线（JB PM Pipeline）

## 设计理念

`/jb-pm-pipeline` 是**唯一用户入口**。状态初始化由 pipeline 内部自动调用 `/jb-pm-init` 完成，用户无需感知 init 的存在。

---

## 复杂度分层

根据需求特征**自动推断**复杂度，用户只需确认。

### 推断规则

| 维度 | 信号 | 简单 (light) | 中等 (standard) | 复杂 (full) |
|------|------|-------------|----------------|------------|
| 需求类型 | FEAT/OPT/BUG/TECH | BUG/TECH | OPT/小 FEAT | 大 FEAT |
| 描述长度 | 字数 | <30 字 | 30-100 字 | >100 字 |
| 关键词 | 语义分析 | 修复、按钮、字段、文案 | 新增、优化、流程、模块 | 系统、平台、重构、架构 |
| 影响范围 | 页面/角色数 | 单页面单角色 | 多页面或多角色 | 跨系统或全链路 |

### 各复杂度流程

**简单 (light) — 6 步**：
```
Problem Statement（精简版）→ User Story Mapping → Prioritization
→ Epic Breakdown → PRD（精简版）→ 完成
```

**中等 (standard) — 7 步**：
```
JTBD + Problem Statement → Discovery（精简版）→ Proto-Persona
→ User Story Mapping → Prioritization → Epic Breakdown → PRD → 完成
```

**复杂 (full) — 10 步（原完整流程）**：
```
Step 1-10 完整产品发现流水线
```

### 动态 phases

`phases` 字段根据复杂度动态生成，不同复杂度有不同的步骤集合：

| 复杂度 | phases 字段 |
|--------|------------|
| `light` | `problemStatement`, `userStoryMapping`, `prioritization`, `epicBreakdown`, `prdDevelopment`, `prototypeGeneration`, `frontendImplementation` |
| `standard` | `jtbdProblemStatement`, `discoveryProcess`, `customerUnderstanding`, `userStoryMapping`, `prioritization`, `epicBreakdown`, `prdDevelopment`, `prototypeGeneration`, `frontendImplementation` |
| `full` | 原 10 个 phase + `prototypeGeneration` + `frontendImplementation` |

### 升级机制

执行过程中若发现当前复杂度不足以覆盖需求，可**动态升级**：

```
检测到当前问题需要更深入的分析（如涉及多角色协作、方案对比等），
建议升级至"{complexity}"流程。

[保持当前] [升级]
```

升级后保留已完成的 phase，追加新增的 phase。

---

## 整体流程

| Step | 阶段 | Skill 组合 | 产出文档 | 参考 |
|------|------|-----------|---------|------|
| 0 | 状态读取与初始化 | — | — | [step-00-init](references/step-00-init.md) |
| 1 | 明确雇佣目标 | jobs-to-be-done + problem-statement | problem-statement.md | [step-01-jtbd-problem](references/step-01-jtbd-problem.md) |
| 2 | 发现流程 | discovery-process | discovery-report.md | [step-02-discovery](references/step-02-discovery.md) |
| 3 | 用户理解 | proto-persona + customer-journey-map | persona.md / journey-map.md | [step-03-customer-understanding](references/step-03-customer-understanding.md) |
| 4 | 机会与方案 | opportunity-solution-tree | opportunity-solution-tree.md | [step-04-opportunity-solution](references/step-04-opportunity-solution.md) |
| 5 | 反向验证 | press-release | press-release.md | [step-05-press-release](references/step-05-press-release.md) |
| 6 | 用户故事映射 | user-story-mapping | user-story-map.md | [step-06-user-story-mapping](references/step-06-user-story-mapping.md) |
| 7 | 优先级排序 | prioritization-advisor | prioritization.md | [step-07-prioritization](references/step-07-prioritization.md) |
| 8 | 故事拆分 | epic-breakdown-advisor | epics.md | [step-08-epic-breakdown](references/step-08-epic-breakdown.md) |
| 9 | PRD 产出 | prd-development | prd.md | [step-09-prd-development](references/step-09-prd-development.md) |
| 9.5 | **原型页面生成（可选）** | **frontend-design** | **prototype/** | **[step-09-prototype](references/step-09-prototype.md)** |
| 9.6 | **前端页面实现（可选）** | **jb-pc-page-pipeline** | **Vue 页面 + 部署预览** | **[step-09-frontend](references/step-09-frontend.md)** |
| 10 | 完成 | — | README.md | [step-10-completion](references/step-10-completion.md) |

> 每个 Step 的详细执行流程（检查、Skill 调用、产出、确认、状态更新）参见对应 reference 文件。
> 各阶段产出文档的 Markdown 模板参见 [references/templates/](references/templates/)。

---

## 状态机

```
NO_STATE ──→ waiting-number ──→ initialized ──→ completed
```

| 状态 | 说明 | 处理 |
|------|------|------|
| `NO_STATE` | 首次使用，无任何 ticket | 自动调用 `/jb-pm-init`，完成后变为 `waiting-number` |
| `waiting-number` | 已选需求类型，等待飞书编号 | 接收编号后完成初始化，变为 `initialized` |
| `initialized` | 正常执行中 | 按复杂度对应的步骤顺序推进 |
| `completed` | 当前需求已完成 | 询问是否开始新需求、查看文档或继续当前需求 |

> **phases 动态生成**：初始化时根据推断的 `complexity` 生成对应的 `phases` 字段。升级复杂度时，保留已完成 phase，追加新增 phase。

详细的状态读取与分支处理逻辑参见 [step-00-init](references/step-00-init.md)。

---

## 执行入口

### 1. 解析用户输入（与 `/jb-pm-init` 对齐）

判断输入类型：

| 输入类型 | 判断规则 | 示例 | 处理方式 |
|---------|---------|------|---------|
| `existing_ticket` | 匹配 `^(FEAT\|OPT\|BUG\|TECH)-[A-Z0-9-]+$` | `FEAT-D1234` | 直接使用 |
| `bare_number` | 匹配 `^[A-Z0-9-]+$` | `D1234` | 拼接 `PENDING.json` 中的 `pendingType` |
| `new_requirement` | 其他描述文本 | "我要做导出功能" | **调用 `/jb-pm-init`** 处理类型和编号 |
| `no_ticket` | 不含有效标识 | "继续"、"下一步" | **Fallback 读取 `active.json`** |

> **Fallback 逻辑**：当用户未提供明确 ticket 时，读取 `.jb-pm-pipeline/active.json`：
> - 存在 `ticketId` 且对应 `.json` 存在 → 使用该 ticket 继续
> - 不存在或文件缺失 → **自动调用 `/jb-pm-init`** 启动初始化（用户无需感知 init 存在）

### 2. 定位状态文件

检查 `.jb-pm-pipeline/${TICKET}.json`：

**A) 状态文件存在**
→ 更新 `active.json` 指向该 ticket → 读取 `phases` → 进入跳转策略

**B) 状态文件不存在**
→ **禁止直接创建空状态文件**，按以下优先级处理：

1. **检查 `PENDING.json`**：若存在且 `status == "waiting-number"`
   - 用户在 `/jb-pm-init` 等待编号阶段
   - 用 `pendingType` 拼接用户输入，进入 [step-00-init.md](references/step-00-init.md) B) 流程完成初始化

2. **输入为 `new_requirement`**：
   - 自动调用 `/jb-pm-init {用户输入}``，由 init 处理类型选择和编号收集
   - 初始化完成后状态变为 `waiting-number` 或 `initialized`
   - **流程终止**，等待用户重新触发

3. **其他情况**（`existing_ticket` 或 `bare_number` 但无 PENDING）：
   - 自动调用 `/jb-pm-init {用户输入}``
   - `/jb-pm-init` 根据输入类型直接进入对应处理流程
   - **流程终止**，等待用户重新触发

> **说明**：`/jb-pm-init` 和 `/jb-pm-pipeline` 的职责边界 —— `init` 负责**首次创建**状态和目录，`pipeline` 负责**已初始化**后的流程推进。ticket 不存在时一律交由 `init` 处理，避免状态字段缺失。

### 3. 跳转策略

读取状态文件的 `phases`，找到**第一个 `false` 的 phase**：

| 场景 | 操作 |
|------|------|
| Step 1-2（初始阶段）| **自动推进** — 直接执行对应 Step |
| Step 3-9（核心阶段）| **询问确认** — AskUserQuestion：`当前处于 {phaseName}，是否继续？` |
| Step 10（完成）| 进入 completed 流程，询问查看产出或开始新需求 |
| 全部 `true` | 进入 [step-10-completion](references/step-10-completion.md) 处理 |

> **中断恢复**：若用户输入不含 ticket，自动走 Fallback 读取 active.json，按当前 phases 状态定位断点。

---

## 中断恢复

读取 `active.json` 获取当前活跃 ticket，再读取对应 ticket 状态文件，根据 `phases` 中第一个 `false` 的字段定位断点。

### 复杂 (full) 流程断点

| phases 状态 | 从哪继续 | 参考 |
|-------------|---------|------|
| `jtbdProblemStatement=false` | Step 1 | [step-01](references/step-01-jtbd-problem.md) |
| `discoveryProcess=false` | Step 2 | [step-02](references/step-02-discovery.md) |
| `customerUnderstanding=false` | Step 3 | [step-03](references/step-03-customer-understanding.md) |
| `opportunitySolution=false` | Step 4 | [step-04](references/step-04-opportunity-solution.md) |
| `pressRelease=false` | Step 5 | [step-05](references/step-05-press-release.md) |
| `userStoryMapping=false` | Step 6 | [step-06](references/step-06-user-story-mapping.md) |
| `prioritization=false` | Step 7 | [step-07](references/step-07-prioritization.md) |
| `epicBreakdown=false` | Step 8 | [step-08](references/step-08-epic-breakdown.md) |
| `prdDevelopment=false` | Step 9 | [step-09](references/step-09-prd-development.md) |
| `prototypeGeneration=false` | Step 9.5 | [step-09-prototype](references/step-09-prototype.md) |
| `frontendImplementation=false` | Step 9.6 | [step-09-frontend](references/step-09-frontend.md) |
| 全部为 true | Step 10 | [step-10](references/step-10-completion.md) |

### 中等 (standard) 流程断点

| phases 状态 | 从哪继续 | 参考 |
|-------------|---------|------|
| `jtbdProblemStatement=false` | Step 1 | [step-01](references/step-01-jtbd-problem.md) |
| `discoveryProcess=false` | Step 2 | [step-02](references/step-02-discovery.md) |
| `customerUnderstanding=false` | Step 3 | [step-03](references/step-03-customer-understanding.md) |
| `userStoryMapping=false` | Step 4 | [step-06](references/step-06-user-story-mapping.md) |
| `prioritization=false` | Step 5 | [step-07](references/step-07-prioritization.md) |
| `epicBreakdown=false` | Step 6 | [step-08](references/step-08-epic-breakdown.md) |
| `prdDevelopment=false` | Step 7 | [step-09](references/step-09-prd-development.md) |
| `prototypeGeneration=false` | Step 7.5 | [step-09-prototype](references/step-09-prototype.md) |
| `frontendImplementation=false` | Step 7.6 | [step-09-frontend](references/step-09-frontend.md) |
| 全部为 true | Step 8 | [step-10](references/step-10-completion.md) |

### 简单 (light) 流程断点

| phases 状态 | 从哪继续 | 参考 |
|-------------|---------|------|
| `problemStatement=false` | Step 1 | [step-01](references/step-01-jtbd-problem.md) |
| `userStoryMapping=false` | Step 2 | [step-06](references/step-06-user-story-mapping.md) |
| `prioritization=false` | Step 3 | [step-07](references/step-07-prioritization.md) |
| `epicBreakdown=false` | Step 4 | [step-08](references/step-08-epic-breakdown.md) |
| `prdDevelopment=false` | Step 5 | [step-09](references/step-09-prd-development.md) |
| `prototypeGeneration=false` | Step 5.5 | [step-09-prototype](references/step-09-prototype.md) |
| `frontendImplementation=false` | Step 5.6 | [step-09-frontend](references/step-09-frontend.md) |
| 全部为 true | Step 6 | [step-10](references/step-10-completion.md) |

> **注意**：实际执行时读取 `complexity` 字段，按对应流程的 phases 顺序查找第一个 `false`。
