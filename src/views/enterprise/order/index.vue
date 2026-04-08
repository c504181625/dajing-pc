<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { getOrderList } from '@/api/modules/order'
import PageContainer from '@/components/PageContainer.vue'
import StatusTag from '@/components/StatusTag.vue'
import TablePanel from '@/components/TablePanel.vue'
import { ORDER_STATUS_MAP } from '@/constants/dicts'
import type { OrderItem } from '@/types/business'

const router = useRouter()
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

function goDetail(id: string) {
  router.push(`/enterprise/order/${id}`)
}

loadData()
</script>

<template>
  <PageContainer title="我的订单" subtitle="企业侧列表只展示当前企业可见订单，详情建议以新页面承载完整流程信息与附件。">
    <TablePanel title="订单列表" description="支持企业查询状态、查看物流样品、下载报告和发起评价。">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="projectName" label="项目名称" min-width="240" />
        <el-table-column prop="orgName" label="服务机构" min-width="180" />
        <el-table-column label="订单状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="ORDER_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">￥{{ row.amount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="goDetail(row.id)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
