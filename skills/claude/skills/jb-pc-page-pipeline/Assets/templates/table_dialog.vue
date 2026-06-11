<template>
  <el-dialog
    title="选择数据"
    :visible.sync="dialogVisible"
    :destroy-on-close="true"
    :append-to-body="true"
    :close-on-click-modal="false"
    width="1000px"
    @close="onClose"
  >
    <!-- 顶部筛选区 -->
    <div class="flex items-center g-mb12">
      <el-input
        v-model="searchParams.keyword"
        placeholder="请输入关键词搜索"
        size="small"
        clearable
        style="width: 240px"
        @keyup.enter.native="queryList"
      >
        <template slot="append">
          <el-button size="small" @click="queryList">搜索</el-button>
        </template>
      </el-input>
    </div>

    <!-- 表格区 -->
    <common-table
      :data="tableData"
      :loading="loading"
      :haspage="true"
      :page.sync="page"
      @search="queryList"
      :max-height="400"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="code" label="编号" width="160" />
      <el-table-column prop="name" label="名称" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" align="center" width="100">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'" size="mini">
            {{ row.status === 1 ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center" width="160" />
    </common-table>

    <span slot="footer" class="dialog-footer">
      <el-button size="small" @click="dialogVisible = false">取 消</el-button>
      <el-button type="primary" size="small" @click="handleConfirm"
        >确 定</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
import Super from '../../super';
import { defineComponent } from 'vue';

export default defineComponent({
  extends: Super,
  data() {
    return {
      dialogVisible: false,
      loading: false,
      tableData: [],
      page: this.getPage(10),
      searchParams: {
        keyword: '',
      },
      selectedRows: [],
    };
  },
  methods: {
    open() {
      this.dialogVisible = true;
      this.queryList();
    },
    async queryList() {
      this.loading = true;
      try {
        const { data, page } = await this.api$('api/xxx/page', {
          method: 'post',
          data: {
            ...this.searchParams,
            page: this.page,
          },
        });
        this.tableData = data || [];
        Object.assign(this.page, page);
      } finally {
        this.loading = false;
      }
    },
    handleConfirm() {
      // 获取选中行
      const selection = this.$refs.table?.getSelection() || [];
      if (!selection.length) {
        this.msg.warning('请选择数据');
        return;
      }
      this.$emit('select', selection);
      this.dialogVisible = false;
    },
    onClose() {
      this.searchParams.keyword = '';
      this.tableData = [];
    },
  },
});
</script>
<style scoped lang="scss"></style>
