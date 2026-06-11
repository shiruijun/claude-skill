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

### C. 高性能表格 `<table-v2>`（新页面**强制使用**）
基于 `vxe-table` 的高性能表格组件，面向大数据量场景优化。支持虚拟滚动、列管理、批量选择、筛选系统集成、主题系统、树形表格。
*   **全局注册**：`<table-v2>` 全局注册，无需 import；但列组件 `TableColumn` / `TableColgroup` 需要手动导入注册。
*   **常用 Props**：`table-id`（必填）、`data`、`loading`、`haspage`、`page`（支持 `.sync`）、`search-model`（支持 `.sync`）、`show-select`、`theme`（默认 `excel-table`）等。
*   **完整文档**：详见第 4 节《高频遗漏组件补充》A 项。

### D. 【旧版/存量维护用】`<excel-table>`
旧版核心表格，基于 Element UI 封装。新页面禁止使用，仅在存量页面维护时使用。
*   **重构建议**：存量页面维护时，逐步将其重构替换为 `<table-v2>`。
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

*   **表列组件：`<v-column>` 与 `<v-column-tiny>`（存量兼容，新页面不推荐）**：
    1.  **`<v-column>`**：**存量兼容**：原 `<excel-table>` 的列组件，在 `<table-v2>` 中仍可正常工作（支持隐藏列、列头漏斗筛选 `col-filter`、字段动态排序）。**新页面推荐使用 `<table-column>`**。
    2.  **`<v-column-tiny>`**：可与 `<excel-table>`、`<common-table>` 组合使用，具备列宽自适应能力。

### E. 详情/表单基础表格容器 `<common-table>`
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

### F. 【已废弃/禁止在新代码中使用】`<page-table>`
*   **废弃原因**：与 `<common-table>` 功能高度重合，且其高度计算逻辑（基于 DOM 的绝对定位累加）较陈旧，在复杂 Flex 布局或抽屉组件下易计算出错。
*   **重构建议**：新页面生成**禁止**使用该组件，老页面维护时建议逐步将其重构替换为 `<common-table>`。

### G. 按钮防堆叠折叠框 `<more-box>` 与 `<more-item>`
*   **用途**：在表格的操作列中，将多个操作按钮自动折叠为一个”更多”下拉菜单。
*   **用法**：
    ```vue
    <!-- 在 table-v2 中使用 -->
    <table-column label=”操作” width=”120” fixed=”right”>
      <template #default=”{ row }”>
        <more-box :key=”row.id”>
          <more-item @click=”toDetail(row)”>详情</more-item>
          <more-item @click=”toEdit(row)”>编辑</more-item>
          <!-- 危险/敏感操作建议加入 text-type=”danger” -->
          <more-item text-type=”danger” @click=”handleDelete(row)”>删除</more-item>
        </more-box>
      </template>
    </table-column>
    ```

### H. 详情页展示网格 `<desc-block>` 与 `<desc-item>`
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

### I. 部门人员弹窗选择器 `<person-chooser-selector-dept>`
*   **用途**：点击后从右侧/弹窗中弹出”按部门树选择人员”的组件（如表单中选择报销人、合同签订人等）。
*   **注意**：该组件**没有输入框外观**，必须通过 `ref` 唤起弹窗。在表单中使用时，应配合只读 `el-input` 展示已选人员。
*   **Props**：
    *   `:is-radio` (Boolean, 默认 `false`)：是否单选。
*   **用法示例**：
    ```vue
    <template>
      <!-- 表单中展示已选人员，点击唤起弹窗 -->
      <el-form-item label=”负责人”>
        <el-input
          v-model=”form.personName”
          readonly
          placeholder=”请选择负责人”
          @focus=”$refs.personChooserRef.open()”
        />
      </el-form-item>

      <!-- 弹窗组件放在表单外（无需占据布局） -->
      <person-chooser-selector-dept
        ref=”personChooserRef”
        :is-radio=”true”
        @select=”handleSelectPerson”
      />
    </template>
    ```
    ```javascript
    methods: {
      handleSelectPerson(item) {
        this.form.personId = item.id;
        this.form.personName = item.name;
      },
    }
    ```

