# Step 1: 测试用例生成（两阶段 Agent）

## 执行策略

**两阶段执行：Phase A 并行 BE/FE/API → Phase B 串行 BB**

### Phase A：并行 Agent × 3（后端/前端/API）

根据功能类型和 `--scope` 参数决定启动哪些 Agent：

| 功能类型 | scope=all | scope=frontend | scope=backend | scope=api | scope=blackbox |
|----------|-----------|----------------|---------------|-----------|----------------|
| 纯前端 | Agent FE | Agent FE | ❌ | ❌ | → Phase B |
| 前端 + API | Agent FE + Agent API | Agent FE + Agent API | ❌ | Agent API | → Phase B |
| 后端逻辑 | Agent BE + Agent API | ❌ | Agent BE | Agent API | → Phase B |
| 全栈 | Agent BE + Agent FE + Agent API | Agent FE + Agent API | Agent BE | Agent API | → Phase B |

### Phase B：串行 Agent BB（黑盒测试）

**Phase B 必须等 Phase A 全部完成后执行。** Agent BB 的输入包含 Phase A 的输出，用于生成真实的追溯链。

**scope=blackbox 时跳过 Phase A，直接执行 Phase B。**

---

## 代码上下文注入（Phase A 前置）

**在启动 Phase A 的任何 Agent 之前，必须先搜索代码库，获取实际的类名、方法签名、组件结构。**

### 搜索策略

```bash
# 1. 从 PRD 提取关键词
# 实体名（单据、模板、表单等）、操作名（删除、编辑、复制等）、API 路径
KEYWORDS=$(grep -oE '[A-Za-z]{3,}' "$BASE_DIR/prd.md" | sort -u | head -20)

# 2. 按关键词搜索代码文件
# 后端：搜索 @TableName, Service, Controller, Mapper
BACKEND_FILES=()
for kw in $KEYWORDS; do
  FILES=$(grep -rl "$kw" --include="*.java" "$WORKSPACE/xiaogj-youli-amoeba/src/" 2>/dev/null | head -5)
  BACKEND_FILES+=($FILES)
done
# 去重
BACKEND_FILES=($(printf '%s\n' "${BACKEND_FILES[@]}" | sort -u))

# 前端：搜索组件、路由、API 调用
FRONTEND_FILES=()
for kw in $KEYWORDS; do
  FILES=$(grep -rl "$kw" --include="*.vue" --include="*.ts" --include="*.js" "$WORKSPACE/xiaogj-youli-platform-web/src/" 2>/dev/null | head -5)
  FRONTEND_FILES+=($FILES)
done
FRONTEND_FILES=($(printf '%s\n' "${FRONTEND_FILES[@]}" | sort -u))
```

### 提取结构信息

对搜索到的文件，使用 Read 工具读取并提取：

**后端文件提取：**
- 类名（`public class XxxService`）
- 方法签名（`public Result xxx(@RequestBody ...)`）
- `@TableName` 注解（实际表名）
- `@TableField` 注解（字段名）
- 关键业务逻辑（if/else 分支、异常处理）

**前端文件提取：**
- 组件名（`defineComponent({ name: 'XxxPage' })`）
- `data()` 结构（数据模型）
- `methods` 列表（操作方法）
- `computed` 列表（计算属性）
- 路由路径（`path: '/xxx'`）
- API 调用（`this.ajax(...)`、`import { xxx } from '@/main/api/xxx'`）

### 注入 Agent Prompt

将提取的结构信息注入到 Agent prompt 的【代码上下文】段：

```
【代码上下文】（实际代码结构，非猜测）

---BACKEND_CLASSES_START---
类名：ApprovalFormService
方法：
- saveForm(ApprovalFormDTO dto) → Result
- deleteForm(Long id) → Result
- checkUsed(Long id) → boolean
@TableName：t_yl_approval_form
字段：id, form_name, form_type, status, create_time
---BACKEND_CLASSES_END---

---FRONTEND_COMPONENTS_START---
组件名：ApprovalSetList
路由：/#/approval-set
data：{ list: [], loading: false, searchForm: { keyword: '' } }
methods：handleDelete(row), handleEdit(row), handleCopy(row)
API 调用：import { deleteForm } from '@/jinbeiguanjia/api/approval'
---FRONTEND_COMPONENTS_END---
```

