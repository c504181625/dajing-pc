<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, reactive, ref } from 'vue'

import { getDemandDetail, getDemandList, replyDemand } from '@/api/modules/demand'
import PageContainer from '@/components/PageContainer.vue'
import AttachmentPreview from '@/components-business/AttachmentPreview/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import OperationTimeline from '@/components-business/OperationTimeline/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { DEMAND_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { useUserStore } from '@/store/modules/user'
import type { AttachmentItem, DemandDetail, DemandItem, DemandQuery } from '@/types/business'

const userStore = useUserStore()
const loading = ref(false)
const detailVisible = ref(false)
const replyVisible = ref(false)
const tableData = ref<DemandItem[]>([])
const currentDetail = ref<DemandDetail | null>(null)
const previewVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])
const replyContent = ref('')

const isDemander = computed(() => userStore.hasEnterpriseCapability('demander'))

const pageTitle = computed(() => (isDemander.value ? '我的需求' : '需求管理'))
const pageSubtitle = computed(() =>
  isDemander.value
    ? '查看本企业已提交需求、附件和处理记录。'
    : '查看平台分配给本机构的需求并及时回复。',
)

const queryForm = reactive<DemandQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  serviceType: '',
})

const searchFields = computed(() => [
  { label: '关键词', prop: 'keyword', placeholder: '需求标题/企业名称/分配机构' },
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
])

function resetQuery() {
  Object.assign(queryForm, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    status: '',
    serviceType: '',
  })
  loadData()
}

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

function openReplyDialog() {
  if (!currentDetail.value) return
  replyContent.value = ''
  replyVisible.value = true
}

async function submitReply() {
  if (!currentDetail.value || !replyContent.value.trim()) {
    ElMessage.warning('请输入回复内容')
    return
  }
  await replyDemand(currentDetail.value.id, replyContent.value)
  ElMessage.success('需求回复成功')
  replyVisible.value = false
  await openDetail(currentDetail.value.id)
  loadData()
}

loadData()
</script>

<template>
  <PageContainer :title="pageTitle" :subtitle="pageSubtitle">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="loadData" @reset="resetQuery" />

    <TablePanel title="需求列表">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="需求标题" min-width="240" />
        <el-table-column prop="enterpriseName" label="企业名称" min-width="180" />
        <el-table-column label="服务类型" width="120">
          <template #default="{ row }">
            {{
              SERVICE_TYPE_OPTIONS.find((item) => item.value === row.serviceType)?.label ||
              row.serviceType
            }}
          </template>
        </el-table-column>
        <el-table-column prop="assignedOrg" label="承接机构" min-width="180" />
        <el-table-column label="状态" width="110">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="DEMAND_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" min-width="160" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openDetail(row.id)">查看详情</el-button>
            <PermissionButton
              v-if="!isDemander"
              permission="enterprise:demand:handle"
              text
              @click="openDetail(row.id)"
            >
              回复
            </PermissionButton>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <el-drawer v-model="detailVisible" title="需求详情" size="760px">
      <template v-if="currentDetail">
        <DetailSection title="需求内容">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="需求标题">{{ currentDetail.title }}</el-descriptions-item>
            <el-descriptions-item label="企业名称">{{
              currentDetail.enterpriseName
            }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{
              currentDetail.contactPhone
            }}</el-descriptions-item>
            <el-descriptions-item label="需求说明">{{
              currentDetail.content
            }}</el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="附件" style="margin-top: 16px">
          <el-button type="primary" plain @click="openPreview(currentDetail.attachments)"
            >查看附件</el-button
          >
        </DetailSection>

        <DetailSection title="处理记录" style="margin-top: 16px">
          <OperationTimeline :nodes="currentDetail.replyRecords" />
        </DetailSection>

        <div class="drawer-actions" v-if="!isDemander">
          <PermissionButton permission="enterprise:demand:handle" @click="openReplyDialog"
            >回复需求</PermissionButton
          >
        </div>
      </template>
    </el-drawer>

    <el-dialog v-model="replyVisible" title="回复需求" width="520px">
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
