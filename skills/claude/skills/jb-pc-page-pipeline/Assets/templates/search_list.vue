<template>
  <div class="my-standard-list">
    <!-- 全局包装，提供顶层标题与右上角新建按钮 -->
    <page-wrap :title="pageTitle">
      <template #title-right>
        <el-button type="primary" size="small" @click="handleCreate">
          <svg-icon icon-class="add" class="mr-4px" />
          新增记录
        </el-button>
      </template>

      <!-- Table V2 核心列表，基于 vxe-table，支持虚拟滚动、列管理、批量选择 -->
      <table-v2
        table-id="standard_list"
        :loading="tableLoading"
        :search-model.sync="searchParams"
        :data="tableData"
        :haspage="true"
        :page.sync="page"
        @search="dbSearch"
        @reset="handleReset"
      >
        <!-- 1. 顶部高级过滤器插槽 -->
        <template #filters>
          <FilterText
            v-model="searchParams.recordCode"
            label="合同编号"
            placeholder="请输入编号"
          />
          <FilterEntity
            v-model="searchParams.companyEntityIds"
            :multiple="true"
            label="公司主体"
          />
          <FilterAmbOrg
            v-model="searchParams.orgIds"
            :multiple="true"
            label="经营单元"
          />
          <FilterMoney
            :start.sync="searchParams.minAmount"
            :end.sync="searchParams.maxAmount"
            label="合同金额"
          />
          <FilterDateRange
            :start-date.sync="searchParams.startTime"
            :end-date.sync="searchParams.endTime"
            label="发起日期"
          />
          <!-- 必须在最后放置自定义字段档案过滤组件 -->
          <custom-archive-filters :searchModel="searchParams" />
        </template>

        <!-- 2. 表格操作按钮区（左侧） -->
        <template #op>
          <div class="op-item main" @click="handleCreate">
            <svg-filter-add class="icon" />
            新增
          </div>
          <div class="op-item" @click="handleExport">
            <svg-icon-download class="svg icon" />
            导出
          </div>
          <!-- 导入功能示例（按需启用） -->
          <!--
          <import-file
            url="api/import/excel"
            title="导入数据"
            temp-url="api/import/template"
            temp-title="导入模板"
            @success="onImportSuccess"
          >
            <div class="op-item">
              <svg-icon-upload class="icon" />
              导入
            </div>
          </import-file>
          -->
        </template>

        <!-- 3. 表格汇总统计展示区（右侧） -->
        <template #op-right>
          <span class="text-14px">
            <span class="windicss-text-g3">金额合计：</span>
            <span class="text-red-500 font-medium">
              {{ sumAmount | formatMoney }}
            </span>
          </span>
        </template>

        <!-- 4. 数据列展示配置（使用 table-column，需手动导入） -->
        <table-column prop="recordCode" label="合同编号" width="160">
          <template #default="{ row }">
            <el-link type="primary" :underline="false" @click="handleDetail(row)">
              {{ row.recordCode }}
            </el-link>
          </template>
        </table-column>

        <table-column prop="recordName" label="合同名称" />

        <table-column prop="amount" label="金额" align="right" width="140">
          <template #default="{ row }">
            {{ row.amount | formatMoney }}
          </template>
        </table-column>

        <table-column prop="status" label="审批状态" align="center" width="110">
          <template #default="{ row }">
            <el-tag
              size="mini"
              :type="['', 'success', 'danger', 'info'][row.status]"
            >
              {{ ['审批中', '已通过', '已驳回', '已撤回'][row.status] }}
            </el-tag>
          </template>
        </table-column>

        <!-- 5. 行级操作项（更多折叠操作） -->
        <table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <more-box :key="row.id">
              <more-item @click="handleDetail(row)">详情</more-item>
              <more-item @click="handleEdit(row)">编辑</more-item>
              <more-item text-type="danger" @click="handleDelete(row)">
                删除
              </more-item>
            </more-box>
          </template>
        </table-column>
      </table-v2>
    </page-wrap>
  </div>
</template>

<script>
import { formatMoney } from '@utils';
import Super from '../../super';
import { debounce } from 'lodash';
import { defineComponent } from 'vue';
import { TableColumn } from '@comp/table-v2';
import { initSearchKeyMap } from '@comp/table/custom-archive-filters';

export default defineComponent({
  name: 'StandardSearchList',
  components: { TableColumn },
  extends: Super,
  data() {
    return {
      pageTitle: '合同标准管理列表',
      tableLoading: false,
      tableData: [],
      sumAmount: 0,
      page: this.getPage(20),
      dbSearch: debounce(this.queryList, 100),
      searchParams: {
        recordCode: '',
        recordName: '',
        companyEntityIds: [],
        orgIds: [],
        minAmount: '',
        maxAmount: '',
        startTime: '',
        endTime: '',
        sortRule: {
          field: '',
          method: '',
          label: '',
        },
        ...initSearchKeyMap,
      },
    };
  },
  watch: {
    searchParams: {
      deep: true,
      immediate: true,
      handler() {
        this.dbSearch();
      },
    },
  },
  methods: {
    async queryList() {
      this.tableLoading = true;
      try {
        const { data, page } = await this.api$('amoeba/demo/page', {
          method: 'post',
          data: {
            ...this.searchParams,
            page: this.page,
            dataScope: 0,
          },
        });
        this.tableData = data || [];
        Object.assign(this.page, page || {});
      } finally {
        this.tableLoading = false;
      }
    },
    handleReset() {
      this.searchParams = {
        recordCode: '',
        recordName: '',
        companyEntityIds: [],
        orgIds: [],
        minAmount: '',
        maxAmount: '',
        startTime: '',
        endTime: '',
        sortRule: { field: '', method: '', label: '' },
        ...initSearchKeyMap,
      };
      this.page = this.getPage(20);
      this.dbSearch();
    },
    handleCreate() {
      this.$router.push({ name: 'standard-form', query: { type: 'add' } });
    },
    handleDetail(row) {
      this.$router.push({ name: 'standard-detail', query: { id: row.id } });
    },
    handleEdit(row) {
      this.$router.push({
        name: 'standard-form',
        query: { id: row.id, type: 'edit' },
      });
    },
    async handleExport() {
      await this.api$('amoeba/demo/export', {
        method: 'post',
        data: { ...this.searchParams, page: this.page },
      });
      this.msg.success('导出成功，请前往任务中心查看。');
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除这条记录吗？', '提示', {
          type: 'warning',
        });
        await this.api$('amoeba/demo/delete/' + row.id, { method: 'post' });
        this.$message.success('删除成功');
        this.dbSearch();
      } catch (e) {
        // 用户取消或接口异常，静默处理
      }
    },
    onImportSuccess() {
      this.msg.success('导入成功');
      this.dbSearch();
    },
  },
});
</script>

<style lang="scss" scoped>
.my-standard-list {
  width: 100%;
  height: 100%;
}
</style>