---

## 功能类型识别（必须在生成前完成）

在启动 Agent 之前，必须先分析 PRD 和代码库，确定功能类型。

### 检测步骤

1. **分析 PRD 功能点**
   - 搜索关键词：API、接口、后端、服务端、数据库、提交、保存、查询、列表
   - 如果涉及数据持久化 → 可能需要后端测试

2. **搜索相关代码文件（全栈需求必须双端搜索）**

   **全栈需求代码搜索规则：**
   - 功能类型检测为"全栈"时，必须同时找到前端项目和后端项目的代码
   - 如果只找到一端的代码，**必须主动询问用户另一端代码的位置**，禁止使用泛化类名生成用例

   **前端项目列表：**
   | 项目 | 说明 |
   |------|------|
   | jingbei-h5 | H5 移动端（Vue 3 + Vant 4） |
   | xiaogj-youli-platform-web | PC 端管家（Vue 2.7 + Element UI） |

   **后端项目列表：**
   | 项目 | 说明 |
   |------|------|
   | xiaogj-youli-amoeba | 主后端服务（Spring Boot） |
   | xiaogj-youli-common-starter | 公共模块 |
   | xiaogj-youli-crm | CRM 服务 |
   | xiaogj-youli-data-analysis | 数据分析服务 |
   | xiaogj-youli-data-etl | 数据 ETL 服务 |
   | xiaogj-youli-data-sync | 数据同步服务 |
   | xiaogj-youli-mdm | 主数据管理服务 |
   | xiaogj-youli-platform-gateway | 平台网关 |
   | xiaogj-youli-platform-opengateway | 开放网关 |

3. **验证数据库表名（必须）**
   - 在后端项目中搜索 `@TableName` 注解，找到实际数据库表名
   - 确认字段名、外键关系

4. **找出所有相关页面**
   - 搜索组件被哪些页面引用
   - 搜索相关功能在哪些页面使用
   - **必须为每个相关页面设计测试用例**

5. **判断标准**

   | 功能类型 | 判断条件 | 生成范围 |
   |----------|----------|----------|
   | **纯前端** | 无 API 调用，纯 UI 交互/状态管理 | FE only |
   | **前端 + API** | 组件调用后端接口（axios/fetch） | FE + API |
   | **后端逻辑** | 涉及 Service、Mapper、数据库操作 | BE + API |
   | **全栈** | 前后端都需要修改 | BE + FE + API |

6. **输出结果**
   ```
   功能类型检测结果：
   - 类型：{纯前端/前端+API/后端逻辑/全栈}
   - 依据：{具体说明为什么判定为该类型}
   - 生成范围：{FE only / FE + API / BE + API / BE + FE + API}
   - 代码复杂度：{简单/中等/复杂}（决定覆盖方向）
   ```

---

## 覆盖方向自适应（替代固定百分比）

**根据功能复杂度动态选择覆盖方向，不再使用固定的 30%/25%/20%/15%/10% 百分比。**

### 复杂度判断标准

| 复杂度 | 判断依据 | 接口/组件数 |
|--------|----------|------------|
| 简单 | 单一功能、少量交互 | ≤ 3 |
| 中等 | 多步骤流程、多组件协作 | 4-8 |
| 复杂 | 跨模块、多分支、状态流转 | > 8 |

### 覆盖方向选择

**简单功能（≤3 个接口/组件）：**
- 必须覆盖：正常流程、异常流程
- 建议覆盖：边界情况
- 可选覆盖：兼容情况、性能情况（如不适用可跳过）

**中等功能（4-8 个接口/组件）：**
- 必须覆盖：正常流程、异常流程、边界情况
- 建议覆盖：兼容情况
- 可选覆盖：性能情况

