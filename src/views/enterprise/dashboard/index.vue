<script setup lang="ts">
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { enterpriseDashboardMetrics, orderList, reportList } from '@/api/mock'
import PageContainer from '@/components/PageContainer.vue'
import TablePanel from '@/components/TablePanel.vue'

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [
      {
        type: 'pie',
        radius: ['54%', '76%'],
        avoidLabelOverlap: false,
        data: [
          { value: 12, name: '已完成' },
          { value: 8, name: '检测中' },
          { value: 5, name: '待寄样' },
          { value: 3, name: '退款中' },
        ],
      },
    ],
  })
})

onBeforeUnmount(() => {
  chart?.dispose()
  chart = null
})
</script>

<template>
  <PageContainer title="企业工作台" subtitle="企业侧首页聚焦本企业的订单、报告、待办和消息提醒，不暴露任何其他企业数据。">
    <div class="summary-grid">
      <el-card v-for="item in enterpriseDashboardMetrics" :key="item.label" shadow="never" class="summary-card app-card">
        <div class="summary-label">{{ item.label }}</div>
        <div class="summary-value">{{ item.value }}</div>
        <div class="summary-trend">{{ item.trend }}</div>
      </el-card>
    </div>

    <div class="dashboard-grid">
      <TablePanel title="我的订单概览">
        <el-table :data="orderList" border>
          <el-table-column prop="orderNo" label="订单号" min-width="180" />
          <el-table-column prop="projectName" label="项目名称" min-width="220" />
          <el-table-column prop="status" label="状态" width="140" />
          <el-table-column prop="createdAt" label="创建时间" min-width="160" />
        </el-table>
      </TablePanel>

      <el-card shadow="never" class="app-card">
        <template #header>
          <span>订单阶段分布</span>
        </template>
        <div ref="chartRef" class="chart-box" />
      </el-card>
    </div>

    <TablePanel title="最近报告">
      <el-table :data="reportList" border>
        <el-table-column prop="reportNo" label="报告编号" min-width="180" />
        <el-table-column prop="projectName" label="项目名称" min-width="220" />
        <el-table-column prop="status" label="状态" width="140" />
        <el-table-column prop="publishAt" label="发布时间" min-width="160" />
      </el-table>
    </TablePanel>
  </PageContainer>
</template>

<style scoped lang="scss">
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 16px;
}

.summary-trend {
  color: var(--dj-color-text-regular);
}

.chart-box {
  height: 320px;
}
</style>
