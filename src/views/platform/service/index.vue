<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

import { deleteService, getServiceList, saveService, toggleServiceStatus } from '@/api/modules/service'
import PageContainer from '@/components/PageContainer.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import ServiceFormDialog from '@/components-business/ServiceFormDialog/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { SERVICE_SHELF_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { ServiceType } from '@/enum/status'
import type { ServiceForm, ServiceItem, ServiceQuery } from '@/types/business'

const loading = ref(false)
const dialogVisible = ref(false)
const editingId = ref('')
const editingEnterpriseId = ref('')
const editingEnterpriseName = ref('')
const tableData = ref<ServiceItem[]>([])

const queryForm = reactive<ServiceQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  scope: 'all',
  serviceType: '',
  status: '',
})

const form = reactive<ServiceForm>({
  serviceName: '',
  serviceCode: '',
  serviceType: ServiceType.Standard,
  categoryCode: '',
  specification: '',
  targetCustomer: '',
  contactName: '',
  contactPhone: '',
  priceText: '',
  description: '',
})

const searchFields = [
  { label: '关键词', prop: 'keyword', placeholder: '企业/服务编码/服务名称/服务规范' },
  {
    label: '服务类型',
    prop: 'serviceType',
    component: 'select' as const,
    placeholder: '请选择服务类型',
    options: SERVICE_TYPE_OPTIONS,
  },
  {
    label: '状态',
    prop: 'status',
    component: 'select' as const,
    placeholder: '请选择状态',
    options: Object.values(SERVICE_SHELF_STATUS_MAP),
  },
]

function resetQuery() {
  Object.assign(queryForm, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    scope: 'all',
    serviceType: '',
    status: '',
  })
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const res = await getServiceList(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

function openCreateDialog() {
  editingId.value = ''
  editingEnterpriseId.value = ''
  editingEnterpriseName.value = '平台维护服务'
  Object.assign(form, {
    serviceName: '',
    serviceCode: '',
    serviceType: ServiceType.Standard,
    categoryCode: '',
    specification: '',
    targetCustomer: '',
    contactName: '',
    contactPhone: '',
    priceText: '',
    description: '',
  })
  dialogVisible.value = true
}

function openEditDialog(row: ServiceItem & { enterpriseId?: string; enterpriseName?: string }) {
  editingId.value = row.id
  editingEnterpriseId.value = row.enterpriseId || ''
  editingEnterpriseName.value = row.enterpriseName || '平台维护服务'
  Object.assign(form, {
    serviceName: row.serviceName,
    serviceCode: row.serviceCode || '',
    serviceType: row.serviceType,
    categoryCode: row.categoryCode || '',
    specification: row.specification || '',
    targetCustomer: row.targetCustomer,
    contactName: row.contactName,
    contactPhone: row.contactPhone,
    priceText: row.priceText,
    description: row.description || '',
  })
  dialogVisible.value = true
}

async function submitForm(payload: ServiceForm) {
  await saveService({
    id: editingId.value || undefined,
    enterpriseId: editingEnterpriseId.value || undefined,
    enterpriseName: editingEnterpriseName.value || undefined,
    ...payload,
  })
  ElMessage.success(editingId.value ? '服务已更新' : '服务已新增')
  dialogVisible.value = false
  loadData()
}

async function handleToggle(id: string) {
  await toggleServiceStatus(id)
  ElMessage.success('服务状态已更新')
  loadData()
}

async function handleDelete(id: string) {
  await deleteService(id)
  ElMessage.success('服务已删除')
  loadData()
}

loadData()
</script>

<template>
  <PageContainer title="服务管理" subtitle="平台统一维护服务项目编码、类别、规范字段，企业端与平台端共用同一套表单组件。">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="loadData" @reset="resetQuery" />

    <TablePanel title="服务项目列表">
      <template #toolbar>
        <PermissionButton permission="service:manage:view" @click="openCreateDialog">新增服务</PermissionButton>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="enterpriseName" label="所属企业" min-width="180" />
        <el-table-column prop="serviceCode" label="服务编码" min-width="140" />
        <el-table-column prop="serviceName" label="服务名称" min-width="220" />
        <el-table-column prop="categoryCode" label="类别编码" min-width="120" />
        <el-table-column prop="specification" label="服务规范" min-width="160" />
        <el-table-column label="服务类型" width="120">
          <template #default="{ row }">
            {{ SERVICE_TYPE_OPTIONS.find((item) => item.value === row.serviceType)?.label || row.serviceType }}
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="SERVICE_SHELF_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" min-width="160" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <PermissionButton permission="service:manage:view" text @click="openEditDialog(row)">编辑</PermissionButton>
            <PermissionButton permission="service:manage:view" text @click="handleToggle(row.id)">
              {{ row.status === 'enabled' ? '停用' : '启用' }}
            </PermissionButton>
            <PermissionButton permission="service:manage:view" text type="danger" @click="handleDelete(row.id)">删除</PermissionButton>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <ServiceFormDialog
      v-model:visible="dialogVisible"
      :title="editingId ? '编辑服务' : '新增服务'"
      :form="form"
      @submit="submitForm"
    />
  </PageContainer>
</template>