### J. 内联气泡删除确认按钮 `<confirm-popover-button>`
*   **用途**：代替厚重的 Modal Confirm，点击后在原位置气泡弹出询问。
*   **用法**：
    ```vue
    <confirm-popover-button title="确定要删除吗？" @confirm="onDelete(row)">
      <el-button type="text" class="danger-link">删除</el-button>
    </confirm-popover-button>
    ```

### K. 增强下拉选择器 `<fork-select>`
*   **用途**：替代原生 `<el-select>` 的增强版下拉选择器，支持更丰富的交互和样式一致性。**全局注册，无需 import**。
*   **用法**：与 `<el-select>` 完全一致，内部包裹 `<el-option>` 使用。
    ```vue
    <el-form-item label="状态" prop="status">
      <fork-select
        v-model="form.status"
        placeholder="请选择"
        style="width: 100%"
        clearable
      >
        <el-option
          v-for="item in statusList"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </fork-select>
    </el-form-item>
    ```

---

## 2. 图标系统

项目中同时使用两套图标系统，根据场景选择：

### A. 项目本地图标（`unplugin-icons` 自动注册）
*   **来源**：`src/svg-icons/` 目录下的 SVG 文件。
*   **机制**：`vite.config.js` 中配置了 `IconsResolver({ prefix: '' })`，SVG 文件名会自动映射为 Vue 组件。
*   **用法**：`<svg-{文件名} class="icon" />`，全局注册，**无需 import**。
    ```vue
    <!-- filter-add.svg 对应 -->
    <svg-filter-add class="icon" />
    <!-- icon-download.svg 对应 -->
    <svg-icon-download class="icon" />
    ```

### B. IconPark SVG Sprite（CDN 加载）
*   **来源**：通过 `index.html` CDN 加载的 IconPark 图标库。
*   **用法**：使用标准 SVG `use` 语法引用。
    ```vue
    <svg class="iconpark-icon">
      <use href="#icon-name" />
    </svg>
    ```
*   **注意**：CDN 有 Referer ACL 限制，本地 curl 提取图标列表时需带 `-H "Referer: https://b.jingbeiguanjia.com/"`。

---

## 3. 需手动导入组件 (按需在 components 中注册)

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

---

## 4. 高频遗漏组件补充

### A. 高性能表格 `<table-v2>`（新页面**必须**使用）
*   **用途**：基于 `vxe-table` 的高性能表格，替代旧版 `excel-table` / `page-table`。支持虚拟滚动、列管理、批量选择、筛选系统集成、树形表格。
*   **全局注册**：`<table-v2>` 全局注册，无需 import；但列组件 `TableColumn` / `TableColgroup` 需要手动导入。
*   **基础用法**：
    ```vue
    <template>
      <table-v2
        table-id="my-table"
        :data="tableData"
        :loading="loading"
        :haspage="true"
        :page.sync="page"
        :search-model.sync="searchModel"
        @search="queryList"
        @reset="handleReset"
      >
        <template #filters>
          <FilterText v-model="searchModel.keyword" label="关键词" placeholder="请输入" />
        </template>
        <template #op>
          <div class="op-item" @click="queryList">刷新</div>
        </template>
        <table-column prop="name" label="名称" />
        <table-column prop="amount" label="金额" align="right" />
        <table-column label="操作" width="140">
          <template #default="{ row }">
            <el-button type="text" @click="handleView(row)">查看</el-button>
          </template>
        </table-column>
      </table-v2>
    </template>
    <script>
    import { defineComponent } from 'vue';
    import { TableColumn } from '@comp/table-v2';
    export default defineComponent({ components: { TableColumn } });
    </script>
    ```
