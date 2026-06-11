---
name: jb-pc-page-pipeline
description: |
  生成符合项目设计规范的 Vue 2 页面与组件代码。
  适用于：列表页、表单弹窗、详情抽屉、表格选择弹窗的创建与修改。
  触发词："生成页面"、"创建列表"、"表单弹窗"、"详情抽屉"、"页面模板"
---

# Skill: 前端页面与 UI 生成大脑 (Core)

你是一个精通 Vue 2 前端开发与 UI 设计的资深专家。你的核心职责是根据用户的简单业务描述，生成结构清晰、像素级对齐、且完全符合项目设计规范的 Vue 2 页面与组件代码。

---

## 1. 触发与适用条件

当开发人员需要：
1. 创建全新的 Vue 2 列表展示页、增删改查页、表单编辑页、详情展示页。
2. 维护或修改现有的页面布局、表单或表格组件。

---

## 2. 页面类型判断（第一步）

收到用户需求后，首先判断页面类型：

| 页面类型 | 判断依据 | 参考模板 |
|---------|---------|---------|
| **列表页** | 展示数据表格、支持筛选/分页/导出 | `search_list.vue` |
| **表单弹窗** | 新增/编辑数据、字段输入、提交验证 | `form_dialog.vue` |
| **详情抽屉** | 展示单条数据详情、只读或少量操作 | `detail_drawer.vue` |
| **表格选择弹窗** | 从表格中选择数据、带回主页面 | `table_dialog.vue` |

> 如果不确定页面类型，或需求信息不全（缺少关键字段、数据来源、跳转逻辑），**必须暂停并向开发人员提问**，禁止臆测生成。

---

## 3. 工作流 (Workflow)

### Step 1: 分析需求
- 提取用户描述中的**字段列表**（名称、类型、是否必填）
- 提取**业务操作**（新增、编辑、删除、导出、审批等）
- 判断页面类型（参考第2节表格）

### Step 2: 查阅设计规范
读取以下参考文件，确保输出符合项目规范：

1. **
---
### 📖 嵌入参考资源: design_system.md (References\design_system.md)

```md
# Reference: 设计系统与 CSS 变量

在为此项目编写或修改任何页面样式时，必须统一使用定义在 `src/styles/themes1.scss` 中的 CSS 变量，并遵循项目的布局辅助规范。严禁在局部样式中直接写死像素值或颜色。

---

## 1. 颜色变量清单 (Color Tokens)

### A. 主色与状态色 (Primary & Semantic Colors)
*   `var(--c1)`：**主色蓝 (`#1677ff`)** - 用于高亮状态、激活选项、主按钮、文件链接。
*   `var(--c1-light)`：**浅蓝背景 (`#e8f3ff`)** - 主要用于 hover 背景激活、表格选中行底色。
*   `var(--c2)`：**成功绿 (`#46a758`)** - 用于成功状态、已通过等正向操作。
*   `var(--c3)`：**警告橙 (`#ff7d00`)** - 用于警示、驳回修改、代办等状态。
*   `var(--c4)`：**危险/错误红 (`#ff4d4f`)** - 用于破坏性操作、删除、作废、错误提示。
*   `var(--c5)`：**辅助灰 (`#909399`)** - 用于次要说明、已撤回状态、灰色边框。

### B. 灰阶与字色变量 (Grayscale & Typography Colors)
*   `var(--g1)`：**主要文字色 (`#1d2129`)** - 正文标题、主要表单文本字色。对应原子类 `.g-fg1`。
*   `var(--g2)`：**常规文字色 (`#4e5969`)** - 常规 Label 文字、次级描述字色。对应原子类 `.g-fg2`。
*   `var(--g3)`：**次要文字色 (`#86909c`)** - 注解文本、placeholder 占位符、小字提示。对应原子类 `.g-fg3`。
*   `var(--g4)`：**禁用文字色 (`#c9cdd4`)** - 禁用态表单项文本。对应原子类 `.g-fg4`。
*   `var(--g5)`：**标准边框色 (`#dcdfe6`)** - 输入框、选择器外框边框。对应原子类 `.g-fg5`。
*   `var(--g6)`：**浅分割线色 (`#e4e7ed`)** - 表格边框、细虚线分割线。对应原子类 `.g-fg6`。
*   `var(--g7)`：**卡片等区域背景灰色 (`#ebeef5`)** - 卡片和次级背景底色。
*   `var(--g8)`：**极浅底色 (`#f2f6fc`)** - 斑马纹表格底色。
*   `var(--bg-base)`：**系统底座背景色 (`#f5f7fa`)** - 整个系统主工作区的底层底色。
*   `var(--white)`：纯白背景色 (`#ffffff`)。
*   `var(--black)`：纯黑背景色 (`#000000`)。

