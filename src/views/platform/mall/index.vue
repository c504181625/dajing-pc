<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

import { deleteGoods, getGoodsList, saveGoods } from '@/api/modules/mall'
import PageContainer from '@/components/PageContainer.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { GOODS_STATUS_MAP } from '@/constants/dicts'
import { GoodsStatus } from '@/enum/status'
import type { GoodsForm, GoodsItem, GoodsQuery } from '@/types/business'

const loading = ref(false)
const dialogVisible = ref(false)
const editingId = ref('')
const tableData = ref<GoodsItem[]>([])
const queryForm = reactive<GoodsQuery>({ pageNum: 1, pageSize: 10, keyword: '', status: '' })
const form = reactive<GoodsForm>({
  goodsCode: '',
  goodsName: '',
  categoryName: '',
  specification: '',
  priceText: '',
  status: GoodsStatus.OnSale,
})

async function loadData() {
  loading.value = true
  try {
    const res = await getGoodsList(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

function openDialog(row?: GoodsItem) {
  editingId.value = row?.id || ''
  Object.assign(form, row || { goodsCode: '', goodsName: '', categoryName: '', specification: '', priceText: '', status: GoodsStatus.OnSale })
  dialogVisible.value = true
}

async function submitForm() {
  await saveGoods({ id: editingId.value || undefined, ...form })
  ElMessage.success(editingId.value ? '商品已更新' : '商品已新增')
  dialogVisible.value = false
  loadData()
}

async function handleDelete(id: string) {
  await deleteGoods(id)
  ElMessage.success('商品已删除')
  loadData()
}

loadData()
</script>

<template>
  <PageContainer title="商城管理" subtitle="一期先做商品列表和基础增删改，保留规格、类别和状态字段。">
    <SearchForm
      v-model="queryForm"
      :fields="[
        { label: '关键词', prop: 'keyword', placeholder: '商品编码/名称/类别/规格' },
        { label: '状态', prop: 'status', component: 'select', placeholder: '请选择状态', options: Object.values(GOODS_STATUS_MAP) },
      ]"
      @search="loadData"
      @reset="loadData"
    />
    <TablePanel title="商品列表">
      <template #toolbar>
        <PermissionButton permission="mall:manage:view" @click="openDialog()">新增商品</PermissionButton>
      </template>
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="goodsCode" label="商品编码" min-width="140" />
        <el-table-column prop="goodsName" label="商品名称" min-width="200" />
        <el-table-column prop="categoryName" label="类别" min-width="140" />
        <el-table-column prop="specification" label="规格" min-width="160" />
        <el-table-column prop="priceText" label="价格说明" min-width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="GOODS_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" min-width="160" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <PermissionButton permission="mall:manage:view" text @click="openDialog(row)">编辑</PermissionButton>
            <PermissionButton permission="mall:manage:view" text type="danger" @click="handleDelete(row.id)">删除</PermissionButton>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <el-dialog v-model="dialogVisible" :title="editingId ? '编辑商品' : '新增商品'" width="600px">
      <el-form label-width="100px">
        <el-form-item label="商品编码"><el-input v-model="form.goodsCode" /></el-form-item>
        <el-form-item label="商品名称"><el-input v-model="form.goodsName" /></el-form-item>
        <el-form-item label="类别"><el-input v-model="form.categoryName" /></el-form-item>
        <el-form-item label="规格"><el-input v-model="form.specification" /></el-form-item>
        <el-form-item label="价格说明"><el-input v-model="form.priceText" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">保存</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>