**复杂功能（>8 个接口/组件）：**
- 必须覆盖：正常流程、异常流程、边界情况
- 建议覆盖：兼容情况、性能情况

---

## Phase A: Agent BE — 后端单元测试用例

```
Agent({
  subagent_type: "general-purpose",
  prompt: "你是一个 Java 后端测试专家。基于以下文档和代码上下文，生成后端单元测试用例。

【任务】
为每个 Service、Mapper、Util 类生成测试用例，覆盖以下方向（根据功能复杂度自适应）：

简单功能（≤3 个接口）：
- 必须：正常流程、异常流程
- 建议：边界情况

中等功能（4-8 个接口）：
- 必须：正常流程、异常流程、边界情况
- 建议：兼容情况

复杂功能（>8 个接口）：
- 必须：正常流程、异常流程、边界情况
- 建议：兼容情况、性能情况

【输出格式】（严格遵循）

每个用例使用以下表格格式：

| 属性 | 内容 |
|------|------|
| **用例编号** | TC-BE-{三位数} |
| **优先级** | P0/P1/P2 |
| **测试类** | {类名} |
| **测试方法** | {方法名} |
| **覆盖方向** | 正常流程/异常流程/边界情况/兼容情况/性能情况 |
| **测试目标** | {一句话描述} |
| **前置条件** | {数据准备、Mock 设置、环境配置} |
| **测试步骤** | 1. xxx 2. xxx 3. xxx |
| **预期结果** | {断言描述} |
| **实际结果** | （执行时填写） |
| **关联需求** | {PRD 功能点} |

【优先级定义】
- P0: 核心业务流程（如：创建、支付、审批）
- P1: 重要分支（如：状态流转、权限校验）
- P2: 边缘场景（如：空值、极端值）

【代码上下文】（实际代码结构，非猜测）

---BACKEND_CLASSES_START---
{注入实际搜索到的后端类名、方法签名、@TableName、字段}
---BACKEND_CLASSES_END---

【输入文档】

---PRD_START---
{prd_summary}
---PRD_END---

---BACKEND_API_START---
{backend_api_summary}
---BACKEND_API_END---

---BACKEND_DB_START---
{database_summary}
---BACKEND_DB_END---

---ARCHITECTURE_START---
{architecture_summary}
---ARCHITECTURE_END---

【约束】
- 用例数量：根据功能复杂度调整（简单 5-10 条，中等 10-20 条，复杂 15-30 条）
- 每个 P0 功能点至少 2 条用例
- 每个 P1 功能点至少 1 条用例
- 测试类和测试方法名必须来自【代码上下文】中的实际类名和方法名，禁止猜测
- 不要输出文件头，直接输出表格"
})
```

## Phase A: Agent FE — 前端单元测试用例

