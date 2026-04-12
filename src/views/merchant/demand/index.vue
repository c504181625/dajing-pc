<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import {
  acceptDemand,
  deleteDemand,
  getDemandDetail,
  getDemandList,
  replyDemand,
} from '@/api/modules/demand'
import PageContainer from '@/components/PageContainer.vue'
import AttachmentPreview from '@/components-business/AttachmentPreview/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import OperationTimeline from '@/components-business/OperationTimeline/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { DEMAND_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { ACCOUNT_TYPE } from '@/enum/role'
import { DemandStatus, PublishMode } from '@/enum/status'
import { useUserStore } from '@/store/modules/user'
import type { AttachmentItem, DemandDetail, DemandItem, DemandQuery } from '@/types/business'

const router = useRouter()
const userStore = useUserStore()

const loading = ref(false)
const total = ref(0)
const tableData = ref<DemandItem[]>([])
const detailVisible = ref(false)
const handleVisible = ref(false)
const currentDetail = ref<DemandDetail | null>(null)
const previewVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])
const handleForm = reactive({
  replyContent: '',
})

const queryForm = reactive<DemandQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  serviceType: '',
})

const currentAccountType = computed(() => userStore.userInfo?.accountType)
const isPersonal = computed(() => currentAccountType.value === ACCOUNT_TYPE.personal)
const isProvider = computed(() => userStore.hasEnterpriseCapability('provider'))
const canPublishDemand = computed(
  () => currentAccountType.value === ACCOUNT_TYPE.personal || currentAccountType.value === ACCOUNT_TYPE.enterprise,
)

const pageTitle = computed(() => {
  if (isPersonal.value) return '我的需求'
  if (isProvider.value) return '需求管理'
  return '需求管理'
})

const pageSubtitle = computed(() => {
  if (isPersonal.value) return '统一查看个人已提交需求，并可直接新建新的服务需求。'
  if (isProvider.value) return '服务提供方可查看需求详情、接单跟进，并同步创建本机构自己的服务需求。'
  return '企业统一管理需求发布、平台分配和处理进展。'
})

const searchFields = [
  { label: '关键词', prop: 'keyword', placeholder: '需求标题 / 主体名称 / 承接机构' },
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
    options: Object.values(DEMAND_STATUS_MAP),
  },
]

function getCreateDemandPath() {
  return isPersonal.value ? '/personal/demand/create' : '/enterprise/demand/create'
}

function handleSearch() {
  queryForm.pageNum = 1
  loadData()
}

function handleReset() {
  Object.assign(queryForm, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    status: '',
    serviceType: '',
  })
  loadData()
}

