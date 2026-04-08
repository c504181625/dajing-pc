<script setup lang="ts">
import * as echarts from 'echarts'
import { onBeforeUnmount, onMounted, ref } from 'vue'

import { dashboardMetrics, orderList } from '@/api/mock'
import PageContainer from '@/components/PageContainer.vue'
import StatusTag from '@/components/StatusTag.vue'
import TablePanel from '@/components/TablePanel.vue'
import { ORDER_STATUS_MAP } from '@/constants/dicts'

const chartRef = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

onMounted(() => {
  if (!chartRef.value) return
  chart = echarts.init(chartRef.value)
  chart.setOption({
    grid: { left: 32, right: 20, top: 20, bottom: 28 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisTick: { show: false },
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
    series: [
      {
        type: 'bar',
        name: '订单量',
        data: [18, 24, 28, 22, 32, 19, 15],
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: '#1f5eff',
        },
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
  <PageContainer title="平台工作台" subtitle="聚合一期平台侧待办、订单概况、风险提示和关键经营指标。">
    <div class="summary-grid">
      <el-card v-for="item in dashboardMetrics" :key="item.label" shadow="never" class="summary-card app-card">
        <div class="summary-label">{{ item.label }}</div>
        <div class="summary-value">{{ item.value }}</div>
        <div class="summary-trend">{{ item.trend }}</div>
      </el-card>
    </div>

    <div class="dashboard-grid">
      <el-card shadow="never" class="app-card">
        <template #header>
          <div class="panel-caption">
            <span>本周订单趋势</span>
            <small>检验检测订单为一期核心监管对象</small>
          </div>
        </template>
        <div ref="chartRef" class="chart-box" />
      </el-card>

      <TablePanel title="重点订单跟踪" description="建议平台运营和审核员在首页快速跟踪高优先级订单。">
        <el-table :data="orderList" border>
          <el-table-column prop="orderNo" label="订单号" min-width="180" />
          <el-table-column prop="enterpriseName" label="需求企业" min-width="180" />
          <el-table-column prop="orgName" label="服务机构" min-width="180" />
          <el-table-column label="订单状态" width="120">
            <template #default="{ row }">
              <StatusTag :status="row.status" :map="ORDER_STATUS_MAP" />
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" min-width="160" />
        </el-table>
      </TablePanel>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 16px;
}

.panel-caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-caption small,
.summary-trend {
  color: var(--dj-color-text-regular);
}

.chart-box {
  height: 320px;
}
</style>
