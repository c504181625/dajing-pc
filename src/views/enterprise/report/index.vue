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
  <PageContainer title="我的报告" subtitle="企业侧报告页建议与订单详情联动，支持预览、下载、作废提醒和评价入口。">
    <TablePanel title="报告列表">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="reportNo" label="报告编号" min-width="180" />
        <el-table-column prop="projectName" label="项目名称" min-width="220" />
        <el-table-column prop="orderNo" label="关联订单" min-width="180" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="REPORT_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="publishAt" label="发布时间" min-width="160" />
        <el-table-column label="操作" width="160">
          <template #default>
            <el-button text type="primary">预览</el-button>
            <el-button text type="primary">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