```
Agent({
  subagent_type: "general-purpose",
  prompt: "你是一个 Vue 前端测试专家。基于以下文档和代码上下文，生成前端单元测试用例。

【任务】
为每个组件、Composable、工具函数生成测试用例，覆盖以下方向（根据功能复杂度自适应）：

简单功能（≤3 个组件）：
- 必须：正常流程、异常流程
- 建议：边界情况

中等功能（4-8 个组件）：
- 必须：正常流程、异常流程、边界情况
- 建议：兼容情况

复杂功能（>8 个组件）：
- 必须：正常流程、异常流程、边界情况
- 建议：兼容情况、性能情况

【输出格式】（严格遵循）

每个用例使用以下表格格式：

| 属性 | 内容 |
|------|------|
| **用例编号** | TC-FE-{三位数} |
| **优先级** | P0/P1/P2 |
| **测试组件** | {组件名} |
| **覆盖方向** | 正常流程/异常流程/边界情况/兼容情况/性能情况 |
| **测试目标** | {一句话描述} |
| **前置条件** | {Mock 数据、Store 状态、路由配置} |
| **测试步骤** | 1. xxx 2. xxx |
| **预期结果** | {DOM 变化、事件触发、返回值} |
| **实际结果** | （执行时填写） |
| **关联需求** | {PRD 功能点} |

【优先级定义】
- P0: 核心业务流程（如：表单提交、支付、审批）
- P1: 重要分支（如：状态流转、权限校验）
- P2: 边缘场景（如：空值、极端值）

【代码上下文】（实际代码结构，非猜测）

---FRONTEND_COMPONENTS_START---
{注入实际搜索到的组件名、data()、methods、computed、路由路径、API 调用}
---FRONTEND_COMPONENTS_END---

【输入文档】

---PRD_START---
{prd_summary}
---PRD_END---

---FRONTEND_COMPONENTS_START---
{components_summary}
---FRONTEND_COMPONENTS_END---

---FRONTEND_ARCH_START---
{frontend_architecture_summary}
---FRONTEND_ARCH_END---

---API_INTEGRATION_START---
{api_integration_summary}
---API_INTEGRATION_END---

【约束】
- 用例数量：根据功能复杂度调整（简单 5-8 条，中等 8-15 条，复杂 10-25 条）
- 每个核心组件至少 2 条用例
- 工具函数每个至少 1 条用例
- 测试组件名必须来自【代码上下文】中的实际组件名，禁止猜测
- 不要输出文件头，直接输出表格"
})
```

## Phase A: Agent API — API 集成测试用例

```
Agent({
  subagent_type: "general-purpose",
  prompt: "你是一个 API 测试专家。基于以下文档和代码上下文，生成 API 集成测试用例。

【任务】
为每个 API 接口生成测试用例，覆盖以下方向（根据功能复杂度自适应）：

简单功能（≤3 个接口）：
- 必须：正常流程、异常流程
- 建议：边界情况

中等功能（4-8 个接口）：
- 必须：正常流程、异常流程、边界情况
- 建议：兼容情况

复杂功能（>8 个接口）：
- 必须：正常流程、异常流程、边界情况
- 建议：兼容情况、性能情况

【输出格式】（严格遵循）

每个用例使用以下表格格式：

| 属性 | 内容 |
|------|------|
| **用例编号** | TC-API-{三位数} |
| **优先级** | P0/P1/P2 |
| **HTTP 方法** | GET/POST/PUT/DELETE |
| **接口路径** | {路径} |
| **覆盖方向** | 正常流程/异常流程/边界情况/兼容情况/性能情况 |
| **测试目标** | {一句话描述} |
| **前置条件** | {认证、数据准备、环境配置} |
| **测试步骤** | 1. xxx 2. xxx |
| **请求参数** | {JSON 格式} |
| **预期结果** | {状态码 + 关键字段和值} |
| **实际结果** | （执行时填写） |
| **关联需求** | {PRD 功能点} |

【优先级定义】
- P0: 核心接口（如：登录、支付、创建订单）
- P1: 重要接口（如：列表查询、状态更新）
- P2: 辅助接口（如：字典查询、配置获取）

【代码上下文】（实际代码结构，非猜测）

---BACKEND_API_CLASSES_START---
{注入实际搜索到的 Controller 类名、方法签名、@RequestMapping 路径}
---BACKEND_API_CLASSES_END---

---FRONTEND_API_CALLS_START---
{注入实际搜索到的前端 API 调用代码}
---FRONTEND_API_CALLS_END---

【输入文档】

---PRD_START---
{prd_summary}
---PRD_END---

---BACKEND_API_START---
{backend_api_full}
---BACKEND_API_END---

---FRONTEND_API_START---
{api_integration_summary}
---FRONTEND_API_END---

【约束】
- 每个接口至少 2 条用例（正常流程 + 异常流程）
- 核心接口至少 4 条用例（覆盖至少 3 个方向）
- 接口路径和参数必须来自【代码上下文】中的实际代码，禁止猜测
- 不要输出文件头，直接输出表格"
})
```

## Phase A 产出合并