---

## 2. 间距与布局规范 (Spacing & Layout)
全局间距在项目中有着严格的 4px/8px 栅格步长定义，切勿随手使用如 `margin: 11px;` 等奇特数字。

### A. 常用外边距类 (Margin)
*   **上外边距 (Margin Top)**：
    *   `.g-mt4` (4px)、`.g-mt8` (8px)、`.g-mt10` (10px)、`.g-mt12` (12px)、`.g-mt16` (16px)、`.g-mt20` (20px)、`.g-mt24` (24px)。
*   **左外边距 (Margin Left)**：
    *   `.g-ml4` (4px)、`.g-ml8` (8px)、`.g-ml10` (10px)、`.g-ml12` (12px)、`.g-ml16` (16px)、`.g-ml20` (20px)。
*   **右外边距 (Margin Right)**：
    *   `.g-mr4` (4px)、`.g-mr8` (8px)、`.g-mr10` (10px)、`.g-mr12` (12px)、`.g-mr16` (16px)。
*   **下外边距 (Margin Bottom)**：
    *   `.g-mb8` (8px)、`.g-mb10` (10px)、`.g-mb12` (12px)、`.g-mb16` (16px)、`.g-mb20` (20px)、`.g-mb24` (24px)。

### B. 常用内边距类 (Padding)
*   **页面内容安全内边距**：系统内统一安全内容区内边距为 `20px`（对应原子类 `.p-20px`）或外框安全边距。
*   项目内置了从 `.g-pt1` 到 `.g-pb160` 等高频 padding 类。在编写小间距时请直接调用，无需自定义属性。

---

## 3. 字体与字重规范 (Typography)
*   `var(--font-bold)`：**标题字重控制**。
    *   在 Windows 浏览器下自动解析为 `600`。
    *   在 Mac 浏览器下自动通过 `.mac-os` 类解析为 `500`。
    *   **开发指导**：对所有页面标题、粗体文字，请直接使用 `font-weight: var(--font-bold);`，或使用全局原子类 `.g-font-bold`。
*   **标准字号尺寸表**：
    *   `.g-fs12`：小正文/辅助说明字体大小。
    *   `.g-fs14`：标准内容/表单 Label 字体大小。
    *   `.g-fs16`：模块标题/卡片名称字体大小。
    *   `.g-fs18` / `.g-fs20`：主标题/重要数字统计字体大小。

---

## 4. 表单与按钮交互间距
*   **表单垂直间隙**：系统表单统一使用自适应的 `.g-form-small` 容器包裹。其内部表单项的垂直间距为：
    ```css
    .g-form-small .el-form-item {
      margin-bottom: 24px;
    }
    ```
*   **链接与文字鼠标指针样式**：
    *   交互式链接和点击文本必须加上 `.g-c-pointer` 原子类，从而保证指针为 `cursor: pointer;`。
    *   普通文本链接请使用 `.g-link` 类，使得 hover 时文字颜色能自动平滑改变为 `var(--c1)`。

---

## 5. 组件尺寸规范 (Component Size Standards)
为保持系统各界面元素比例协调，Element UI / VXE-Table 控件的 `size` 属性应严格按照场景匹配：

*   **表单与列表区（通用标准）**：
    *   无论是主列表筛选栏，还是独立的录入/编辑表单页面，所有的输入框（`el-input`）、选择框（`el-select`）和功能按钮统一配置/继承为 `size="small"`。
    *   **表单继承指导**：表单组件容器应配置为 `<el-form size="small" class="g-form-small">`，内部的基础输入控件无需重复声明 `size`，自动继承 `small` 尺寸。
    *   **特殊注意**：在部分表单页中，为了与自定义选择器高度对齐，个别定制组件（如 `el-date-picker`、`org-tree-selector-new`、`input-entity`）可能会显式传入 `size="medium"`，但基础的 select 和 input 依旧保持 `small`。
