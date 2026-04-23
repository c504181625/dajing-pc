<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

import {
  deleteService,
  getServiceList,
  saveService,
  toggleServiceStatus,
} from '@/api/modules/service'
import PageContainer from '@/components/PageContainer.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import ServiceFormDialog from '@/components-business/ServiceFormDialog/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { SERVICE_SHELF_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { ServiceShelfStatus, ServiceType } from '@/enum/status'
import type { ServiceForm, ServiceItem, ServiceQuery } from '@/types/business'

const loading = ref(false)
const dialogVisible = ref(false)
const editingId = ref('')
const editingStatus = ref(ServiceShelfStatus.Disabled)
const tableData = ref<ServiceItem[]>([])

const queryForm = reactive<ServiceQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  serviceType: '',
  status: '',
})

const form = reactive<ServiceForm>({
  serviceName: '',
  serviceCode: '',
  inspectionItemId: '',
  institutionId: '',
  serviceType: ServiceType.Inspection,
  categoryCode: '',
  categoryName: '',
  specification: '',
  sampleType: '',
  defaultStd: '',
  targetCustomer: '',
  contactName: '',
  contactPhone: '',
  priceText: '',
  price: undefined,
  cycleDays: undefined,
  supportCma: false,
  supportCnas: false,
  supportUrgent: false,
  urgentExtraFee: undefined,
  description: '',
  coverUrl: '',
  sort: 0,
})

const searchFields = [
  { label: '关键字', prop: 'keyword', placeholder: '服务名称 / 项目 ID / 分类 / 标准' },
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

function resetFormState() {
  Object.assign(form, {
    serviceName: '',
    serviceCode: '',
    inspectionItemId: '',
    institutionId: '',
    serviceType: ServiceType.Inspection,
    categoryCode: '',
    categoryName: '',
    specification: '',
    sampleType: '',
    defaultStd: '',
    targetCustomer: '',
    contactName: '',
    contactPhone: '',
    priceText: '',
    price: undefined,
    cycleDays: undefined,
    supportCma: false,
    supportCnas: false,
    supportUrgent: false,
    urgentExtraFee: undefined,
    description: '',
    coverUrl: '',
    sort: 0,
  })
}

function resetQuery() {
  Object.assign(queryForm, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    serviceType: '',
    status: '',
  })
  void loadData()
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
  editingStatus.value = ServiceShelfStatus.Disabled
  resetFormState()
  dialogVisible.value = true
}

function openEditDialog(row: ServiceItem) {
  editingId.value = row.id
  editingStatus.value = row.status
  Object.assign(form, {
    serviceName: row.serviceName,
    serviceCode: row.serviceCode || '',
    inspectionItemId: row.inspectionItemId || row.serviceCode || '',
    institutionId: row.institutionId || '',
    serviceType: row.serviceType,
    categoryCode: row.categoryCode || '',
    categoryName: row.categoryName || '',
    specification: row.specification || '',
    sampleType: row.sampleType || row.targetCustomer || '',
    defaultStd: row.defaultStd || row.specification || '',
    targetCustomer: row.sampleType || row.targetCustomer || '',
    contactName: row.contactName || '',
    contactPhone: row.contactPhone || '',
    priceText: row.priceText,
    price: row.price,
    cycleDays: row.cycleDays,
    supportCma: row.supportCma,
    supportCnas: row.supportCnas,
    supportUrgent: row.supportUrgent,
    urgentExtraFee: row.urgentExtraFee,
    description: row.description || '',
    coverUrl: row.coverUrl || '',
    sort: row.sort ?? 0,
  })
  dialogVisible.value = true
}

async function submitForm(payload: ServiceForm, publishAfterSave: boolean) {
  const serviceId = await saveService({
    id: editingId.value || undefined,
    ...payload,
  })

  if (publishAfterSave && serviceId && (!editingId.value || editingStatus.value !== ServiceShelfStatus.Enabled)) {
    await toggleServiceStatus(serviceId)
  }

  ElMessage.success(editingId.value ? '服务已更新' : publishAfterSave ? '服务已新增并上架' : '服务已新增')
  dialogVisible.value = false
  await loadData()
}

async function handleToggle(id: string) {
  await toggleServiceStatus(id)
  ElMessage.success('服务状态已更新')
  await loadData()
}

async function handleDelete(id: string) {
  await deleteService(id)
  ElMessage.success('服务已删除')
  await loadData()
}

void loadData()
</script>

<template>
  <PageContainer title="服务管理" subtitle="维护本机构服务项目、封面、检测要求与上下架状态。">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="loadData" @reset="resetQuery" />

    <TablePanel title="服务列表">
      <template #toolbar>
        <PermissionButton permission="enterprise:service:manage" @click="openCreateDialog">
          新增服务
        </PermissionButton>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column label="服务信息" min-width="260">
          <template #default="{ row }">
            <div class="service-main">
              <img v-if="row.coverUrl" :src="row.coverUrl" alt="封面" class="service-main__cover" />
              <div class="service-main__content">
                <div class="service-main__title">{{ row.serviceName }}</div>
                <div class="service-main__meta">项目 ID：{{ row.inspectionItemId || '--' }}</div>
                <div class="service-main__meta">分类：{{ row.categoryCode || '--' }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="sampleType" label="样品类型" min-width="140" />
        <el-table-column prop="defaultStd" label="默认标准" min-width="180" />
        <el-table-column prop="priceText" label="价格与周期" min-width="180" />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="SERVICE_SHELF_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" min-width="160" />
        <el-table-column label="操作" min-width="180" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <PermissionButton permission="enterprise:service:manage" text @click="openEditDialog(row)">
              编辑
            </PermissionButton>
            <PermissionButton permission="enterprise:service:manage" text @click="handleToggle(row.id)">
              {{ row.status === ServiceShelfStatus.Enabled ? '下架' : '上架' }}
            </PermissionButton>
            <PermissionButton
              permission="enterprise:service:manage"
              text
              type="danger"
              @click="handleDelete(row.id)"
            >
              删除
            </PermissionButton>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <ServiceFormDialog
      v-model:visible="dialogVisible"
      :title="editingId ? '编辑服务' : '新增服务'"
      :form="form"
      :preview-status="editingStatus"
      @submit="submitForm"
    />
  </PageContainer>
</template>

<style scoped lang="scss">
.service-main {
  display: flex;
  gap: 14px;
  align-items: center;
}

.service-main__cover {
  width: 72px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
  background: #eef3fb;
}

.service-main__content {
  display: grid;
  gap: 6px;
}

.service-main__title {
  color: var(--dj-color-text-primary);
  font-size: 15px;
  font-weight: 600;
}

.service-main__meta {
  color: var(--dj-color-text-secondary);
  font-size: 12px;
}
</style>
