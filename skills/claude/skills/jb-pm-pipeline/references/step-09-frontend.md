# Step 9.6: 前端页面实现（Frontend Implementation）

## 9.6.1 检查是否已完成

如果 `phases.frontendImplementation == true`：

AskUserQuestion：
> 前端页面已实现，是否需要重新生成？
> - A) 复用现有代码
> - B) 重新生成
> - C) 查看预览地址

## 9.6.2 判断是否跳过

**自动跳过条件**（满足任一即跳过）：
- 需求类型为 `BUG` 或 `TECH`（无前端界面需求）
- 用户在前一步（Step 9.5）选择了"跳过原型"且未手动触发本步骤
- 用户选择"跳过前端实现"

**跳过处理**：更新 `phases.frontendImplementation = true`，直接进入 Step 10。

## 9.6.3 准备输入

### 3.1 读取原型文件

如果 `prototype/index.html` 存在，提取以下信息：

| 字段 | 来源 | 用途 |
|------|------|------|
| 页面标题 | `#pageTitle` 或 `document.title` | 页面标题、路由名称 |
| 内容区结构 | `<!-- CONTENT_START -->` 到 `<!-- CONTENT_END -->` | 判断页面类型和布局 |
| 搜索栏字段 | `.search-bar` 内的 `.filter-item` | 筛选条件字段 |
| 表格列 | `.el-table th` | 表格列定义 |
| 表单字段 | `.el-form-item` | 表单字段列表 |
| 操作按钮 | `.op-bar` 内的 `.el-button` | 业务操作 |
| 弹窗内容 | `.modal` 内的表单 | 表单弹窗字段 |

### 3.2 读取 PRD

读取 `$BASE_DIR/prd.md`，提取：

| 字段 | 来源 | 用途 |
|------|------|------|
| 功能名称 | `featureName` | 页面标题、组件名 |
| 界面与交互 | prd.md 第 6 节 | 补充原型未覆盖的细节 |
| 用户故事 | prd.md 第 5 节（筛选含 UI 的） | 交互流程参考 |
| 业务字段 | prd.md 第 4 节 | 字段类型、校验规则 |

### 3.3 询问用户

AskUserQuestion：

> 基于原型和 PRD 准备生成前端代码，请确认以下信息：
> - **模块目录**（如: reimbursement, contract, budget）
> - **路由路径**（如: /reimbursement/list）
> - **页面类型**（自动推断为 {pageType}，如需调整请说明）

用户可修改模块和路径，页面类型以自动推断为准（见 9.6.4）。

## 9.6.4 页面类型判断

根据原型内容区结构自动判断：

| 原型特征 | 页面类型 | 调用模板 |
|---------|---------|---------|
| 含 `.search-bar` + `.el-table` + `.el-pagination` | **列表页** | `search_list.vue` |
| 含 `.modal` 或 `.el-drawer` 内的表单，且父页面为列表 | **表单弹窗** | `form_dialog.vue` |
| 含详情信息展示 + 明细表格，只读为主 | **详情抽屉** | `detail_drawer.vue` |
| 含表格 + 选择确认按钮，用于数据选择 | **表格选择弹窗** | `table_dialog.vue` |

**判断逻辑**：
1. 优先检查是否有 `.modal` / `.el-drawer` → 弹窗/抽屉类型
2. 检查是否有 `.el-table` → 含表格
3. 检查是否有 `.search-bar` → 列表页（有搜索）
4. 检查是否有表单提交按钮 → 表单类型
5. 检查是否只读 → 详情类型

**不确定时**：AskUserQuestion 让用户确认页面类型。

## 9.6.5 调用 jb-pc-page-pipeline

```js
Skill({
  skill: "jb-pc-page-pipeline",
  args: `生成一个${pageType}，需求如下：

## 页面标题
${pageTitle}

## 模块与路由
- 模块目录: ${moduleName}
- 路由路径: ${routePath}
- 组件名称: ${pageName}

