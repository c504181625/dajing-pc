<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getReportList } from '@/api/modules/report'
import PageContainer from '@/components/PageContainer.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { REPORT_STATUS_MAP } from '@/constants/dicts'
import type { ReportItem, ReportQuery } from '@/types/business'

const router = useRouter()
const loading = ref(false)
const tableData = ref<ReportItem[]>([])
const queryForm = reactive<ReportQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
})

const searchFields = [
  { label: '关键字', prop: 'keyword', placeholder: '报告编号/订单号/企业名称/项目名称' },
  {
    label: '状态',
    prop: 'status',
    component: 'select' as const,
    placeholder: '请选择状态',
    options: Object.values(REPORT_STATUS_MAP),
  },
]

async function loadData() {
  loading.value = true
  try {
    const res = await getReportList(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

function goDetail(id: string) {
  router.push(`/platform/report/${id}`)
}

loadData()
</script>

<template>
  <PageContainer title="报告管理" subtitle="报告列表负责检索与状态筛选，作废、隐藏、抽查等复杂动作进入详情页处理。">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="loadData" @reset="loadData" />

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
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="goDetail(row.id)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