```bash
# 1. 保存各 Agent 输出
echo "$AGENT_BE_OUTPUT" > "$BASE_DIR/test/case/_backend.md"
echo "$AGENT_FE_OUTPUT" > "$BASE_DIR/test/case/_frontend.md"
echo "$AGENT_API_OUTPUT" > "$BASE_DIR/test/case/_api.md"

# 2. 统计 Phase A 用例数
BE_COUNT=$(grep -c "^| \*\*用例编号\*\* | TC-BE-" "$BASE_DIR/test/case/_backend.md" 2>/dev/null || echo 0)
FE_COUNT=$(grep -c "^| \*\*用例编号\*\* | TC-FE-" "$BASE_DIR/test/case/_frontend.md" 2>/dev/null || echo 0)
API_COUNT=$(grep -c "^| \*\*用例编号\*\* | TC-API-" "$BASE_DIR/test/case/_api.md" 2>/dev/null || echo 0)

echo "Phase A 完成：BE=$BE_COUNT, FE=$FE_COUNT, API=$API_COUNT"
```

## Phase B: Agent BB — 黑盒测试用例

**必须等 Phase A 全部完成后执行。** Agent BB 的输入包含 Phase A 的输出，用于生成真实的追溯链。

```
Agent({
  subagent_type: "general-purpose",
  prompt: "你是一个黑盒测试专家。基于 PRD 需求文档和已生成的后端/前端/API 测试用例，生成黑盒测试用例（功能测试/系统测试）。

【任务】
从用户角度出发，验证功能是否按需求正常工作。不关心内部实现，只关注输入和输出。

覆盖以下测试类型（根据功能复杂度自适应）：

简单功能：
- 必须：功能测试、异常测试
- 建议：边界测试

中等功能：
- 必须：功能测试、界面测试、异常测试
- 建议：边界测试

复杂功能：
- 必须：功能测试、界面测试、边界测试、异常测试
- 建议：兼容性测试

【输出格式】（严格遵循）

每个用例使用以下表格格式：

| 属性 | 内容 |
|------|------|
| **用例编号** | TC-BB-{三位数} |
| **优先级** | P0/P1/P2 |
| **测试类型** | 功能测试/界面测试/边界测试/异常测试/兼容性测试 |
| **测试目标** | {一句话描述} |
| **前置条件** | {登录状态、数据准备、环境配置} |
| **测试步骤** | 1. 打开页面 xxx 2. 点击 xxx 3. 输入 xxx 4. 预期结果 xxx |
| **预期结果** | {页面显示、数据变化、提示信息} |
| **实际结果** | （执行时填写） |
| **关联需求** | {PRD 功能点} |
| **关联用例** | TC-BE-{xxx}、TC-FE-{xxx}、TC-API-{xxx}（引用下方已生成的下层用例） |

【优先级定义】
- P0: 核心业务流程（如：登录、提交、支付）
- P1: 重要分支（如：状态切换、权限控制）
- P2: 边缘场景（如：空值、极端值）

【已生成的测试用例（Phase A 输出）】

---BACKEND_TESTCASES_START---
{Agent BE 的完整输出}
---BACKEND_TESTCASES_END---

---FRONTEND_TESTCASES_START---
{Agent FE 的完整输出}
---FRONTEND_TESTCASES_END---

---API_TESTCASES_START---
{Agent API 的完整输出}
---API_TESTCASES_END---

【关联规则】
- 每个黑盒用例必须在"关联用例"字段中引用至少一条已生成的下层用例
- 引用的编号必须来自上方【已生成的测试用例】中的实际编号，禁止编造
- 关联逻辑：黑盒用例的测试步骤涉及哪些后端/前端/API 操作，就引用对应的用例

【输入文档】

---PRD_START---
{prd_summary}
---PRD_END---

---DESIGN_START---
{design_summary}
---DESIGN_END---

【约束】
- 用例数量：根据功能复杂度调整（简单 8-15 条，中等 15-25 条，复杂 20-35 条）
- 每个 P0 功能点至少 3 条用例
- 每个 P1 功能点至少 2 条用例
- 测试步骤要具体，包含页面操作和数据输入
- 预期结果要明确，包含具体的页面变化和提示信息
- 不要输出文件头，直接输出表格"
})
```

