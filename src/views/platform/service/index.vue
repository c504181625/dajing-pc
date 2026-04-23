<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, reactive, ref } from 'vue'

import {
  getOperatorEnterpriseServiceDetail,
  getOperatorEnterpriseServiceList,
  getOperatorServiceListByEnterprise,
  hasOperatorServiceCreateApi,
  hasOperatorServiceShelfApi,
  saveService,
  toggleOperatorServiceStatus,
} from '@/api/modules/service'
import PageContainer from '@/components/PageContainer.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import ServiceFormDialog from '@/components-business/ServiceFormDialog/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { AUDIT_STATUS_MAP, SERVICE_SHELF_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { PERMISSION_CODE } from '@/enum/permission'
import { AuditStatus, ServiceShelfStatus, ServiceType } from '@/enum/status'
import type {
  OperatorEnterpriseServiceDetail,
  OperatorEnterpriseServiceItem,
  OperatorEnterpriseServiceQuery,
  ServiceForm,
  ServiceItem,
  ServiceQuery,
} from '@/types/business'

const loading = ref(false)
const total = ref(0)
const tableData = ref<OperatorEnterpriseServiceItem[]>([])

const drawerVisible = ref(false)
const serviceLoading = ref(false)
const serviceDialogVisible = ref(false)
const currentEnterprise = ref<OperatorEnterpriseServiceItem | null>(null)
const currentEnterpriseDetail = ref<OperatorEnterpriseServiceDetail | null>(null)
const serviceTableData = ref<ServiceItem[]>([])
const serviceTotal = ref(0)
const editingServiceId = ref('')
const editingServiceStatus = ref(ServiceShelfStatus.Disabled)

const queryForm = reactive<OperatorEnterpriseServiceQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  serviceType: '',
})

const serviceQuery = reactive<ServiceQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  serviceType: '',
  status: '',
})

const serviceForm = reactive<ServiceForm>({
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
  {
    label: '企业名称',
    prop: 'keyword',
    placeholder: '请输入企业名称或统一社会信用代码',
  },
  {
    label: '审核状态',
    prop: 'status',
    component: 'select' as const,
    placeholder: '请选择审核状态',
    options: Object.values(AUDIT_STATUS_MAP),
  },
  {
    label: '服务类型',
    prop: 'serviceType',
    component: 'select' as const,
    placeholder: '请选择服务类型',
    options: SERVICE_TYPE_OPTIONS,
  },
]

const auditStats = computed(() => {
  const pending = tableData.value.filter((item) => item.status === AuditStatus.Pending).length
  const supplement = tableData.value.filter((item) => item.status === AuditStatus.Supplement).length
  const approved = tableData.value.filter((item) => item.status === AuditStatus.Approved).length

  return [
    { key: 'all', label: '全部', value: total.value, queryValue: '' as AuditStatus | '' },
    { key: AuditStatus.Pending, label: '待审核', value: pending, queryValue: AuditStatus.Pending as AuditStatus | '' },
    {
      key: AuditStatus.Supplement,
      label: '待补充',
      value: supplement,
      queryValue: AuditStatus.Supplement as AuditStatus | '',
    },
    {
      key: AuditStatus.Approved,
      label: '已通过',
      value: approved,
      queryValue: AuditStatus.Approved as AuditStatus | '',
    },
  ]
})

const serviceStats = computed(() => {
  const enabledCount = serviceTableData.value.filter(
    (item) => item.status === ServiceShelfStatus.Enabled,
  ).length
  const disabledCount = serviceTableData.value.filter(
    (item) => item.status === ServiceShelfStatus.Disabled,
  ).length

  return [
    { key: 'all', label: '全部服务', value: serviceTotal.value },
    { key: 'enabled', label: '已上架', value: enabledCount },
    { key: 'disabled', label: '未上架', value: disabledCount },
  ]
})

const serviceDialogTitle = computed(() => (editingServiceId.value ? '编辑服务' : '新增服务'))

function getServiceTypeLabel(value: ServiceType | string) {
  return SERVICE_TYPE_OPTIONS.find((item) => item.value === value)?.label || value
}

function resetServiceQuery() {
  Object.assign(serviceQuery, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    serviceType: '',
    status: '',
  })
}