## 字段列表
${fields}

## 业务操作
${operations}

## 交互要求
${interactions}

## 参考原型（HTML 结构）
${prototypeHtmlContent}

## 设计要求
- 使用 Vue 2.7 + Element UI 风格
- 颜色使用 CSS 变量（var(--c1)、var(--g1) 等）
- 表单控件 size="small"，表单容器 class="g-form-small"
- 表格状态标签 size="mini"
- 操作列使用 <more-box> 折叠
- 全局组件（page-wrap、excel-table、v-column 等）禁止 import`
})
```

## 9.6.6 自动部署与预览

生成代码保存到临时文件后，自动调用部署脚本：

```bash
node ~/.claude/skills/jb-pc-page-pipeline/Scripts/deploy-and-preview.js \
  --module=${moduleName} \
  --name=${pageName} \
  --path=${routePath} \
  --source=${generatedVueFile} \
  --project=../../../finance-saas-vue
```

脚本会自动完成：
1. 复制 Vue 文件到 `src/jinbeiguanjia/views/{module}/{page}.vue`
2. 在 `router.js` 中注册路由
3. 启动开发服务器（如果未运行）
4. 打开浏览器访问预览页面

## 9.6.7 确认与迭代

1. 告知用户预览地址：`https://localhost:3000/#${routePath}`
2. AskUserQuestion：

   > 前端页面已生成并部署，是否满意？
   > - A) 满意，确认完成
   > - B) 需要调整（描述修改意见）
   > - C) 删除代码，跳过前端实现

3. 选 B → 根据反馈调用 `jb-pc-page-pipeline` 重新生成（最多 2 轮迭代）
   - 重新生成后再次自动部署
4. 选 C → 删除已部署的 Vue 文件和路由，更新 `phases.frontendImplementation = true`，进入 Step 10
5. 选 A → 更新 `phases.frontendImplementation = true`，进入 Step 10

## 9.6.8 状态更新

确认完成后：

```bash
ACTIVE_TICKET=$(cat .jb-pm-pipeline/active.json | python -c "import sys,json; print(json.load(sys.stdin).get('ticketId',''))")

python -c "
import json
with open('.jb-pm-pipeline/$ACTIVE_TICKET.json', 'r', encoding='utf-8') as f:
    state = json.load(f)
state['phases']['frontendImplementation'] = True
with open('.jb-pm-pipeline/$ACTIVE_TICKET.json', 'w', encoding='utf-8') as f:
    json.dump(state, f, ensure_ascii=False, indent=2)
print('frontendImplementation = true')
"
```

## 9.6.9 输出目录结构

```
$BASE_DIR/
├── prd.md
├── prototype/
│   ├── index.html
│   └── ...
├── frontend/                 # 前端产出（可选，保留原始生成文件）
│   └── {page-name}.vue
└── ...

finance-saas-vue/
├── src/jinbeiguanjia/views/
│   └── {module}/
│       └── {page-name}.vue   # 实际部署的 Vue 文件
└── src/jinbeiguanjia/router.js  # 已注册路由
```

## 9.6.10 与原型设计的衔接说明

**原型 → 代码 的信息传递**：

| 原型元素 | 转换为 Vue 代码 |
|---------|----------------|
| `.search-bar` 内的筛选条件 | `#filters` 插槽内的 FilterText/FilterDateRange 等 |
| `.el-table th` | `<v-column>` 定义 |
| `.el-button`（新增/导出）| `#op` 插槽内的操作按钮 |
| `.modal` 内的表单 | `form_dialog.vue` 模板中的 `el-form-item` |
| `.el-drawer` 内的详情 | `detail_drawer.vue` 模板中的 `desc-item` |
| 菜单 active 状态 | 由路由系统自动处理 |

**注意**：原型中的样式（颜色、间距）由 `jb-pc-page-pipeline` 的设计规范覆盖，不需要从原型继承。原型主要传递**结构信息**（有哪些字段、按钮、表格列）。