## 增量模式处理

**如果 `MODE == "incremental"`：**

```bash
# 1. 读取已有 cases.md 中的用例编号
EXISTING_BE=$(grep -oP 'TC-BE-\K\d+' "$BASE_DIR/test/case/cases.md" | sort -n | tail -1)
EXISTING_FE=$(grep -oP 'TC-FE-\K\d+' "$BASE_DIR/test/case/cases.md" | sort -n | tail -1)
EXISTING_API=$(grep -oP 'TC-API-\K\d+' "$BASE_DIR/test/case/cases.md" | sort -n | tail -1)
EXISTING_BB=$(grep -oP 'TC-BB-\K\d+' "$BASE_DIR/test/case/cases.md" | sort -n | tail -1)

# 2. 只针对 prdFeatures 中 covered == false 的功能点生成用例
# 在 Agent prompt 中附加：
# "以下功能点已有用例覆盖，不需要重复生成：{covered features 列表}"
# "只针对以下未覆盖功能点生成用例：{uncovered features 列表}"

# 3. 新用例编号接续已有编号
# Agent BE 从 TC-BE-{EXISTING_BE + 1} 开始
# Agent FE 从 TC-FE-{EXISTING_FE + 1} 开始
# Agent API 从 TC-API-{EXISTING_API + 1} 开始
# Agent BB 从 TC-BB-{EXISTING_BB + 1} 开始

# 4. 合并时保留已有用例，追加新用例
# 读取已有 cases.md → 保留 → 追加新用例到对应章节
```

## 产出合并

```bash
# 1. 保存 Agent BB 输出
echo "$AGENT_BB_OUTPUT" > "$BASE_DIR/test/case/_blackbox.md"

# 2. 使用模板合并
# 读取 templates/cases.md 模板
# 替换占位符：
#   {ticketId} → TICKET_ID
#   {featureName} → FEATURE_NAME
#   {generatedAt} → 当前时间
#   {backendUnit} → 后端用例数
#   {frontendUnit} → 前端用例数
#   {apiIntegration} → API 用例数
#   {blackbox} → 黑盒用例数
#   {total} → 总数
# 插入各部分内容

# 增量模式：保留已有内容，只追加新章节内容

# 3. 清理临时文件
rm -f "$BASE_DIR/test/case/_backend.md"
rm -f "$BASE_DIR/test/case/_frontend.md"
rm -f "$BASE_DIR/test/case/_api.md"
rm -f "$BASE_DIR/test/case/_blackbox.md"
```

## 统计用例数

```bash
# 统计各类用例数量
BACKEND_COUNT=$(grep -c "^| \*\*用例编号\*\* | TC-BE-" "$BASE_DIR/test/case/cases.md")
FRONTEND_COUNT=$(grep -c "^| \*\*用例编号\*\* | TC-FE-" "$BASE_DIR/test/case/cases.md")
API_COUNT=$(grep -c "^| \*\*用例编号\*\* | TC-API-" "$BASE_DIR/test/case/cases.md")
BLACKBOX_COUNT=$(grep -c "^| \*\*用例编号\*\* | TC-BB-" "$BASE_DIR/test/case/cases.md")
TOTAL=$((BACKEND_COUNT + FRONTEND_COUNT + API_COUNT + BLACKBOX_COUNT))
```

## 确认

Read `test/case/cases.md`，AskUserQuestion：

```
测试用例已生成（共 {total} 条）：
- 后端单元：{n} 条
- 前端单元：{n} 条
- API 集成：{n} 条
- 黑盒测试：{n} 条

请选择：
- **A)** 确认，进入覆盖率计算
- **B)** 需要修改（指定章节或用例）
- **C)** 重新生成
```

确认后更新 `phases.generated = true`，进入 Step 2。