*   **常用 Props**：
    | 属性 | 类型 | 默认值 | 说明 |
    |------|------|--------|------|
    | `table-id` | String | - | **必填**，用于本地缓存 key |
    | `data` | Array | `[]` | 表格数据 |
    | `loading` | Boolean | `false` | 加载状态 |
    | `haspage` | Boolean | `false` | 是否显示分页 |
    | `page` | Object | `null` | 分页对象（支持 `.sync`） |
    | `search-model` | Object | `null` | 搜索条件（支持 `.sync`） |
    | `show-select` | Boolean | `false` | 是否开启选择列 |
    | `select-key` | String | `'id'` | 选择唯一键 |
    | `auto-width` | Boolean | `true` | 是否启用自动列宽计算 |
    | `show-field` | Boolean | `true` | 是否显示字段管理入口 |
    | `theme` | String | `'excel-table'` | 主题：`excel-table` / `common-table` / `report-table` / `page-table` |
    | `show-table-footer` | Boolean | `false` | 是否显示表尾汇总 |
    | `footer-data` | Array | `[]` | 表尾汇总数据 |
    | `tree-props` | Object | `null` | 树形配置（如 `{ childrenField: 'children' }`） |
    | `virtual-scroll-threshold-rows` | Number | `400` | 虚拟滚动阈值 |
*   **列组件 `TableColumn` 常用属性**：
    | 属性 | 说明 |
    |------|------|
    | `prop` | 列字段名 |
    | `label` | 列标题 |
    | `width` / `min-width` | 列宽/最小列宽 |
    | `max-width` | 最大宽度限制（用于自动宽度计算） |
    | `always` | 是否始终显示（不受列显示/隐藏影响） |
    | `width-fix` | 固定宽度（跳过自动宽度计算） |
*   **关键插槽**：`#filters`、`#op`、`#op-right`、`#multiple-op`、`#header`、`#footer`、`#search-custom`、`#op-bottom`
*   **多级表头（`TableColgroup`）**：
    使用 `TableColgroup` 实现多级表头合并。注意：使用 colgroup 会禁用冻结列与列显示/隐藏。
    ```vue
    <script>
    import { TableColumn, TableColgroup } from '@comp/table-v2';
    export default { components: { TableColumn, TableColgroup } };
    </script>

    <table-v2 table-id="report-table" :data="tableData">
      <table-column prop="name" label="名称" />
      <table-colgroup label="金额信息">
        <table-column prop="amount" label="金额" />
        <table-column prop="tax" label="税额" />
      </table-colgroup>
    </table-v2>
    ```
*   **注意事项**：
    1. `table-id` 必填，用于列宽/列显示/搜索条件缓存。
    2. 数据量超过 `virtual-scroll-threshold-rows`（默认 400）后自动启用虚拟滚动，此时行高固定，内容多行不会自动撑高。
    3. 使用 `TableColgroup` 会禁用冻结列与列显示/隐藏。
    4. 导出请使用 ExcelJS 自定义方案，组件内置 `exportData()` 已禁用。

### B. 文件导入组件 `<import-file>`
*   **用途**：封装了上传弹窗 + 模板下载的导入功能。点击 slot 内容触发弹窗。
*   **Props**：
    | 属性 | 类型 | 说明 |
    |------|------|------|
    | `url` | String | 上传接口路径（相对路径，自动拼接 baseURL） |
    | `title` | String | 弹窗标题 |
    | `temp-url` | String | 模板下载接口地址 |
    | `temp-title` | String | 模板名称（显示为"下载《xxx》"） |
    | `t-data` | Object | 模板下载接口的 POST 数据 |
    | `data` | Object | 上传时的额外表单数据 |
    | `accept` | String | 接受文件类型，默认 `.xlsx` |
    | `file-size` | Number | 限制文件大小（MB） |
    | `is-local` | Boolean | `temp-url` 是否为本地静态文件链接 |
*   **事件**：`success(resp)`、`error(err)`
*   **用法示例**：
    ```vue
    <import-file
      url="api/import/excel"
      title="导入数据"
      temp-url="api/import/template"
      temp-title="导入模板"
      @success="onImportSuccess"
      @error="onImportError"
    >
      <div class="op-item">导入</div>
    </import-file>
    ```

