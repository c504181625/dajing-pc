<script setup lang="ts">
import { ref } from 'vue'

import { getOrderList } from '@/api/modules/order'
import PageContainer from '@/components/PageContainer.vue'
import StatusTag from '@/components/StatusTag.vue'
import TablePanel from '@/components/TablePanel.vue'
import { ORDER_STATUS_MAP } from '@/constants/dicts'
import type { OrderItem } from '@/types/business'

const loading = ref(false)
const tableData = ref<OrderItem[]>([])

async function loadData() {
  loading.value = true
  try {
    const res = await getOrderList()
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer title="检验检测订单管理" subtitle="订单页应长期作为一期最重的流程页，列表负责筛选监管，详情负责状态闭环与附件追踪。">
    <TablePanel title="订单总览" description="建议后续补充分页、异常预警、退款状态和样品状态维度。">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="enterpriseName" label="需求企业" min-width="180" />
        <el-table-column prop="orgName" label="检测机构" min-width="180" />
        <el-table-column prop="projectName" label="项目名称" min-width="220" />
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">￥{{ row.amount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="ORDER_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="reportNo" label="报告编号" min-width="160" />
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