function resetServiceForm() {
  Object.assign(serviceForm, {
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

function fillServiceForm(row: ServiceItem) {
  Object.assign(serviceForm, {
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
    contactName: row.contactName || currentEnterprise.value?.contactName || '',
    contactPhone: row.contactPhone || currentEnterprise.value?.contactPhone || '',
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
}

async function loadData() {
  loading.value = true
  try {
    const res = await getOperatorEnterpriseServiceList(queryForm)
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function loadEnterpriseServices() {
  if (!currentEnterprise.value) return

  serviceLoading.value = true
  try {
    const [detail, remotePage] = await Promise.all([
      getOperatorEnterpriseServiceDetail(currentEnterprise.value.enterpriseId),
      getOperatorServiceListByEnterprise(
        currentEnterprise.value.enterpriseId,
        currentEnterprise.value.enterpriseName,
        serviceQuery,
      ),
    ])

    currentEnterpriseDetail.value = detail
    serviceTableData.value = remotePage.list
    serviceTotal.value = remotePage.total
  } finally {
    serviceLoading.value = false
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  void loadData()
}

function handleReset() {
  queryForm.pageNum = 1
  void loadData()
}

function handlePageChange() {
  void loadData()
}

function switchAuditStatus(value: AuditStatus | '') {
  queryForm.status = value
  queryForm.pageNum = 1
  void loadData()
}

async function openServiceDrawer(row: OperatorEnterpriseServiceItem) {
  currentEnterprise.value = row
  currentEnterpriseDetail.value = null
  serviceTableData.value = []
  serviceTotal.value = 0
  resetServiceQuery()
  resetServiceForm()
  editingServiceId.value = ''
  editingServiceStatus.value = ServiceShelfStatus.Disabled
  drawerVisible.value = true
  await loadEnterpriseServices()
}

function handleServiceSearch() {
  serviceQuery.pageNum = 1
  void loadEnterpriseServices()
}

function handleServiceReset() {
  resetServiceQuery()
  void loadEnterpriseServices()
}

function handleServicePageChange() {
  void loadEnterpriseServices()
}

function openCreateServiceDialog() {
  editingServiceId.value = ''
  editingServiceStatus.value = ServiceShelfStatus.Disabled
  resetServiceForm()
  serviceDialogVisible.value = true
}

function openEditServiceDialog(row: ServiceItem) {
  editingServiceId.value = row.id
  editingServiceStatus.value = row.status
  fillServiceForm(row)
  serviceDialogVisible.value = true
}

async function submitServiceForm(payload: ServiceForm, publishAfterSave: boolean) {
  if (!currentEnterprise.value) return

  if (!hasOperatorServiceCreateApi()) {
    ElMessage.warning('当前暂未接通平台服务新增编辑接口')
    return
  }

  const serviceId = await saveService({
    id: editingServiceId.value || undefined,
    ...payload,
    enterpriseId: currentEnterprise.value.enterpriseId,
    enterpriseName: currentEnterprise.value.enterpriseName,
  })

  if (
    publishAfterSave &&
    serviceId &&
    (!editingServiceId.value || editingServiceStatus.value !== ServiceShelfStatus.Enabled)
  ) {
    await toggleOperatorServiceStatus(serviceId, editingServiceStatus.value)
  }

  ElMessage.success(
    editingServiceId.value
      ? publishAfterSave && editingServiceStatus.value !== ServiceShelfStatus.Enabled
        ? '服务已更新并上架'
        : '服务已更新'
      : publishAfterSave
        ? '服务已新增并上架'
        : '服务已新增',
  )

  serviceDialogVisible.value = false
  editingServiceId.value = ''
  editingServiceStatus.value = ServiceShelfStatus.Disabled
  await loadEnterpriseServices()
}

async function handleToggleService(row: ServiceItem) {
  if (!hasOperatorServiceShelfApi()) {
    ElMessage.warning('当前暂未接通平台服务上下架接口')
    return
  }

  const success = await toggleOperatorServiceStatus(row.id, row.status)
  if (!success || !currentEnterprise.value) {
    ElMessage.warning('当前暂未接通平台服务上下架接口')
    return
  }

  ElMessage.success(row.status === ServiceShelfStatus.Enabled ? '服务已下架' : '服务已上架')
  await loadEnterpriseServices()
}

void loadData()
</script>

<template>
  <PageContainer title="服务管理" subtitle="运营方可查看企业服务、编辑详情、上下架与新增上架内容。">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="handleSearch" @reset="handleReset" />

    <TablePanel
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <template #stats>
        <button
          v-for="item in auditStats"
          :key="item.key"
          type="button"
          class="stats-switch"
          :class="{ 'is-active': queryForm.status === item.queryValue }"
          @click="switchAuditStatus(item.queryValue)"
        >
          {{ item.label }}（{{ item.value }}）
        </button>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="enterpriseName" label="企业名称" min-width="240" />
        <el-table-column prop="socialCreditCode" label="统一社会信用代码" min-width="190" />
        <el-table-column label="服务方向" min-width="240">
          <template #default="{ row }">
            <el-space wrap>
              <el-tag v-for="item in row.serviceTypes" :key="item" effect="light">
                {{ getServiceTypeLabel(item) }}
              </el-tag>
            </el-space>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="120" align="center" header-align="center">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="AUDIT_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="contactName" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="150" />
        <el-table-column prop="submitTime" label="提交时间" min-width="160" />
        <el-table-column label="操作" min-width="120" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <PermissionButton
              :permission="PERMISSION_CODE.operatorServiceView"
              text
              @click="openServiceDrawer(row)"
            >
              管理服务
            </PermissionButton>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <el-drawer
      v-model="drawerVisible"
      :title="currentEnterprise ? `${currentEnterprise.enterpriseName} · 服务管理` : '服务管理'"
      size="1180px"
    >
      <template v-if="currentEnterprise">
        <DetailSection title="企业概览">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="企业名称">
              {{ currentEnterprise.enterpriseName }}
            </el-descriptions-item>
            <el-descriptions-item label="统一社会信用代码">
              {{ currentEnterprise.socialCreditCode }}
            </el-descriptions-item>
            <el-descriptions-item label="联系人">
              {{ currentEnterprise.contactName }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ currentEnterprise.contactPhone }}
            </el-descriptions-item>
            <el-descriptions-item label="机构类型">
              {{ currentEnterprise.enterpriseType }}
            </el-descriptions-item>
            <el-descriptions-item label="资质数量">
              {{ currentEnterpriseDetail?.qualificationCount ?? '--' }}
            </el-descriptions-item>
            <el-descriptions-item label="企业地址" :span="2">
              {{ currentEnterpriseDetail?.address || '--' }}
            </el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="服务筛选">
          <div class="service-filter">
            <el-input
              v-model="serviceQuery.keyword"
              clearable
              placeholder="服务名称 / 项目 ID / 分类 / 标准"
              @keyup.enter="handleServiceSearch"
            />
            <el-select v-model="serviceQuery.serviceType" clearable placeholder="服务类型">
              <el-option
                v-for="item in SERVICE_TYPE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-select v-model="serviceQuery.status" clearable placeholder="上下架状态">
              <el-option
                v-for="item in Object.values(SERVICE_SHELF_STATUS_MAP)"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <el-button type="primary" @click="handleServiceSearch">查询</el-button>
            <el-button @click="handleServiceReset">重置</el-button>
          </div>
        </DetailSection>

        <TablePanel
          title="服务列表"
          :total="serviceTotal"
          :page-num="serviceQuery.pageNum"
          :page-size="serviceQuery.pageSize"
          @update:page-num="serviceQuery.pageNum = $event"
          @update:page-size="serviceQuery.pageSize = $event"
          @pageChange="handleServicePageChange"
        >
          <template #stats>
            <span v-for="item in serviceStats" :key="item.key" class="table-stat">
              {{ item.label }}：{{ item.value }}
            </span>
          </template>

          <template #toolbar>
            <PermissionButton
              :permission="PERMISSION_CODE.operatorServiceManage"
              @click="openCreateServiceDialog"
            >
              新增服务
            </PermissionButton>
          </template>

          <el-table v-loading="serviceLoading" :data="serviceTableData" border>
            <template #empty>
              <el-empty description="暂无服务数据" />
            </template>

            <el-table-column label="服务信息" min-width="320">
              <template #default="{ row }">
                <div class="service-row">
                  <img v-if="row.coverUrl" :src="row.coverUrl" alt="封面" class="service-row__cover" />
                  <div class="service-row__main">
                    <div class="service-row__title">{{ row.serviceName }}</div>
                    <div class="service-row__meta">项目 ID：{{ row.inspectionItemId || '--' }}</div>
                    <div class="service-row__meta">分类：{{ row.categoryCode || '--' }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="sampleType" label="样品类型" min-width="140" />
            <el-table-column prop="defaultStd" label="默认标准" min-width="180" />
            <el-table-column prop="priceText" label="价格与周期" min-width="200" />
            <el-table-column label="能力标签" min-width="180">
              <template #default="{ row }">
                <el-space wrap>
                  <el-tag v-if="row.supportCma" effect="light">CMA</el-tag>
                  <el-tag v-if="row.supportCnas" effect="light" type="success">CNAS</el-tag>
                  <el-tag v-if="row.supportUrgent" effect="light" type="warning">加急</el-tag>
                </el-space>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="110" align="center" header-align="center">
              <template #default="{ row }">
                <StatusTag :status="row.status" :map="SERVICE_SHELF_STATUS_MAP" />
              </template>
            </el-table-column>
            <el-table-column prop="updatedAt" label="更新时间" min-width="160" />
            <el-table-column label="操作" width="170" fixed="right" align="center" header-align="center">
              <template #default="{ row }">
                <PermissionButton
                  :permission="PERMISSION_CODE.operatorServiceManage"
                  text
                  @click="openEditServiceDialog(row)"
                >
                  编辑
                </PermissionButton>
                <PermissionButton
                  :permission="PERMISSION_CODE.operatorServiceManage"
                  text
                  type="primary"
                  @click="handleToggleService(row)"
                >
                  {{ row.status === ServiceShelfStatus.Enabled ? '下架' : '上架' }}
                </PermissionButton>
              </template>
            </el-table-column>
          </el-table>
        </TablePanel>
      </template>
    </el-drawer>

    <ServiceFormDialog
      v-model:visible="serviceDialogVisible"
      :title="serviceDialogTitle"
      :form="serviceForm"
      :preview-status="editingServiceStatus"
      @submit="submitServiceForm"
    />
  </PageContainer>
</template>

<style scoped lang="scss">
.service-filter {
  display: grid;
  grid-template-columns: minmax(0, 2fr) 160px 160px auto auto;
  gap: 12px;
}

.service-row {
  display: flex;
  gap: 14px;
  align-items: center;
}

.service-row__cover {
  width: 92px;
  height: 68px;
  border-radius: 14px;
  object-fit: cover;
  background: #eef3fb;
}

.service-row__main {
  display: grid;
  gap: 6px;
}

.service-row__title {
  color: var(--dj-color-text-primary);
  font-size: 15px;
  font-weight: 600;
}

.service-row__meta {
  color: var(--dj-color-text-secondary);
  font-size: 12px;
}

@media (max-width: 900px) {
  .service-filter {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