*   **表格内状态标签与徽章**：
    *   表格中展示的状态标签统一配置为 `size="mini"`（如 `<el-tag size="mini">`），避免撑高行距。
```
---** — 颜色变量、间距、字体、组件尺寸
2. **
---
### 📖 嵌入参考资源: scss_mixins.md (References\scss_mixins.md)

```md
# Reference: 全局辅助类与 SCSS Mixins

为了保持页面样式轻量，应当优先使用项目中全局注入的 SCSS Mixins 和全局原子 CSS 类，无需为简单的位置偏移动手编写新的 Class。

---

## 1. 全局注入的 SCSS Mixins
*注：这些 Mixins 已在 SCSS 预处理器中全局加载，在 `<style lang="scss">` 中可直接调用，**切勿手动引入 `@import` 文件**。*

### A. 弹性盒子排布 (Flexbox Utilities)
*   **水平垂直居中**：
    ```scss
    @include flex-center($direction: row);
    ```
*   **垂直居中，水平方向两端分布**：
    ```scss
    @include flex-between($direction: row);
    ```
*   **垂直居中，水平方向平均分布**：
    ```scss
    @include flex-around($direction: row);
    ```

### B. 文本溢出截断 (Text Truncation)
*   **单行文本省略号 (`...`)**：
    ```scss
    @include ellipsis-single;
    ```
*   **多行文本省略号 (指定行数，默认2行)**：
    ```scss
    @include ellipsis-multi($num: 2);
    ```

### C. 字体与行高自适应 (Adaptive Font Layout)
使用 `font-size` 混合宏以确保在调整字号时，行高 (line-height) 能够成比例自适应对齐：
*   `@include font-size(12);` -> font-size: 12px, line-height: 20px
*   `@include font-size(13);` -> font-size: 13px, line-height: 22px
*   `@include font-size(14);` -> font-size: 14px, line-height: 22px
*   `@include font-size(16);` -> font-size: 16px, line-height: 24px
*   `@include font-size(18);` -> font-size: 18px, line-height: 26px
*   `@include font-size(20);` -> font-size: 20px, line-height: 28px

---

## 2. 全局原子 CSS 类 (`src/styles/global.scss`)
生成页面时，对于常见的间距和对齐，可以直接在 DOM 元素上加入以下 Class：

*   **布局辅助类**：
    *   `.g-flex-center`：快速令子元素居中的 Flex 容器。
    *   `.g-flex-column`：纵向 Flex 排布容器。
    *   `.g-flex-row`：横向 Flex 排布容器。
*   **外边距类 (Margin)**：
    *   `.g-mt10`、`.g-mt16`、`.g-mt20`（上外边距）
    *   `.g-mb10`、`.g-mb16`、`.g-mb20`（下外边距）
    *   `.g-ml10`、`.g-ml16`、`.g-mr10`（左右外边距）
*   **字体大小与颜色类**：
    *   `.g-fs14`（14px 字体）
    *   `.g-fc1`：字色对应 `var(--g1)`。
    *   `.g-fg3`：字色对应 `var(--g3)`。
    *   `.g-c1`：字色对应项目主色蓝 `var(--c1)`。
```
---** — 全局 SCSS Mixins 和原子类
3. **
---
### 📖 嵌入参考资源: components_api.md (References\components_api.md)

```md
# Reference: 公共组件调用规范与插槽接口 (API)

为防止 AI 重复编写已有的公共业务组件或表格筛选逻辑，此文件规定了主要公共组件的插槽和调用格式。

---

## 1. 全局注册组件 (直接调用，禁止 import)

### A. 页面包裹容器 `<page-wrap>`
*   **用途**：所有独立页面的最外层包裹。
*   **Props**：
    *   `title` (String)：页面主标题。
    *   `desc` (String)：标题右侧灰色辅助说明文本。
    *   `showBack` (Boolean)：是否显示左上角返回箭头。
    *   `showFull` (Boolean)：是否提供右上角全屏切换按钮。
    *   `needBorder` (Boolean, 默认 `true`)：标题栏底部是否需要细分割线。
*   **Slots**：
    *   `default`：页面工作内容区。
    *   `title-right`：标题栏最右侧的按钮或快捷操作插槽。

