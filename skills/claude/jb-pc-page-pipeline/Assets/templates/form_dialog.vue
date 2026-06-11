<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogShow"
    :destroy-on-close="true"
    :append-to-body="true"
    :close-on-click-modal="false"
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
        <el-row :gutter="24" type="flex" align="top" style="flex-wrap: wrap">
          <!-- 字段示例：文本输入 -->
          <el-col :span="12">
            <el-form-item label="字段名称" prop="fieldName" required>
              <el-input
                v-model="form.fieldName"
                placeholder="请输入"
                clearable
                maxlength="100"
              />
            </el-form-item>
          </el-col>

          <!-- 字段示例：下拉选择 -->
          <el-col :span="12">
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
          </el-col>

          <!-- 字段示例：金额输入（使用 number-input） -->
          <el-col :span="12">
            <el-form-item label="金额" prop="amount">
              <number-input
                v-model="form.amount"
                :digit="2"
                placeholder="请输入金额"
              />
            </el-form-item>
          </el-col>

          <!-- 字段示例：税率输入（百分比） -->
          <el-col :span="12">
            <el-form-item label="税率" prop="taxRate">
              <number-input
                v-model="form.taxRate"
                :digit="2"
                :ratio="true"
                placeholder="请输入税率"
              />
            </el-form-item>
          </el-col>

          <!-- 字段示例：日期范围 -->
          <el-col :span="12">
            <el-form-item label="日期" prop="dateRange">
              <el-date-picker
                v-model="form.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>

          <!-- 字段示例：档案选择器（需导入） -->
          <el-col :span="12">
            <el-form-item label="公司主体" prop="companyEntityId">
              <input-entity
                v-model="form.companyEntityId"
                @label-change="(name) => form.companyEntityName = name"
              />
            </el-form-item>
          </el-col>

          <!-- 字段示例：树形选择器（需导入） -->
          <el-col :span="12">
            <el-form-item label="经营单元" prop="orgId">
              <org-tree-selector-new
                :val.sync="form.orgId"
                :is-required="true"
              />
            </el-form-item>
          </el-col>

          <!-- 字段示例：通用树形选择（需导入） -->
          <el-col :span="12">
            <el-form-item label="分类" prop="categoryId">
              <tree-selector
                :tree-data="categoryTreeData"
                :searchable="true"
                :default-props="{ children: 'children', label: 'name' }"
                placeholder="请选择分类"
                @getdata="onSelectCategory"
              />
            </el-form-item>
          </el-col>

          <!-- 字段示例：人员选择（通过输入框唤起弹窗） -->
          <el-col :span="12">
            <el-form-item label="负责人" prop="personId">
              <el-input
                v-model="form.personName"
                readonly
                placeholder="请选择负责人"
                @focus="$refs.personChooserRef.open()"
              />
            </el-form-item>
          </el-col>
          <!-- 人员选择弹窗组件（需导入） -->
          <person-chooser-selector-dept
            ref="personChooserRef"
            :is-radio="true"
            @select="handleSelectPerson"
          />

          <!-- 字段示例：供应商选择（需导入） -->
          <el-col :span="12">
            <el-form-item label="供应商" prop="supplierId">
              <supplier-choose v-model="form.supplierId" />
            </el-form-item>
          </el-col>

          <!-- 字段示例：文件上传（需导入） -->
          <el-col :span="24">
            <el-form-item label="附件">
              <file-upload
                :list.sync="form.attach"
                :is-json="true"
                bussiness-type1="业务附件"
              />
            </el-form-item>
          </el-col>

          <!-- 字段示例：备注文本域 -->
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input
                type="textarea"
                :rows="3"
                v-model="form.remark"
                placeholder="请输入备注"
                maxlength="500"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div slot="footer">
      <div>
        <el-button size="small" @click="dialogShow = false">取消</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          size="small"
          @click="onSubmit"
        >
          确 定
        </el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import Super from '../../super';
import { defineComponent } from 'vue';

// TODO: 按需导入需要的公共组件
// import InputEntity from '@jb/common/company-entity/input-entity.vue';
// import OrgTreeSelectorNew from '@jb/common/org-tree/org-tree-selector-new.vue';
// import PersonChooserSelectorDept from '@jb/common/person-chooser/person-chooser-selector-dept.vue';
// import FileUpload from '@jb/common/file-upload/file-upload.vue';
// import SupplierChoose from '@jb/common/supplier/supplier-choose.vue';
// import TreeSelector from '@comp/tree-selector/tree-selector.vue';

export default defineComponent({
  // components: { InputEntity, OrgTreeSelectorNew, PersonChooserSelectorDept, FileUpload, SupplierChoose, TreeSelector },
  extends: Super,
  data() {
    return {
      dialogShow: false,
      title: '新增',
      submitLoading: false,
      categoryTreeData: [],
      form: {
        fieldName: '',
        status: '',
        amount: null,
        taxRate: null,
        dateRange: [],
        companyEntityId: '',
        companyEntityName: '',
        orgId: '',
        categoryId: '',
        categoryName: '',
        personId: '',
        personName: '',
        supplierId: '',
        attach: [],
        remark: '',
      },
      statusList: [
        { id: 0, name: '正常' },
        { id: 1, name: '停用' },
      ],
      rules: {
        fieldName: [
          { required: true, message: '请输入字段名称', trigger: 'blur' },
        ],
      },
    };
  },
  methods: {
    open(row) {
      if (row) {
        this.title = '编辑';
        this.form = { ...row };
      } else {
        this.title = '新增';
        this.resetForm();
      }
      this.dialogShow = true;
    },
    resetForm() {
      this.form = this.$options.data.call(this).form;
      this.$refs.form?.resetFields();
    },
    onClose() {
      this.resetForm();
    },
    async onSubmit() {
      await this.$refs.form.validate();
      this.submitLoading = true;
      try {
        const url = this.form.id
          ? 'api/xxx/update'
          : 'api/xxx/add';
        await this.api$(url, {
          method: 'post',
          data: this.form,
        });
        this.msg.success(this.title + '成功');
        this.dialogShow = false;
        this.$emit('refresh');
      } catch (e) {
        console.error(e);
      } finally {
        this.submitLoading = false;
      }
    },
    handleSelectPerson(item) {
      this.form.personId = item.id;
      this.form.personName = item.name;
    },
    onSelectCategory(node) {
      if (node) {
        this.form.categoryId = node.id;
        this.form.categoryName = node.name;
      } else {
        this.form.categoryId = '';
        this.form.categoryName = '';
      }
    },
  },
});
</script>
<style scoped lang="scss"></style>
