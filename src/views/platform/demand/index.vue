<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, reactive, ref } from 'vue'

import {
  assignDemand,
  deleteDemand,
  getDemandDetail,
  getDemandList,
  replyDemand,
} from '@/api/modules/demand'
import PageContainer from '@/components/PageContainer.vue'
import AttachmentPreview from '@/components-business/AttachmentPreview/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import OperationTimeline from '@/components-business/OperationTimeline/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { DEMAND_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { PERMISSION_CODE } from '@/enum/permission'
import { DemandStatus, PublishMode } from '@/enum/status'
import type { AttachmentItem, DemandDetail, DemandItem, DemandQuery } from '@/types/business'

const loading = ref(false)
const total = ref(0)
const tableData = ref<DemandItem[]>([])
const detailVisible = ref(false)
const handleVisible = ref(false)
const currentDetail = ref<DemandDetail | null>(null)
const previewVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])
const replyVisible = ref(false)
const assignVisible = ref(false)
const replyContent = ref('')
const assignOrgName = ref('')

const queryForm = reactive<DemandQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  serviceType: '',
})

const searchFields = [
  {
    label: '关键词',
    prop: 'keyword',
    placeholder: '需求标题/企业名称/机构名称',
  },
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

const demandStats = computed(() => {
  const pending = tableData.value.filter((item) => item.status === DemandStatus.Pending).length
  const processing = tableData.value.filter((item) => item.status === DemandStatus.Processing).length
  const completed = tableData.value.filter((item) => item.status === DemandStatus.Completed).length

  return [
    { key: 'all', label: '全部', value: total.value },
    { key: DemandStatus.Pending, label: '待处理', value: pending },
    { key: DemandStatus.Processing, label: '处理中', value: processing },
    { key: DemandStatus.Completed, label: '已完成', value: completed },
  ]
})

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

function handleSearch() {
  queryForm.pageNum = 1
  loadData()
}

function handlePageChange() {
  loadData()
}

async function openDetail(id: string) {
  currentDetail.value = await getDemandDetail(id)
  detailVisible.value = true
  handleVisible.value = false
}

async function openHandle(id: string) {
  currentDetail.value = await getDemandDetail(id)
  handleVisible.value = true
  detailVisible.value = false
}

function openPreview(files: AttachmentItem[]) {
  previewFiles.value = files
  previewVisible.value = true
}

function getServiceTypeLabel(serviceType?: string) {
  return (
    SERVICE_TYPE_OPTIONS.find((item) => item.value === serviceType)?.label || serviceType || '-'
  )
}

async function submitReply() {
  if (!currentDetail.value || !replyContent.value.trim()) {
    ElMessage.warning('请输入处理意见')
    return
  }

  await replyDemand(currentDetail.value.id, replyContent.value)
  ElMessage.success('处理完成')
  replyVisible.value = false
  replyContent.value = ''
  currentDetail.value = await getDemandDetail(currentDetail.value.id)
  await loadData()
}

async function submitAssign() {
  if (!currentDetail.value || !assignOrgName.value.trim()) {
    ElMessage.warning('请选择分配机构')
    return
  }

  await assignDemand(currentDetail.value.id, assignOrgName.value)
  ElMessage.success('分配完成')
  assignVisible.value = false
  currentDetail.value = await getDemandDetail(currentDetail.value.id)
  await loadData()
}

async function handleDelete(row: DemandItem) {
  try {
    await ElMessageBox.confirm(`确认删除需求“${row.title}”吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  await deleteDemand(row.id)
  ElMessage.success('需求已删除')
  await loadData()

  if (currentDetail.value?.id === row.id) {
    detailVisible.value = false
    handleVisible.value = false
    currentDetail.value = null
  }
}

loadData()
</script>

<template>
  <PageContainer title="需求管理">
    <SearchForm
      v-model="queryForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="loadData"
    />

    <TablePanel
      title=""
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <template #stats>
        <span v-for="item in demandStats" :key="item.key" class="table-stat">
          {{ item.label }}（{{ item.value }}）
        </span>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="需求标题" min-width="240" />
        <el-table-column label="服务类型" width="120">
          <template #default="{ row }">
            {{
              SERVICE_TYPE_OPTIONS.find((item) => item.value === row.serviceType)?.label ||
              row.serviceType
            }}
          </template>
        </el-table-column>
        <el-table-column prop="enterpriseName" label="需求企业" min-width="180" />
        <el-table-column label="对接模式" width="130">
          <template #default="{ row }">
            {{ row.publishMode === PublishMode.PlatformAssign ? '平台分配' : '自主选择' }}
          </template>
        </el-table-column>
        <el-table-column prop="assignedOrg" label="当前机构" min-width="180" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="DEMAND_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="220" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-space wrap>
              <el-button text type="primary" @click="openDetail(row.id)">查看详情</el-button>
              <PermissionButton
                :permission="PERMISSION_CODE.operatorDemandAssign"
                text
                @click="openHandle(row.id)"
              >
                处理
              </PermissionButton>
              <PermissionButton
                :permission="PERMISSION_CODE.operatorDemandAssign"
                text
                type="danger"
                @click="handleDelete(row)"
              >
                删除
              </PermissionButton>
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
            <el-descriptions-item label="需求企业">{{
              currentDetail.enterpriseName
            }}</el-descriptions-item>
            <el-descriptions-item label="服务类型">
              {{ getServiceTypeLabel(currentDetail?.serviceType) }}
            </el-descriptions-item>
            <el-descriptions-item label="对接模式">
              {{
                currentDetail.publishMode === PublishMode.PlatformAssign ? '平台分配' : '自主选择'
              }}
            </el-descriptions-item>
            <el-descriptions-item label="当前机构">{{
              currentDetail.assignedOrg || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{
              currentDetail.contactName
            }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{
              currentDetail.contactPhone
            }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{
              currentDetail.createdAt
            }}</el-descriptions-item>
            <el-descriptions-item label="需求内容">{{
              currentDetail.content
            }}</el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="附件" style="margin-top: 16px">
          <el-button
            type="primary"
            plain
            @click="currentDetail && openPreview(currentDetail.attachments)"
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
        <DetailSection title="基础信息">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="需求标题">{{ currentDetail.title }}</el-descriptions-item>
            <el-descriptions-item label="需求企业">{{
              currentDetail.enterpriseName
            }}</el-descriptions-item>
            <el-descriptions-item label="服务类型">
              {{ getServiceTypeLabel(currentDetail?.serviceType) }}
            </el-descriptions-item>
            <el-descriptions-item label="当前机构">{{
              currentDetail.assignedOrg || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{
              currentDetail.contactName
            }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{
              currentDetail.contactPhone
            }}</el-descriptions-item>
            <el-descriptions-item label="需求内容">{{
              currentDetail.content
            }}</el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="附件" style="margin-top: 16px">
          <el-button
            type="primary"
            plain
            @click="currentDetail && openPreview(currentDetail.attachments)"
          >
            查看附件
          </el-button>
        </DetailSection>

        <DetailSection title="处理记录" style="margin-top: 16px">
          <OperationTimeline :nodes="currentDetail.replyRecords" />
        </DetailSection>

        <div class="drawer-actions">
          <PermissionButton
            :permission="PERMISSION_CODE.operatorDemandAssign"
            plain
            @click="assignVisible = true"
          >
            分配机构
          </PermissionButton>
          <PermissionButton
            :permission="PERMISSION_CODE.operatorDemandAssign"
            @click="replyVisible = true"
          >
            回复
          </PermissionButton>
        </div>
      </template>
    </el-drawer>

    <el-dialog v-model="assignVisible" title="分配机构" width="520px">
      <el-input v-model="assignOrgName" placeholder="请输入机构名称" />
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssign">确认分配</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="replyVisible" title="处理需求" width="520px">
      <el-input v-model="replyContent" type="textarea" :rows="5" placeholder="请输入处理意见" />
      <template #footer>
        <el-button @click="replyVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply">提交</el-button>
      </template>
    </el-dialog>

    <AttachmentPreview v-model:visible="previewVisible" :files="previewFiles" />
  </PageContainer>
</template>

<style scoped lang="scss">
.table-stat {
  color: var(--dj-color-text-primary);
  font-size: 16px;
  font-weight: 500;
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}
</style>