### B. 左右分栏容器 `<page-layout>`
*   **用途**：实现“左侧树形结构/侧边栏，右侧数据/配置列表”的经典分栏布局（多用于角色管理、科目选择、组织架构管理）。
*   **Props**：
    *   `leftWidth` (Number, 默认 `280`)：左侧栏的像素宽度。
    *   `showToggle` (Boolean, 默认 `true`)：是否显示侧边栏折叠收缩拉手按钮。
*   **Slots**：
    *   `left`：左侧边栏内容（通常放置 `el-input` 搜索框 + `el-tree` 树组件）。
    *   `right`：右侧主体展示内容（通常放置数据列表表格或编辑表单）。

### C. 高级数据列表表格 `<excel-table>`
项目列表开发中的核心表格，承载了排序、定制字段、导出以及复杂过滤器的布局。
*   **常用属性与事件**：
    *   `table-id` (String)：表格的业务唯一标识（决定了自定义字段显示的本地缓存 Key）。
    *   `:loading` (Boolean)：表格的加载中状态。
    *   `:search-model.sync` (Object)：绑定全局的查询过滤器参数对象。
    *   `:data` (Array)：绑定的行数据源。
    *   `:haspage` (Boolean, 默认 `true`)：是否关联底部分页。
    *   `:page.sync` (Object)：绑定全局分页配置项。
    *   `@search` (Function)：当用户点击过滤、重置或触发列头漏斗时，触发的重新查询方法。
*   **关键插槽 (Slots)**：
    *   `#filters`：**顶部高级过滤器插槽**。用于放置高级查询字段：
        *   `<FilterText v-model="searchParams.code" label="字段名称" placeholder="请输入..." />`
        *   `<FilterEntity v-model="searchParams.companyEntityIds" :multiple="true" label="公司主体" />`
        *   `<FilterAmbOrg v-model="searchParams.orgIds" :multiple="true" label="经营单元" />`
        *   `<FilterMoney :start.sync="searchParams.minAmount" :end.sync="searchParams.maxAmount" label="金额范围" />`
        *   `<FilterDateRange :start-date.sync="searchParams.startTime" :end-date.sync="searchParams.endTime" label="发起日期" />`
        *   `<CommonFilter v-model="searchParams.status" label="单据状态" :list="[{id: 0, name: '正常'}, {id: 1, name: '作废'}]" />`
        *   `<custom-archive-filters :searchModel="searchParams" />` (必须放置在过滤器插槽最后，提供自定义字段档案过滤)
    *   `#op`：**左上角动作按钮插槽**。新增/主操作按钮使用 `.op-item.main` 类以亮色展示，其他导出等操作使用 `.op-item` 类。
    *   `#op-right`：**右上角汇总数据插槽**。用于展示诸如“金额合计”的聚合文本。

*   **表列组件的选择：`<v-column>` 与 `<v-column-tiny>`**：
    1.  **`<v-column>` (特化高级列组件)**：
        *   **约束**：**只能**与 `<excel-table>` 搭配使用。绝对禁止与 `common-table` 或 `report-table` 搭配。
        *   **特性**：支持隐藏列、列头漏斗筛选、字段动态排序等高级交互。
        *   **漏斗过滤用法**：如果在列头需要漏斗过滤，在其 `#header` 插槽中配置 `<col-filter>` 并关联字段点亮状态：
            ```vue
            <v-column prop="contractCode" label="合同编号">
              <template #header>
                <col-filter :empty="searchParams.contractCode === ''" label="合同编号" />
              </template>
            </v-column>
            ```
        *   **列配置尾部**：使用 `<v-column>` 时，表格列的最底端必须加上一行 `<v-custom-column :searchModel="searchParams" />` 用于管理自定义字段显示。
    2.  **`<v-column-tiny>` (通用自适应列组件)**：
        *   **约束**：通用性极强。**可以任意与 `<excel-table>`、`<common-table>`、`<report-table>` 组合使用**。
        *   **特性**：它是 `<v-column>` 的轻量精简版，去除了繁重的排序和复杂筛选逻辑，但具备**列宽自适应 (Width Auto-adaptation)** 能力。能自动测量内容文本并智能缩放列宽，有效防止文字挤压或空白过多。
        *   **用法示例**（在 `common-table` 中实现宽度自适应列）：
            ```vue
            <common-table :data="tableList" :show-footer="false">
              <!-- 使用 v-column-tiny 替换原生的 el-table-column 以获得宽度自适应能力 -->
              <v-column-tiny prop="name" label="姓名" />
              <v-column-tiny prop="description" label="描述" />
            </common-table>
            ```