### C. 数字输入框 `<number-input>`
*   **用途**：替代原生 `el-input` 的数字输入，自动格式化小数位、支持百分比后缀、非负数限制。
*   **Props**：
    | 属性 | 类型 | 默认值 | 说明 |
    |------|------|--------|------|
    | `value` | String/Number | - | 绑定值（使用 `v-model`） |
    | `nonnegative` | Boolean | `false` | 是否限制为非负数 |
    | `digit` | Number | `2` | 保留小数位数 |
    | `ratio` | Boolean | `false` | 是否显示 `%` 后缀 |
*   **用法示例**：
    ```vue
    <!-- 金额输入，保留2位小数 -->
    <number-input v-model="form.amount" :digit="2" />
    <!-- 税率输入，百分比形式 -->
    <number-input v-model="form.taxRate" :digit="2" :ratio="true" />
    <!-- 数量输入，非负整数 -->
    <number-input v-model="form.qty" :digit="0" :nonnegative="true" />
    ```

### D. 文字省略 `<text-ellipsis>`
*   **用途**：自动检测文本溢出并显示 `el-tooltip`，支持单行/多行省略。
*   **Props**：
    | 属性 | 类型 | 默认值 | 说明 |
    |------|------|--------|------|
    | `content` | String | `''` | 文本内容 |
    | `line-clamp` | Number | `1` | 最大显示行数（>1 时启用多行省略） |
    | `tooltip-disabled` | Boolean | `false` | 是否禁用 tooltip |
    | `placement` | String | `'top'` | tooltip 位置 |
    | `tag` | String | `'span'` | 外层包裹标签 |
*   **用法示例**：
    ```vue
    <!-- 单行省略（表格列中常用） -->
    <text-ellipsis :content="row.remark" />
    <!-- 多行省略 -->
    <text-ellipsis :content="row.description" :line-clamp="3" />
    ```

### E. 树形选择器 `<tree-selector>`
*   **用途**：基于 `el-popover` + `el-tree` 的下拉树形选择器，用于选择层级数据（如组织架构、科目树、分类树等）。
*   **Props**：
    | 属性 | 类型 | 默认值 | 说明 |
    |------|------|--------|------|
    | `tree-data` | Array | `[]` | 树形数据源 |
    | `placeholder` | String | `'请选择组织'` | 占位文本 |
    | `clearable` | Boolean | `true` | 是否可清空 |
    | `disabled` | Boolean | `false` | 是否禁用 |
    | `default-props` | Object | `{ children: 'childOrg', label: 'name' }` | 树节点字段映射 |
    | `searchable` | Boolean | `false` | 是否支持输入搜索过滤 |
    | `extract-dept` | Boolean | `false` | 点击节点时是否展开子节点（false 时点击即选中） |
    | `expand-all` | Boolean | `false` | 是否默认展开所有节点 |
    | `disabled-id` | String | `''` | 禁选的节点 ID |
    | `disabled-state` | Boolean | `false` | 是否启用禁用状态（禁用的节点不可选） |
    | `large-poper` | Boolean | `false` | 是否使用大宽度弹窗 |
*   **事件**：`getdata(node)` — 选中节点时触发，参数为节点数据（清空时为 `null`）
*   **方法**（通过 `ref` 调用）：
    *   `setCurrentItem(data)` — 设置当前选中项
    *   `clear()` — 清空选择
*   **常用变体**（位于 `src/components/tree-selector/`）：
    | 组件 | 场景 |
    |------|------|
    | `tree-selector` | 通用树形选择（最常用） |
    | `category-tree-selector` | 商品分类选择 |
    | `subject-tree-selector` | 财务科目选择 |
    | `org-tree-selector` | 组织架构选择（和 `org-tree-selector-new` 不同） |
    | `product-chooser-selector` | 商品选择（弹窗形式） |
*   **用法示例**：
    ```vue
    <template>
      <tree-selector
        ref="treeRef"
        :tree-data="orgTreeData"
        :searchable="true"
        :extract-dept="false"
        :default-props="{ children: 'children', label: 'name' }"
        placeholder="请选择分类"
        @getdata="onSelectCategory"
      />
    </template>
    ```

### F. 白色卡片容器 `<we-white-box>`
*   **用途**：提供统一的白底圆角卡片容器，用于页面内容分区。
*   **用法**：纯容器，无 Props，直接包裹内容。
    ```vue
    <we-white-box>
      <!-- 内容区域 -->
    </we-white-box>
    ```

