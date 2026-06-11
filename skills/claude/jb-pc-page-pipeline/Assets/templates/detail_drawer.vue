<template>
  <el-drawer
    v-drawer-flex
    :title="title"
    :visible.sync="drawerVisible"
    direction="rtl"
    :append-to-body="true"
    :wrapper-closable="true"
    custom-class="drawer-detail"
    size="750px"
    @close="onClose"
  >
    <div
      :style="{ height: contentHeight + 'px' }"
      class="flex flex-col overflow-hidden"
    >
      <!-- 内容区：滚动展示 -->
      <div class="flex-1 px-20px py-16px overflow-auto scroll-container">
        <!-- 基础信息区块 -->
        <we-white-box>
          <div class="g-fs16 g-fc1 g-mb12 font-medium">基本信息</div>
          <desc-block :repeat="2">
            <desc-item label="单据编号">{{ detail.formNo || '-' }}</desc-item>
            <desc-item label="单据状态">
              <el-tag :type="detail.status === 1 ? 'success' : 'info'" size="mini">
                {{ detail.status === 1 ? '已通过' : '审批中' }}
              </el-tag>
            </desc-item>
            <desc-item label="申请人">{{ detail.applyName || '-' }}</desc-item>
            <desc-item label="申请日期">{{ detail.applyTime || '-' }}</desc-item>
            <desc-item label="公司主体">{{ detail.companyEntityName || '-' }}</desc-item>
            <desc-item label="经营单元">{{ detail.orgName || '-' }}</desc-item>
            <desc-item label="金额">{{ detail.amount | formatMoney }}</desc-item>
            <desc-item label="备注">{{ detail.remark || '-' }}</desc-item>
          </desc-block>
        </we-white-box>

        <!-- 附件区块 -->
        <we-white-box class="g-mt16">
          <div class="g-fs16 g-fc1 g-mb12 font-medium">附件</div>
          <file-list-show :list="detail.attachList || []" />
        </we-white-box>

        <!-- 明细数据区块 -->
        <we-white-box class="g-mt16">
          <div class="g-fs16 g-fc1 g-mb12 font-medium">明细信息</div>
          <common-table
            :data="detail.items || []"
            :border="false"
            :show-footer="false"
            :haspage="false"
          >
            <el-table-column prop="itemName" label="项目名称" />
            <el-table-column prop="amount" label="金额" align="right">
              <template #default="{ row }">
                {{ row.amount | formatMoney }}
              </template>
            </el-table-column>
            <el-table-column prop="remark" label="备注" show-overflow-tooltip />
          </common-table>
        </we-white-box>

        <!-- 审批流程区块 -->
        <we-white-box class="g-mt16">
          <div class="g-fs16 g-fc1 g-mb12 font-medium">审批流程</div>
          <!-- 根据实际项目接入审批流组件 -->
          <div class="text-14px text-[var(--g3)]">暂无审批记录</div>
        </we-white-box>
      </div>

      <!-- 底部按钮区 -->
      <div class="py-10px px-20px border-t border-gray-100 border-solid flex justify-end">
        <el-button size="small" @click="drawerVisible = false">关 闭</el-button>
        <el-button
          v-if="showEdit"
          type="primary"
          size="small"
          @click="handleEdit"
        >
          编 辑
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import Super from '../../super';
import { defineComponent } from 'vue';

export default defineComponent({
  extends: Super,
  props: {
    showEdit: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      drawerVisible: false,
      title: '详情',
      contentHeight: document.documentElement.clientHeight - 52,
      detail: {
        formNo: '',
        status: 0,
        applyName: '',
        applyTime: '',
        companyEntityName: '',
        orgName: '',
        amount: 0,
        remark: '',
        items: [],
        attachList: [],
      },
    };
  },
  methods: {
    open(id) {
      this.drawerVisible = true;
      this.loadDetail(id);
    },
    async loadDetail(id) {
      const { data } = await this.api$('api/xxx/detail', {
        method: 'get',
        params: { id },
      });
      this.detail = data || {};
    },
    onClose() {
      this.detail = this.$options.data.call(this).detail;
      this.$emit('close');
    },
    handleEdit() {
      this.$emit('edit', this.detail);
      this.drawerVisible = false;
    },
  },
});
</script>

<style lang="scss">
.drawer-detail {
  .el-drawer__body {
    padding: 0 !important;
    overflow: hidden !important;
  }
}
</style>