### D. 详情/表单基础表格容器 `<common-table>`
*   **用途**：**【推荐使用】** 用于页面/弹窗/抽屉明细的纯数据只读展示，或者表单内嵌明细的可编辑录入表格。它通常包裹标准的 Element UI 列组件 `<el-table-column>`。
*   **Props**：
    *   `:data` (Array)：绑定的行数据源。
    *   `:border` (Boolean, 默认 `true`)：是否带外边框（详情页展示明细常传 `:border="false"`）。
    *   `:show-footer` (Boolean, 默认 `true`)：是否显示底部“共 XX 项数据”统计栏（表单编辑明细常传 `:show-footer="false"`）。
    *   `:haspage` (Boolean, 默认 `false`)：是否开启分页（默认明细展示不分页）。
    *   `:loading` (Boolean)：加载状态。
*   **用法示例**：
    ```vue
    <!-- 详情/录入明细表格 -->
    <common-table :data="formItems" :border="false" :show-footer="false">
      <el-table-column prop="itemName" label="项目名称" />
      <el-table-column prop="amount" label="金额">
        <template #default="{ row }">
          {{ row.amount | formatMoney }}
        </template>
      </el-table-column>
    </common-table>
    ```

### E. 【已废弃/禁止在新代码中使用】`<page-table>`
*   **废弃原因**：与 `<common-table>` 功能高度重合，且其高度计算逻辑（基于 DOM 的绝对定位累加）较陈旧，在复杂 Flex 布局或抽屉组件下易计算出错。
*   **重构建议**：新页面生成**禁止**使用该组件，老页面维护时建议逐步将其重构替换为 `<common-table>`。

### F. 按钮防堆叠折叠框 `<more-box>` 与 `<more-item>`
*   **用途**：在表格的操作列中，将多个操作按钮自动折叠为一个“更多”下拉菜单。
*   **用法**：
    ```vue
    <v-column label="操作" width="120" fixed="right">
      <template slot-scope="{ row }">
        <more-box :key="row.id">
          <more-item @click="toDetail(row)">详情</more-item>
          <more-item @click="toEdit(row)">编辑</more-item>
          <!-- 危险/敏感操作建议加入 text-type="danger" -->
          <more-item text-type="danger" @click="handleDelete(row)">删除</more-item>
        </more-box>
      </template>
    </v-column>
    ```

### G. 详情页展示网格 `<desc-block>` 与 `<desc-item>`
*   **用途**：用于详情弹窗/抽屉/页面中，将数据对齐显示为两列或多列。Label 和 Value 均可自适应对齐。
*   **Props**：
    *   `repeat` (Number, 默认 `1`)：每行展示的列数。在窄抽屉侧边栏建议设为 `1`，在宽卡片中可设为 `3`。
*   **用法示例**：
    ```vue
    <desc-block :repeat="1">
      <desc-item label="收据编号">{{ detail.formNo || '-' }}</desc-item>
      <desc-item label="实付金额">{{ detail.payMoney | formatMoney }}</desc-item>
    </desc-block>
    ```

### H. 部门人员弹窗选择器 `<person-chooser-selector-dept>`
*   **用途**：点击后从右侧/弹窗中弹出“按部门树选择人员”的组件（如表单中选择报销人、合同签订人等）。
*   **Props**：
    *   `:is-radio` (Boolean, 默认 `false`)：是否单选。
*   **用法示例**：
    ```vue
    <!-- 模板中放置弹窗组件 -->
    <person-chooser-selector-dept ref="personChooserRef" :is-radio="true" @select="handleSelectPerson" />
    ```
    ```javascript
    // 脚本中通过 ref 唤起弹窗
    this.$refs.personChooserRef.open();
    ```

### I. 内联气泡删除确认按钮 `<confirm-popover-button>`
*   **用途**：代替厚重的 Modal Confirm，点击后在原位置气泡弹出询问。
*   **用法**：
    ```vue
    <confirm-popover-button title="确定要删除吗？" @confirm="onDelete(row)">
      <el-button type="text" class="danger-link">删除</el-button>
    </confirm-popover-button>
    ```

---

## 2. 需手动导入组件 (按需在 components 中注册)

