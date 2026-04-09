<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

import { assignDemand, getDemandDetail, getDemandList, replyDemand } from '@/api/modules/demand'
import PageContainer from '@/components/PageContainer.vue'
import AttachmentPreview from '@/components-business/AttachmentPreview/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import OperationTimeline from '@/components-business/OperationTimeline/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { DEMAND_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { PublishMode } from '@/enum/status'
import type { AttachmentItem, DemandDetail, DemandItem, DemandQuery } from '@/types/business'

const loading = ref(false)
const detailVisible = ref(false)
const replyVisible = ref(false)
const assignVisible = ref(false)
const tableData = ref<DemandItem[]>([])
const currentDetail = ref<DemandDetail | null>(null)
const previewVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])
const replyContent = ref('')
const assignOrgName = ref('')

const queryForm = reactive<DemandQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
})

const searchFields = [
  { label: '关键字', prop: 'keyword', placeholder: '需求标题/企业名称/机构名称' },
  {
    label: '状态',
    prop: 'status',
    component: 'select' as const,
    placeholder: '请选择状态',
    options: Object.values(DEMAND_STATUS_MAP),
  },
]

async function loadData() {
  loading.value = true
  try {
    const res = await getDemandList(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

async function openDetail(id: string) {
  currentDetail.value = await getDemandDetail(id)
  detailVisible.value = true
}

function openPreview(files: AttachmentItem[]) {
  previewFiles.value = files
  previewVisible.value = true
}

async function submitReply() {
  if (!currentDetail.value || !replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  await replyDemand(currentDetail.value.id, replyContent.value)
  ElMessage.success('回复成功')
  replyVisible.value = false
  replyContent.value = ''
}

async function submitAssign() {
  if (!currentDetail.value || !assignOrgName.value.trim()) {
    ElMessage.warning('请输入机构名称')
    return
  }
  await assignDemand(currentDetail.value.id, assignOrgName.value)
  ElMessage.success('分配成功')
  assignVisible.value = false
  assignOrgName.value = ''
  loadData()
}

loadData()
</script>

<template>
  <PageContainer title="需求管理" subtitle="以列表 + 详情抽屉承载需求受理、回复和分配机构操作，一期先保证闭环可用。">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="loadData" @reset="loadData" />

    <TablePanel title="需求列表">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="需求标题" min-width="240" />
        <el-table-column label="服务类型" width="120">
          <template #default="{ row }">
            {{ SERVICE_TYPE_OPTIONS.find((item) => item.value === row.serviceType)?.label || row.serviceType }}
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
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openDetail(row.id)">查看详情</el-button>
            <PermissionButton permission="demand:manage:view" text @click="openDetail(row.id)">处理</PermissionButton>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <el-drawer v-model="detailVisible" title="需求详情" size="720px">
      <template v-if="currentDetail">
        <DetailSection title="基础信息">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="需求标题">{{ currentDetail.title }}</el-descriptions-item>
            <el-descriptions-item label="需求内容">{{ currentDetail.content }}</el-descriptions-item>
            <el-descriptions-item label="需求企业">{{ currentDetail.enterpriseName }}</el-descriptions-item>
            <el-descriptions-item label="当前机构">{{ currentDetail.assignedOrg || '-' }}</el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="附件" style="margin-top: 16px">
          <el-button type="primary" plain @click="openPreview(currentDetail.attachments)">查看附件</el-button>
        </DetailSection>

        <DetailSection title="处理记录" style="margin-top: 16px">
          <OperationTimeline :nodes="currentDetail.replyRecords" />
        </DetailSection>

        <div class="drawer-actions">
          <PermissionButton permission="demand:manage:view" @click="replyVisible = true">回复</PermissionButton>
          <PermissionButton permission="demand:manage:view" plain @click="assignVisible = true">分配机构</PermissionButton>
        </div>
      </template>
    </el-drawer>

    <el-dialog v-model="replyVisible" title="需求回复" width="520px">
      <el-input v-model="replyContent" type="textarea" :rows="5" placeholder="请输入回复内容" />
      <template #footer>
        <el-button @click="replyVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply">提交回复</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="assignVisible" title="分配机构" width="520px">
      <el-input v-model="assignOrgName" placeholder="请输入机构名称" />
      <template #footer>
        <el-button @click="assignVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAssign">确认分配</el-button>
      </template>
    </el-dialog>

    <AttachmentPreview v-model:visible="previewVisible" :files="previewFiles" />
  </PageContainer>
</template>

<style scoped>
.drawer-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
