<script setup lang="ts">
import { ref } from 'vue'

import { getMonthlyOrderStats } from '@/api/modules/stats'
import PageContainer from '@/components/PageContainer.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import type { MonthlyOrderStatItem } from '@/types/business'

const loading = ref(false)
const tableData = ref<MonthlyOrderStatItem[]>([])

async function loadData() {
  loading.value = true
  try {
    tableData.value = await getMonthlyOrderStats()
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer title="月度订单统计" subtitle="轻量统计页，一期以表格展示月度订单、报告和退款数据。">
    <TablePanel title="月度统计">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="month" label="月份" min-width="120" />
        <el-table-column prop="orderCount" label="订单数" min-width="120" />
        <el-table-column prop="reportCount" label="报告数" min-width="120" />
        <el-table-column prop="refundCount" label="退款数" min-width="120" />
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