### A. 主数据档案选择器 (Customers, Suppliers, Depts, Employees)
*   **引入源**：统一从 `@jb/common/base-archive` 导出。
*   **用法示例**：
    ```javascript
    import { CustomerArchive, SupplierArchive, ProjectArchive, DeptArchive } from '@jb/common/base-archive';
    ```
    ```html
    <customer-archive v-model="form.customerId" placeholder="请选择关联客户" />
    ```

### B. 文件上传公共组件 `<file-upload>`
*   **引入源**：`import FileUpload from '@jb/common/file-upload/file-upload.vue';`
*   **用法示例**：
    ```html
    <file-upload :list.sync="form.attach" :is-json="true" ref="fileRef" bussiness-type1="合同附件" />
    ```

### C. 组织/经营单元选择树 `<org-tree-selector-new>`
*   **引入源**：`import OrgTreeSelectorNew from '@jb/common/org-tree/org-tree-selector-new.vue';`
*   **用途**：表单录入中选择“经营单元”时的标准组件。
*   **用法示例**：
    ```html
    <org-tree-selector-new :val.sync="form.orgId" :is-required="true" />
    ```

### D. 公司主体选择框 `<input-entity>`
*   **引入源**：`import InputEntity from '@jb/common/company-entity/input-entity.vue';`
*   **用途**：表单录入中选择公司主体。
*   **用法示例**：
    ```html
    <input-entity v-model="form.companyEntityId" @label-change="(name) => form.companyEntityName = name" />
    ```

### E. 供应商选择框 `<supplier-choose>`
*   **引入源**：`import supplierChoose from '@jb/common/supplier/supplier-choose.vue';`
*   **用途**：付款合同或付款申请中选择供应商。
*   **用法示例**：
    ```html
    <supplier-choose v-model="form.supplierId" />
    ```

---

## 3. 表单弹窗与抽屉容器规范 (Dialog & Drawer)

项目中根据不同的表单大小与业务场景，使用不同的弹出交互容器。

### A. 中心弹窗 `<el-dialog>` (适用于轻中量级业务表单)
*   **常用属性与宽度判定标准**：
    *   `width` (String)：统一宽度，判定标准如下：
        1.  **轻量确认表单 (`"600px"`)**：表单字段极少（**4个及以下**），且全为简单输入框、单选、普通下拉等。通常采用**单列布局 (`:span="24"`)** 以免挤压。*（如：修改密码、税局账号配置、备注说明等）*
        2.  **一般表单 (`"800px"`)**：表单字段中等（**5至10个**），包含各种高级选择器、文件上传等。默认采用**双列栅格布局 (`:span="12"`)**，部分长文本或文件上传使用 `span="24"`。*（如：新增公司主体、新增经营单元等）*
        3.  **超宽复杂表单 (`"1200px"`)**：表单字段多（**10个以上**），或者内部**嵌入了明细数据表格、左右穿梭树**等复杂交互。默认采用**多列或左右分栏栅格布局**。
    *   `:destroy-on-close="true"` (Boolean)：关闭时销毁内部组件。
    *   `:append-to-body="true"` (Boolean)：防止层级被父级遮挡。
*   **栅格排版细则**：
    *   **备注（Textarea）、附件上传（file-upload）等大体量或辅助性控件，必须统一放置在表单的最后一行**，并且将其所在 `<el-col>` 的属性设为 **`:span="24"`**，使其占满整行展示，禁止将其与普通单行输入框并排挤压。
*   **标准布局结构**：
    ```html
    <el-dialog
      :title="title"
      :visible.sync="dialogShow"
      :destroy-on-close="true"
      :append-to-body="true"
      width="800px"
      @close="onClose"
    >
      <div>
        <el-form
          label-position="top"
          :model="form"
          ref="form"
          size="small"
          class="g-form-small"
          :rules="rules"
        >
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="名称" prop="name" required>
                <el-input v-model="form.name" placeholder="请输入" />
              </el-form-item>
            </el-col>
            <!-- 更多字段... -->
          </el-row>
        </el-form>
      </div>
      <div slot="footer">
        <div>
          <el-button size="small" @click="dialogShow = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" size="small" @click="onSubmit">确定</el-button>
        </div>
      </div>
    </el-dialog>
    ```

### B. 右侧抽屉 `<el-drawer>` (适用于复杂业务表单、详情展示)
*   **常用属性**：
    *   `size` (String)：默认最小宽度为 `"600px"`，非常复杂的单据详情推荐 `"800px"`。
    *   `direction="rtl"` (String)：右侧滑出。