### G. 搜索展开/收起容器 `<search-container>`
*   **用途**：用于列表页搜索区域的展开/收起控制。收起时只显示 `#showed` 插槽内容，展开后显示默认插槽内容 + 查询/重置按钮。
*   **Props**：
    | 属性 | 类型 | 说明 |
    |------|------|------|
    | `max-item-width` | Number | **必填**，展开后每个 `el-form-item` 的宽度（px） |
*   **插槽**：
    *   `#showed`：始终显示的内容（通常放置最重要的 1-2 个筛选条件）
    *   `default`：展开后显示的完整筛选表单（`el-form` + `el-form-item`）
*   **事件**：`search`、`reset`、`expanded(isExpanded)`
*   **用法示例**：
    ```vue
    <search-container :max-item-width="280" @search="queryList" @reset="handleReset">
      <template #showed>
        <!-- 收起时始终显示的筛选条件 -->
        <el-form-item label="单据编号">
          <FilterText v-model="searchParams.code" placeholder="请输入" />
        </el-form-item>
      </template>
      <!-- 展开后显示的完整筛选表单 -->
      <el-form size="small">
        <el-form-item label="状态">
          <el-select v-model="searchParams.status" placeholder="请选择">
            <el-option label="正常" :value="0" />
            <el-option label="作废" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期">
          <el-date-picker v-model="searchParams.date" type="date" placeholder="选择日期" />
        </el-form-item>
      </el-form>
    </search-container>
    ```

### H. 附件列表展示 `<file-list-show>`
*   **用途**：用于详情页、审批流等场景展示已上传的附件列表。支持图片预览、文件名省略、下载按钮。
*   **Props**：
    | 属性 | 类型 | 说明 |
    |------|------|------|
    | `list` | Array | 附件列表，每项包含 `{ name/fileName, url/fileUrl }` |
*   **用法示例**：
    ```vue
    <!-- 详情页展示附件 -->
    <file-list-show :list="detail.attachList || []" />
    ```

### I. 表格内编辑单元格 `<editable-cell>`
*   **用途**：用于表格内嵌编辑场景（如明细录入页），点击单元格进入编辑状态，失焦或回车后自动保存。
*   **Props**：
    | 属性 | 类型 | 默认值 | 说明 |
    |------|------|--------|------|
    | `value` | Any | `''` | 绑定值（使用 `v-model`） |
    | `immediate-edit` | Boolean | `false` | 是否默认进入编辑状态 |
    | `disabled` | Boolean | `false` | 是否禁用编辑 |
    | `max-length` | Number | `1000` | 最大输入长度 |
    | `ellipsis` | Boolean | `false` | 是否启用文本溢出省略 + tooltip |
*   **事件**：`save(newVal, oldVal)` — 值变化后触发；`input` — 值变化时触发；`blur` — 失焦时触发
*   **插槽**：
    *   `default`：自定义展示内容（接收 `{ value }`）
    *   `edit`：自定义编辑控件（接收 `{ value, update, blur }`）
*   **用法示例**：
    ```vue
    <!-- 默认使用 el-input 编辑 -->
    <el-table-column label="备注">
      <template #default="{ row }">
        <editable-cell v-model="row.remark" :ellipsis="true" @save="onCellSave" />
      </template>
    </el-table-column>

    <!-- 自定义编辑控件（如下拉选择） -->
    <el-table-column label="状态">
      <template #default="{ row }">
        <editable-cell v-model="row.status" @save="onCellSave">
          <template #edit="{ value, update, blur }">
            <el-select :value="value" @change="update($event); blur()" size="mini">
              <el-option label="正常" :value="0" />
              <el-option label="停用" :value="1" />
            </el-select>
          </template>
          <template #default="{ value }">
            <el-tag :type="value === 0 ? 'success' : 'info'" size="mini">
              {{ value === 0 ? '正常' : '停用' }}
            </el-tag>
          </template>
        </editable-cell>
      </template>
    </el-table-column>
    ```

