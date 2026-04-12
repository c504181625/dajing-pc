<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { acceptOrder, getOrderList, rejectOrder } from '@/api/modules/order'
import PageContainer from '@/components/PageContainer.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { ORDER_STATUS_MAP, PAYMENT_STATUS_MAP, SAMPLE_RECEIVE_STATUS_MAP } from '@/constants/dicts'
import { OrderStatus } from '@/enum/status'
import type { OrderItem } from '@/types/business'

const router = useRouter()
const loading = ref(false)
const total = ref(0)
const tableData = ref<OrderItem[]>([])

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
})

const searchFields = [
  { label: '关键词', prop: 'keyword', placeholder: '订单号 / 企业 / 机构 / 项目名称' },
  {
    label: '订单状态',
    prop: 'status',
    component: 'select' as const,
    placeholder: '请选择订单状态',
    options: Object.values(ORDER_STATUS_MAP),
  },
]

function handleSearch() {
  queryForm.pageNum = 1
  loadData()
}

function handleReset() {
  Object.assign(queryForm, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    status: '',
  })
  loadData()
}

function handlePageChange() {
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const res = await getOrderList(queryForm)
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function goDetail(id: string) {
  router.push(`/enterprise/order/${id}`)
}

function canAccept(row: OrderItem) {
  return [OrderStatus.Quoting, OrderStatus.WaitingPayment, OrderStatus.WaitingSample].includes(row.status)
}

async function handleAccept(row: OrderItem) {
  await acceptOrder(row.id)
  ElMessage.success('订单已接单')
  await loadData()
}

async function handleReject(row: OrderItem) {
  try {
    await ElMessageBox.prompt('请输入暂不接单原因', '拒绝接单', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputPlaceholder: '例如：当前产能已满、项目不匹配等',
    }).then(async ({ value }) => {
      await rejectOrder(row.id, value || '当前阶段暂不接单')
    })
  } catch {
    return
  }

  ElMessage.success('已更新接单结果')
  await loadData()
}

loadData()
</script>

<template>
  <PageContainer title="接单管理" subtitle="服务提供方统一查看可承接订单，并处理接单、拒单与执行跟进。">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="handleSearch" @reset="handleReset" />

    <TablePanel
      title="接单列表"
      description="围绕订单状态、支付状态与收样进度统一管理。"
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="enterpriseName" label="需求企业" min-width="180" />
        <el-table-column prop="projectName" label="项目名称" min-width="220" />
        <el-table-column label="订单状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="ORDER_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column label="支付状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.paymentStatus" :map="PAYMENT_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column label="收样状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.sampleReceiveStatus" :map="SAMPLE_RECEIVE_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="160" />
        <el-table-column label="操作" min-width="180" align="center" header-align="center">
          <template #default="{ row }">
            <el-space wrap>
              <el-button text type="primary" @click="goDetail(row.id)">查看详情</el-button>
              <el-button v-if="canAccept(row)" text type="success" @click="handleAccept(row)">接单</el-button>
              <el-button v-if="canAccept(row)" text type="danger" @click="handleReject(row)">拒绝</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
