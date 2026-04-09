<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

import { getConsultDetail, getConsultList, replyConsult } from '@/api/modules/consult'
import PageContainer from '@/components/PageContainer.vue'
import AttachmentPreview from '@/components-business/AttachmentPreview/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import OperationTimeline from '@/components-business/OperationTimeline/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { CONSULT_STATUS_MAP } from '@/constants/dicts'
import type { AttachmentItem, ConsultDetail, ConsultItem, ConsultQuery } from '@/types/business'

const loading = ref(false)
const detailVisible = ref(false)
const replyVisible = ref(false)
const tableData = ref<ConsultItem[]>([])
const currentDetail = ref<ConsultDetail | null>(null)
const previewVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])
const replyContent = ref('')

const queryForm = reactive<ConsultQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
})

const searchFields = [
  { label: '关键字', prop: 'keyword', placeholder: '咨询标题/企业名称/联系人' },
  {
    label: '状态',
    prop: 'status',
    component: 'select' as const,
    placeholder: '请选择状态',
    options: Object.values(CONSULT_STATUS_MAP),
  },
]

async function loadData() {
  loading.value = true
  try {
    const res = await getConsultList(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

async function openDetail(id: string) {
  currentDetail.value = await getConsultDetail(id)
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
  await replyConsult(currentDetail.value.id, replyContent.value)
  ElMessage.success('回复成功')
  replyVisible.value = false
  replyContent.value = ''
}

loadData()
</script>

<template>
  <PageContainer title="咨询管理" subtitle="按列表 + 详情抽屉方式管理企业咨询，支持状态筛选与快速回复。">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="loadData" @reset="loadData" />

    <TablePanel title="咨询列表">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="咨询标题" min-width="260" />
        <el-table-column prop="enterpriseName" label="企业名称" min-width="180" />
        <el-table-column prop="contactName" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="CONSULT_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" min-width="160" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button text type="primary" @click="openDetail(row.id)">查看详情</el-button>
            <PermissionButton permission="demand:manage:view" text @click="openDetail(row.id)">回复</PermissionButton>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <el-drawer v-model="detailVisible" title="咨询详情" size="720px">
      <template v-if="currentDetail">
        <DetailSection title="咨询内容">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="咨询标题">{{ currentDetail.title }}</el-descriptions-item>
            <el-descriptions-item label="企业名称">{{ currentDetail.enterpriseName }}</el-descriptions-item>
            <el-descriptions-item label="咨询内容">{{ currentDetail.content }}</el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="附件" style="margin-top: 16px">
          <el-button type="primary" plain @click="openPreview(currentDetail.attachments)">查看附件</el-button>
        </DetailSection>

        <DetailSection title="处理记录" style="margin-top: 16px">
          <OperationTimeline :nodes="currentDetail.replyRecords" />
        </DetailSection>

        <div class="drawer-actions">
          <PermissionButton permission="demand:manage:view" @click="replyVisible = true">咨询回复</PermissionButton>
        </div>
      </template>
    </el-drawer>

    <el-dialog v-model="replyVisible" title="咨询回复" width="520px">
      <el-input v-model="replyContent" type="textarea" :rows="5" placeholder="请输入回复内容" />
      <template #footer>
        <el-button @click="replyVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReply">提交回复</el-button>
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
}
</style>
