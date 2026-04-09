<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import { getReportDetail, getReportList } from '@/api/modules/report'
import PageContainer from '@/components/PageContainer.vue'
import AttachmentPreview from '@/components-business/AttachmentPreview/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import OperationTimeline from '@/components-business/OperationTimeline/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { REPORT_STATUS_MAP } from '@/constants/dicts'
import { useUserStore } from '@/store/modules/user'
import type { AttachmentItem, ReportDetail, ReportItem, ReportQuery } from '@/types/business'

const userStore = useUserStore()
const loading = ref(false)
const detailVisible = ref(false)
const previewVisible = ref(false)
const tableData = ref<ReportItem[]>([])
const currentDetail = ref<ReportDetail | null>(null)
const previewFiles = ref<AttachmentItem[]>([])

const isDemander = computed(() => userStore.hasEnterpriseCapability('demander'))

const queryForm = reactive<ReportQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
})

const searchFields = [
  { label: '关键词', prop: 'keyword', placeholder: '报告编号/订单号/企业名称/项目名称' },
  {
    label: '状态',
    prop: 'status',
    component: 'select' as const,
    placeholder: '请选择状态',
    options: Object.values(REPORT_STATUS_MAP),
  },
]

function resetQuery() {
  Object.assign(queryForm, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    status: '',
  })
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const res = await getReportList(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

async function openDetail(id: string) {
  currentDetail.value = await getReportDetail(id)
  detailVisible.value = true
}

function openPreview() {
  if (!currentDetail.value) return
  previewFiles.value = [currentDetail.value.reportFile]
  previewVisible.value = true
}

loadData()
</script>

<template>
  <PageContainer
    :title="isDemander ? '我的报告' : '报告管理'"
    :subtitle="isDemander ? '查看本企业报告、预览和下载。' : '查看本机构报告状态、附件与抽查记录。'"
  >
    <SearchForm v-model="queryForm" :fields="searchFields" @search="loadData" @reset="resetQuery" />

    <TablePanel title="报告列表">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="reportNo" label="报告编号" min-width="180" />
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="enterpriseName" label="企业名称" min-width="180" />
        <el-table-column prop="projectName" label="项目名称" min-width="220" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="REPORT_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="publishAt" label="发布时间" min-width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openDetail(row.id)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <el-drawer v-model="detailVisible" title="报告详情" size="720px">
      <template v-if="currentDetail">
        <DetailSection title="报告基础信息">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="报告编号">{{ currentDetail.reportNo }}</el-descriptions-item>
            <el-descriptions-item label="订单号">{{ currentDetail.orderNo }}</el-descriptions-item>
            <el-descriptions-item label="企业名称">{{ currentDetail.enterpriseName }}</el-descriptions-item>
            <el-descriptions-item label="项目名称">{{ currentDetail.projectName }}</el-descriptions-item>
            <el-descriptions-item label="发布时间">{{ currentDetail.publishAt }}</el-descriptions-item>
            <el-descriptions-item label="隐藏状态">{{ currentDetail.hidden ? '已隐藏' : '可见' }}</el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="抽查记录" style="margin-top: 16px">
          <OperationTimeline :nodes="currentDetail.extractRecords" />
        </DetailSection>

        <div class="drawer-actions">
          <el-button type="primary" @click="openPreview">预览报告</el-button>
          <el-link :href="currentDetail.reportFile.url" target="_blank" type="primary">下载报告</el-link>
          <PermissionButton
            v-if="!isDemander"
            permission="enterprise:report:handle"
            plain
          >
            上传新版本
          </PermissionButton>
        </div>
      </template>
    </el-drawer>

    <AttachmentPreview v-model:visible="previewVisible" :files="previewFiles" />
  </PageContainer>
</template>

<style scoped>
.drawer-actions {
  margin-top: 20px;
  display: flex;
  gap: 12px;
  align-items: center;
}
</style>
