<template>
  <div class="my-tree-list">
    <page-wrap :title="pageTitle">
      <!-- 左右分栏布局：左侧树，右侧列表 -->
      <page-layout :left-width="280">
      <!-- 左侧：树形搜索 + 树组件 -->
      <template #left>
        <div class="tree-left-wrap">
          <el-input
            v-model="treeKeyword"
            placeholder="搜索"
            size="small"
            clearable
            prefix-icon="el-icon-search"
            class="g-mb12"
            @input="onTreeFilter"
          />
          <el-tree
            ref="treeRef"
            :data="treeData"
            :props="{ children: 'children', label: 'name' }"
            node-key="id"
            highlight-current
            default-expand-all
            :filter-node-method="filterTreeNode"
            @node-click="onTreeNodeClick"
          >
            <template slot-scope="{ node, data }">
              <span class="tree-node-label">
                <el-tooltip
                  :content="node.label"
                  placement="top"
                  :disabled="node.label.length <= 10"
                >
                  <span>{{ node.label }}</span>
                </el-tooltip>
              </span>
            </template>
          </el-tree>
        </div>
      </template>

      <!-- 右侧：数据列表 -->
      <template #right>
        <table-v2
          table-id="tree_list_demo"
          :loading="tableLoading"
          :search-model.sync="searchParams"
          :data="tableData"
          :haspage="true"
          :page.sync="page"
          @search="dbSearch"
        >
          <template #filters>
            <FilterText
              v-model="searchParams.code"
              label="编号"
              placeholder="请输入编号"
            />
            <FilterDateRange
              :start-date.sync="searchParams.startTime"
              :end-date.sync="searchParams.endTime"
              label="日期"
            />
          </template>

          <template #op>
            <div class="op-item main" @click="handleCreate">
              <svg-filter-add class="icon" />
              新增
            </div>
          </template>

          <table-column prop="code" label="编号" width="160" />
          <table-column prop="name" label="名称" />
          <table-column prop="status" label="状态" align="center" width="100">
            <template #default="{ row }">
              <el-tag size="mini" :type="statusType(row.status)">
                {{ statusText(row.status) }}
              </el-tag>
            </template>
          </table-column>

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
      </template>
    </page-layout>
    </page-wrap>
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import { debounce } from 'lodash';
import { TableColumn } from '@comp/table-v2';
import { initSearchKeyMap } from '@comp/table/custom-archive-filters';
import Super from '../../super';

export default defineComponent({
  name: 'TreeListDemo',
  components: { TableColumn },
  extends: Super,
  data() {
    return {
      pageTitle: '树形分类管理',
      treeLoading: false,
      treeData: [],
      treeKeyword: '',
      currentTreeNode: null,

      tableLoading: false,
      tableData: [],
      page: this.getPage(20),
      dbSearch: debounce(this.queryList, 100),
      searchParams: {
        code: '',
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
  mounted() {
    this.loadTree();
  },
  methods: {
    // 加载左侧树数据
    loadTree() {
      this.treeLoading = true;
      this.api$('tree/demo/list', { method: 'get' })
        .then(({ data }) => {
          this.treeData = data || [];
          // 默认选中第一个节点
          this.$nextTick(() => {
            if (this.treeData.length > 0) {
              const firstNode = this.treeData[0];
              this.$refs.treeRef.setCurrentKey(firstNode.id);
              this.onTreeNodeClick(firstNode);
            }
          });
        })
        .finally(() => {
          this.treeLoading = false;
        });
    },
    // 树节点点击：联动右侧列表
    onTreeNodeClick(node) {
      this.currentTreeNode = node;
      this.searchParams.categoryId = node.id;
      this.page.pageNum = 1;
      this.dbSearch();
    },
    // 树搜索过滤
    onTreeFilter(val) {
      this.$refs.treeRef.filter(val);
    },
    filterTreeNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) !== -1;
    },
    handleReset() {
      this.searchParams = {
        code: '',
        startTime: '',
        endTime: '',
        sortRule: { field: '', method: '', label: '' },
        ...initSearchKeyMap,
      };
      this.page = this.getPage(20);
      this.dbSearch();
    },
    // 查询右侧列表
    async queryList() {
      this.tableLoading = true;
      try {
        const { data, page } = await this.api$('tree/demo/page', {
          method: 'post',
          data: {
            ...this.searchParams,
            page: this.page,
          },
        });
        this.tableData = data || [];
        Object.assign(this.page, page || {});
      } finally {
        this.tableLoading = false;
      }
    },
    statusType(status) {
      return ['', 'success', 'danger', 'info'][status] || 'info';
    },
    statusText(status) {
      return ['待处理', '已通过', '已驳回', '已撤回'][status] || '未知';
    },
    handleCreate() {
      // TODO: 打开新增弹窗或跳转新增页面
    },
    handleDetail(row) {
      // TODO: 打开详情
    },
    handleEdit(row) {
      // TODO: 打开编辑
    },
    async handleDelete(row) {
      try {
        await this.$confirm('确定要删除这条记录吗？', '提示', {
          type: 'warning',
        });
        await this.api$('tree/demo/delete/' + row.id, { method: 'post' });
        this.$message.success('删除成功');
        this.dbSearch();
      } catch (e) {
        // 用户取消或接口异常，静默处理
      }
    },
  },
});
</script>

<style lang="scss" scoped>
.my-tree-list {
  width: 100%;
  height: 100%;
}
.tree-left-wrap {
  padding: 12px;
  height: 100%;
  overflow: auto;
}
.tree-node-label {
  display: inline-block;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
