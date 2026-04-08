<script setup lang="ts">
import { ref } from 'vue'

import { getReportList } from '@/api/modules/report'
import PageContainer from '@/components/PageContainer.vue'
import StatusTag from '@/components/StatusTag.vue'
import TablePanel from '@/components/TablePanel.vue'
import { REPORT_STATUS_MAP } from '@/constants/dicts'
import type { ReportItem } from '@/types/business'

const loading = ref(false)
const tableData = ref<ReportItem[]>([])

async function loadData() {
  loading.value = true
  try {
    const res = await getReportList()
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer title="报告管理" subtitle="报告页负责报告生成、审核、发布和归档，建议与订单详情中的时间线联动。">
    <TablePanel title="报告列表" description="一期先以报告检索、状态跟踪和文件预览为主，预留二期电子签章与版本管理。">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="reportNo" label="报告编号" min-width="180" />
        <el-table-column prop="enterpriseName" label="需求企业" min-width="180" />
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="projectName" label="项目名称" min-width="220" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="REPORT_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="publishAt" label="发布时间" min-width="160" />
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