function handlePageChange() {
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const res = await getDemandList(queryForm)
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function openDetail(id: string) {
  currentDetail.value = await getDemandDetail(id)
  detailVisible.value = true
}

async function openHandle(id: string) {
  currentDetail.value = await getDemandDetail(id)
  handleForm.replyContent = ''
  handleVisible.value = true
}

function openPreview(files: AttachmentItem[]) {
  previewFiles.value = files
  previewVisible.value = true
}

function getServiceTypeLabel(serviceType?: string) {
  return SERVICE_TYPE_OPTIONS.find((item) => item.value === serviceType)?.label || serviceType || '-'
}

function getPublishModeLabel(mode?: string) {
  return mode === PublishMode.SelfSelect ? '自主选择机构' : '平台分配机构'
}

function canAcceptDemand(row: DemandItem) {
  return isProvider.value && [DemandStatus.Pending, DemandStatus.Assigned].includes(row.status)
}

async function handleAccept(row: DemandItem) {
  await acceptDemand(row.id)
  ElMessage.success('已接单')
  if (currentDetail.value?.id === row.id) {
    currentDetail.value = await getDemandDetail(row.id)
  }
  await loadData()
}

async function handleReply() {
  if (!currentDetail.value || !handleForm.replyContent.trim()) {
    ElMessage.warning('请输入处理意见')
    return
  }

  await replyDemand(currentDetail.value.id, handleForm.replyContent)
  ElMessage.success('处理完成')
  handleVisible.value = false
  currentDetail.value = await getDemandDetail(currentDetail.value.id)
  await loadData()
}

async function handleDelete(row: DemandItem) {
  try {
    await ElMessageBox.confirm(`确认删除需求“${row.title}”吗？`, '删除确认', { type: 'warning' })
  } catch {
    return
  }

  await deleteDemand(row.id)
  ElMessage.success('需求已删除')
  await loadData()
}

async function handleQuickCreate() {
  if (!canPublishDemand.value) return
  router.push(getCreateDemandPath())
}

loadData()
</script>

<template>
  <PageContainer :title="pageTitle" :subtitle="pageSubtitle">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="handleSearch" @reset="handleReset" />

    <TablePanel
      title="需求列表"
      description="统一查看需求主体、对接方式、机构状态与服务进展。"
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <template #toolbar>
        <el-button v-if="canPublishDemand" type="primary" @click="handleQuickCreate">发布需求</el-button>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="需求标题" min-width="240" />
        <el-table-column label="服务类型" width="120">
          <template #default="{ row }">
            {{ getServiceTypeLabel(row.serviceType) }}
          </template>
        </el-table-column>
        <el-table-column prop="enterpriseName" label="主体名称" min-width="180" />
        <el-table-column label="对接方式" width="130">
          <template #default="{ row }">
            {{ getPublishModeLabel(row.publishMode) }}
          </template>
        </el-table-column>
        <el-table-column prop="assignedOrg" label="当前机构" min-width="180" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="DEMAND_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" min-width="160" />
        <el-table-column label="操作" min-width="220" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-space wrap>
              <el-button text type="primary" @click="openDetail(row.id)">查看详情</el-button>
              <el-button v-if="isProvider" text type="primary" @click="openHandle(row.id)">处理</el-button>
              <el-button v-if="canAcceptDemand(row)" text type="success" @click="handleAccept(row)">接单</el-button>
              <el-button text type="danger" @click="handleDelete(row)">删除</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <el-drawer v-model="detailVisible" title="需求详情" size="760px">
      <template v-if="currentDetail">
        <DetailSection title="基础信息">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="需求标题">{{ currentDetail.title }}</el-descriptions-item>
            <el-descriptions-item label="主体名称">{{ currentDetail.enterpriseName }}</el-descriptions-item>
            <el-descriptions-item label="服务类型">
              {{ getServiceTypeLabel(currentDetail.serviceType) }}
            </el-descriptions-item>
            <el-descriptions-item label="对接方式">
              {{ getPublishModeLabel(currentDetail.publishMode) }}
            </el-descriptions-item>
            <el-descriptions-item label="当前机构">{{ currentDetail.assignedOrg || '-' }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{ currentDetail.contactName }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ currentDetail.contactPhone }}</el-descriptions-item>
            <el-descriptions-item label="需求说明">{{ currentDetail.content }}</el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="附件材料" style="margin-top: 16px">
          <el-button
            type="primary"
            plain
            :disabled="!currentDetail.attachments.length"
            @click="openPreview(currentDetail.attachments)"
          >
            查看附件
          </el-button>
        </DetailSection>

        <DetailSection title="处理记录" style="margin-top: 16px">
          <OperationTimeline :nodes="currentDetail.replyRecords" />
        </DetailSection>
      </template>
    </el-drawer>

    <el-drawer v-model="handleVisible" title="处理需求" size="760px">
      <template v-if="currentDetail">
        <DetailSection title="需求概览">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="需求标题">{{ currentDetail.title }}</el-descriptions-item>
            <el-descriptions-item label="主体名称">{{ currentDetail.enterpriseName }}</el-descriptions-item>
            <el-descriptions-item label="当前机构">{{ currentDetail.assignedOrg || '-' }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ currentDetail.contactPhone }}</el-descriptions-item>
            <el-descriptions-item label="需求说明">{{ currentDetail.content }}</el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="需求附件" style="margin-top: 16px">
          <el-button
            type="primary"
            plain
            :disabled="!currentDetail.attachments.length"
            @click="openPreview(currentDetail.attachments)"
          >
            查看附件
          </el-button>
        </DetailSection>

        <DetailSection title="处理记录" style="margin-top: 16px">
          <OperationTimeline :nodes="currentDetail.replyRecords" />
        </DetailSection>

        <DetailSection title="处理动作" style="margin-top: 16px">
          <el-form label-position="top">
            <el-form-item label="回复意见">
              <el-input
                v-model="handleForm.replyContent"
                type="textarea"
                :rows="5"
                placeholder="请输入服务方案、沟通结果或接单说明"
              />
            </el-form-item>
            <div class="drawer-actions">
              <el-button v-if="canAcceptDemand(currentDetail)" type="success" plain @click="handleAccept(currentDetail)">
                接单
              </el-button>
              <el-button type="primary" @click="handleReply">提交处理</el-button>
            </div>
          </el-form>
        </DetailSection>
      </template>
    </el-drawer>

    <AttachmentPreview v-model:visible="previewVisible" :files="previewFiles" />
  </PageContainer>
</template>

<style scoped lang="scss">
.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
