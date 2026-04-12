<script setup lang="ts">
import { reactive, ref } from 'vue'

import { getDemandDetail, getDemandList } from '@/api/modules/demand'
import PageContainer from '@/components/PageContainer.vue'
import AttachmentPreview from '@/components-business/AttachmentPreview/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import OperationTimeline from '@/components-business/OperationTimeline/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { DEMAND_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import type { AttachmentItem, DemandDetail, DemandItem, DemandQuery } from '@/types/business'

const loading = ref(false)
const detailVisible = ref(false)
const previewVisible = ref(false)
const tableData = ref<DemandItem[]>([])
const currentDetail = ref<DemandDetail | null>(null)
const previewFiles = ref<AttachmentItem[]>([])

const queryForm = reactive<DemandQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  serviceType: '',
})

const searchFields = [
  { label: '关键词', prop: 'keyword', placeholder: '需求标题/企业名称/机构名称' },
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

loadData()
</script>

<template>
  <PageContainer title="需求大厅" subtitle="查看当前企业可跟进的需求项目，统一查看需求说明、附件和处理记录。">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="loadData" @reset="resetQuery" />

    <TablePanel title="需求大厅列表">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="需求标题" min-width="240" />
        <el-table-column prop="enterpriseName" label="需求企业" min-width="180" />
        <el-table-column label="服务类型" width="140">
          <template #default="{ row }">
            {{ SERVICE_TYPE_OPTIONS.find((item) => item.value === row.serviceType)?.label || row.serviceType }}
          </template>
        </el-table-column>
        <el-table-column prop="assignedOrg" label="当前承接机构" min-width="180" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="DEMAND_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="发布时间" min-width="160" />
        <el-table-column label="操作" min-width="120" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-button text type="primary" @click="openDetail(row.id)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <el-drawer v-model="detailVisible" title="需求详情" size="760px">
      <template v-if="currentDetail">
        <DetailSection title="需求内容">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="需求标题">{{ currentDetail.title }}</el-descriptions-item>
            <el-descriptions-item label="需求企业">{{ currentDetail.enterpriseName }}</el-descriptions-item>
            <el-descriptions-item label="联系人">{{ currentDetail.contactName }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ currentDetail.contactPhone }}</el-descriptions-item>
            <el-descriptions-item label="需求说明">{{ currentDetail.content }}</el-descriptions-item>
          </el-descriptions>
        </DetailSection>

        <DetailSection title="附件" style="margin-top: 16px">
          <el-button type="primary" plain @click="openPreview(currentDetail.attachments)">查看附件</el-button>
        </DetailSection>

        <DetailSection title="处理记录" style="margin-top: 16px">
          <OperationTimeline :nodes="currentDetail.replyRecords" />
        </DetailSection>
      </template>
    </el-drawer>

    <AttachmentPreview v-model:visible="previewVisible" :files="previewFiles" />
  </PageContainer>
</template>