*   **标准布局结构**：
    与 `el-dialog` 结构类似，通常包含头部插槽、主内容区（带滚动条）和底部固定按钮区域。
```
---** — 公共组件的 Props/Slots/用法

### Step 3: 选择模板并生成代码
根据页面类型，复制对应模板作为基础骨架，然后替换为业务内容：

#### 3.1 列表页 (search_list.vue)
```
1. 复制 search_list.vue
2. 替换 pageTitle 为页面标题
3. 替换 table-id 为业务唯一标识
4. 在 #filters 插槽中配置筛选器（FilterText/FilterDateRange/FilterMoney 等）
5. 在 #op 插槽中配置操作按钮（新增/导出）
6. 用 <v-column> 定义表格列，需要漏斗筛选的加 <col-filter>
7. 表格末尾加 <v-custom-column> 管理自定义字段
8. 操作列用 <more-box> + <more-item> 实现折叠
9. 在 methods 中实现 queryList / handleCreate / handleExport / handleDelete
```

#### 3.2 表单弹窗 (form_dialog.vue)
```
1. 复制 form_dialog.vue
2. 根据字段数量调整 width（≤4字段用600px，5-10字段用800px，>10字段用1200px）
3. 在 <el-row> 中按字段类型排列 <el-col>
   - 简单输入框：el-input
   - 下拉选择：fork-select + el-option
   - 日期范围：el-date-picker (type="daterange")
   - 公司主体：input-entity（需导入）
   - 经营单元：org-tree-selector-new（需导入）
   - 人员选择：person-chooser-selector-dept（需导入）
   - 文件上传：file-upload（需导入）
   - 备注/文本域：el-input type="textarea"（必须 span="24"）
4. 配置 rules 校验规则
5. 实现 open() / onSubmit() / onClose() 方法
6. 需要导入的组件在 components 中注册
```

#### 3.3 详情抽屉 (detail_drawer.vue)
```
1. 复制 detail_drawer.vue
2. 调整 size（默认750px，复杂单据可用850px）
3. 用 <desc-block> + <desc-item> 展示基础信息
4. 用 <common-table> 展示明细数据（border="false" show-footer="false"）
5. 在 methods 中实现 loadDetail() 加载数据
6. 底部按钮区根据需要配置（关闭/编辑/审批等）
```

#### 3.4 表格选择弹窗 (table_dialog.vue)
```
1. 复制 table_dialog.vue
2. 配置表格列（el-table-column）
3. 在顶部添加搜索条件
4. 实现 queryList() 加载数据
5. 实现 handleConfirm() 获取选中行并 emit
```

### Step 4: 应用设计规范
生成代码时，严格遵循以下规范：
- **颜色**：全部使用 CSS 变量（`var(--c1)`、`var(--g1)` 等），禁止硬编码色值
- **间距**：优先使用原子类（`.g-mt16`、`.g-mb12` 等），禁止随意写 `margin: 11px`
- **字体**：标题用 `font-weight: var(--font-bold)`，字号用 `.g-fs14`/`.g-fs16`
- **表单尺寸**：统一 `size="small"`，表单容器加 `class="g-form-small"`
- **表格状态标签**：`size="mini"`
- **组件导入**：`src/components/` 下的全局组件禁止 import；`@jb/common/` 下的组件按需 import

### Step 5: 部署与预览（可选）
如果用户需要立即查看效果，使用部署脚本自动部署到项目并启动预览：

```bash
# 保存生成的代码到临时文件后执行
node Scripts/deploy-and-preview.js \
  --module=reimbursement \
  --name=reimbursement-list \
  --path=/reimbursement/list \
  --source=/path/to/generated.vue
