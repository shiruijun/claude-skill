# Step 9: PRD 产出（PRD Development）

## 9.1 检查是否已完成

如果 `phases.prdDevelopment == true` 且 `prd.md` 存在：

AskUserQuestion（同 [Step 1 复用逻辑](step-01-jtbd-problem.md#11-检查是否已完成)）。

## 9.2 搜索代码现状（强制）

在产出 PRD 前，**必须**了解当前系统的代码现状，确保 PRD 中的技术方案与现有架构兼容。基于 `featureName` 提取关键词，执行以下搜索：

### 搜索策略

1. **graphify query**（优先，如果 `graphify-out/graph.json` 存在）：
   ```bash
   graphify query "与 {featureName} 相关的代码实现"
   ```
   或
   ```bash
   graphify path "现有功能" "{featureName}"
   ```

2. **codegraph_search**（如果 CodeGraph 可用）：
   - 搜索与需求相关的 Controller、Service、Mapper、Entity
   - 搜索相关的前端 Vue 组件、API 模块、Store

3. **Grep 兜底**（如果上述工具不可用）：
   ```bash
   # 后端关键词搜索
   grep -ri "{关键词}" --include="*.java" xiaogj-youli-*/
   # 前端关键词搜索
   grep -ri "{关键词}" --include="*.vue" --include="*.ts" jingbei-h5/ xiaogj-youli-platform-web/
   ```

### 搜索结果整理（禁止输出程序代码）

将代码搜索结果**转化为业务视角的影响分析**，整理为 `CODE_CONTEXT` 变量。

**严禁**在 PRD 中输出任何程序代码（Controller、Service、Mapper、Vue 组件等源码）。只输出基于代码理解后的**业务影响点**。

结构如下：

```markdown
## 业务影响点分析

### 受影响的现有业务流程
| 业务模块 | 当前行为 | 本需求带来的变化 |
|----------|---------|-----------------|
| 审批流程 | 目前仅支持单人审批 | 新增转交后需重新计算审批链 |
| 库存出库 | 出库单生成后自动扣减库存 | 新增审核状态，审核通过后才扣减 |

### 受影响的业务数据
| 数据域 | 影响说明 |
|--------|---------|
| 订单状态枚举 | 需新增 "待审核" 状态 |
| 库存流水记录 | 需区分 "预占库存" 与 "实际扣减" |

### 需兼容的已有业务规则
- 已有功能 A 的权限校验逻辑需保持一致
- 已有功能 B 的数据隔离规则（company_id）必须延续
- 与功能 C 的批量操作存在冲突，需协调处理顺序

### 系统集成点
| 集成方 | 当前集成方式 | 本需求的影响 |
|--------|-------------|-------------|
| 钉钉审批 | 通过回调推送审批状态 | 新增转交通知需扩展回调消息体 |
| 经贝管家 | 单向同步商品主数据 | 新增字段需确认同步策略 |

### 关键发现
- 现有功能 xxx 的业务逻辑可直接复用（无需新建）
- 功能 yyy 与新需求存在业务冲突，需产品决策
- 数据模型已支持扩展，无需新增核心实体
```

将 `CODE_CONTEXT` 保存到 `$BASE_DIR/code-context.md`。

## 9.3 执行 /prd-development

```js
Skill({
  skill: "prd-development",
  args: "基于以下所有前期产出，产出最终 PRD：\n问题陈述：{problem-statement.md 内容}\n\n发现报告：{discovery-report.md 内容}\n\n用户画像：{persona.md 内容}\n\n旅程地图：{journey-map.md 内容}\n\n机会方案树：{opportunity-solution-tree.md 内容}\n\n新闻稿：{press-release.md 内容}\n\n故事地图：{user-story-map.md 内容}\n\n优先级：{prioritization.md 内容}\n\nEpic拆分：{epics.md 内容}\n\n代码现状：{CODE_CONTEXT}\n\n---\n📎 **外部需求文档参考**（来自 {larkDocUrl}）：\n{EXTERNAL_DOC}\n\n📎 **用户补充信息**：\n{ADDITIONAL_CONTEXT}"
})
```

## 9.4 产出 prd.md

使用 Write 工具创建 `$BASE_DIR/prd.md`，基于模板 [templates/prd.md](templates/prd.md) 填充内容。

## 9.5 人工确认

Read 工具读取 `prd.md`，AskUserQuestion 确认。

更新 `phases.prdDevelopment = true`。

## 9.6 原型生成入口

PRD 确认后，检查需求类型：
- `BUG` / `TECH` → 直接进入 Step 10
- `FEAT` / `OPT` → AskUserQuestion 是否生成原型

用户确认生成后，进入 [Step 9.5: 原型页面生成](step-09-prototype.md)。