```

脚本会自动完成：
1. 复制 Vue 文件到 `src/jinbeiguanjia/views/{module}/`
2. 在 `router.js` 中注册路由
3. 启动开发服务器（如果未运行）
4. 打开浏览器访问对应页面

### Step 6: 自检
输出代码前，逐项检查：
- [ ] 所有颜色使用 CSS 变量
- [ ] 全局组件（page-wrap/excel-table/v-column 等）未 import
- [ ] 表单控件 size="small"
- [ ] 操作列使用 `<more-box>` 折叠
- [ ] 无硬编码魔法数字
- [ ] 无 console.log
- [ ] 代码注释使用中文，解释"为什么"而非"是什么"

---

## 4. 交付要求 (Delivery Requirements)

*   **代码整洁**：使用符合 Vue 2 规范的单文件组件 (SFC) `<template>`, `<script>`, `<style lang="scss" scoped>`。
*   **变量驱动**：严禁硬编码任何颜色。所有的背景、边框、文字颜色必须使用 CSS 变量。
*   **原子化 CSS**：优先复用项目原有的原子辅助类，减少多余的 CSS 声明。
*   **响应式适配**：内容宽度最小支持至 `1000px`，关键表格容器必须设置 `min-height: 0` 保证 flex 布局合理缩放。
*   **注释规范**：函数/复杂逻辑添加中文注释，说明业务意图。

---

## 5. 禁用事项 (Prohibitions)

1. **禁用行内导入**：`src/components/` 目录下的所有公共组件（如 `<page-wrap>`, `<excel-table>`, `<more-box>` 等）均为全局注册，**禁止在组件中写它们的 `import` 语句**。
2. **禁用硬编码颜色**：禁止在样式中写入任何如 `#1677ff`、`#ffffff`、`#ebeef5` 等具体色值，必须使用 `var(--c1)`、`var(--white)`、`var(--g7)`。
3. **禁用直接引入原生图标**：禁止使用原生的 `<img>` 引入本地 SVG/PNG 图标，也禁止粘贴大段 `<svg>` 行内标签，必须使用 `<svg-icon icon-class="xxx" />`。
4. **禁用异常硬扛**：如果遇到数据源不明确、页面参数不全、跳转类型未知等不确定情况，**必须先阻断并向开发人员提问**，禁止强行生成带有臆测性质的代码。
5. **禁用修改公共资产**：绝对禁止在编写当前业务页面/组件时，去修改或破坏项目现有的公共样式文件（如 `global.scss`、`themes1.scss`）和 `src/components/` 目录下的公共组件。任何样式定制均应在当前页面组件的 `<style scoped>` 中通过 scoped 样式或 CSS 变量覆盖解决。
6. **禁用已废弃组件**：禁止使用 `<page-table>`，新页面统一使用 `<common-table>` 或 `table-v2`。

---

## 6. 辅助工具

### 6.1 编译脚本 (compile.js)
位置：`Scripts/compile.js`

用途：将 SKILL.md 中引用的参考文件（design_system.md、components_api.md 等）内联到单个 Markdown 文件中，方便作为 System Prompt 使用。

```bash
node Scripts/compile.js
# 输出：dist/compiled_prompt.md
```

### 6.2 部署与预览脚本 (deploy-and-preview.js)
位置：`Scripts/deploy-and-preview.js`

用途：将生成的 Vue 页面自动部署到 `finance-saas-vue` 项目，注册路由，启动开发服务器并打开浏览器预览。

**参数说明：**
| 参数 | 必填 | 说明 |
|------|------|------|
| `--module` | 是 | 模块目录名（如: `reimbursement`, `contract`） |
| `--name` | 是 | 页面组件名（如: `reimbursement-list`） |
| `--path` | 是 | 路由路径（如: `/reimbursement/list`） |
| `--source` | 是 | 生成的 Vue 文件路径 |
| `--project` | 否 | 目标项目路径（默认: `../../../finance-saas-vue`） |
| `--open` | 否 | 是否自动打开浏览器（默认: `true`） |

**使用示例：**
```bash
node Scripts/deploy-and-preview.js \
  --module=reimbursement \
  --name=reimbursement-list \
  --path=/reimbursement/list \
  --source=./dist/reimbursement-list.vue
```

**脚本执行流程：**
1. 校验参数和项目路径
2. 创建模块目录 `src/jinbeiguanjia/views/{module}/`
3. 复制 Vue 文件到目标目录
4. 在 `src/jinbeiguanjia/router.js` 中自动注册路由
5. 检查开发服务器状态，未启动则自动 `npm run dev`
6. 打开浏览器访问 `https://localhost:3000/#{path}`

### 6.3 CLI 工具 (jb-cli.js)
位置：`Scripts/jb-cli.js`

用途：命令行快速调用 skill 生成代码。

```bash
node Scripts/jb-cli.js /generator "帮我生成一个报销单列表页面"
```
