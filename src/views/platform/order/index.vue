<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { deleteOrder, getOrderDetail, getOrderList } from '@/api/modules/order'
import PageContainer from '@/components/PageContainer.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { ORDER_STATUS_MAP, PAYMENT_STATUS_MAP, SAMPLE_RECEIVE_STATUS_MAP } from '@/constants/dicts'
import { PERMISSION_CODE } from '@/enum/permission'
import { OrderStatus, PaymentStatus, SampleReceiveStatus } from '@/enum/status'
import type { OrderDetail, OrderItem } from '@/types/business'

const router = useRouter()
const loading = ref(false)
const total = ref(0)
const tableData = ref<OrderItem[]>([])
const detailVisible = ref(false)
const currentDetail = ref<OrderDetail | null>(null)

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  paymentStatus: '',
  sampleReceiveStatus: '',
})

const searchFields = [
  {
    label: '订单号/企业/机构',
    prop: 'keyword',
    placeholder: '订单号/企业/机构/项目',
  },
  {
    label: '订单状态',
    prop: 'status',
    component: 'select' as const,
    placeholder: '订单状态',
    options: Object.values(ORDER_STATUS_MAP),
  },
  {
    label: '支付状态',
    prop: 'paymentStatus',
    component: 'select' as const,
    placeholder: '支付状态',
    options: Object.values(PAYMENT_STATUS_MAP),
  },
  {
    label: '样品状态',
    prop: 'sampleReceiveStatus',
    component: 'select' as const,
    placeholder: '样品状态',
    options: Object.values(SAMPLE_RECEIVE_STATUS_MAP),
  },
]

const orderStats = computed(() => {
  const waitingPayment = tableData.value.filter((item) => item.status === OrderStatus.WaitingPayment).length
  const testing = tableData.value.filter((item) => item.status === OrderStatus.Testing).length
  const finished = tableData.value.filter((item) => item.status === OrderStatus.Finished).length

  return [
    { key: 'all', label: '全部', value: total.value },
    { key: OrderStatus.WaitingPayment, label: '待支付', value: waitingPayment },
    { key: OrderStatus.Testing, label: '检测中', value: testing },
    { key: OrderStatus.Finished, label: '已完成', value: finished },
  ]
})

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

function handleSearch() {
  queryForm.pageNum = 1
  loadData()
}

function handlePageChange() {
  loadData()
}

async function openDetail(id: string) {
  currentDetail.value = await getOrderDetail(id)
  detailVisible.value = true
}

function goEdit(id: string) {
  router.push(`/operator/business/order/${id}`)
}

async function handleDelete(row: OrderItem) {
  try {
    await ElMessageBox.confirm(`确认删除订单“${row.orderNo}”吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  await deleteOrder(row.id)
  ElMessage.success('订单已删除')
  await loadData()
  if (currentDetail.value?.id === row.id) {
    detailVisible.value = false
    currentDetail.value = null
  }
}

loadData()
</script>

<template>
  <PageContainer title="订单管理">
    <SearchForm
      v-model="queryForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="loadData"
    />

    <TablePanel
      title=""
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <template #stats>
        <span v-for="item in orderStats" :key="item.key" class="table-stat">
          {{ item.label }}（{{ item.value }}）
        </span>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="enterpriseName" label="需求企业" min-width="180" />
        <el-table-column prop="orgName" label="服务机构" min-width="180" />
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
        <el-table-column label="样品状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.sampleReceiveStatus" :map="SAMPLE_RECEIVE_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额" width="120">
          <template #default="{ row }">￥{{ row.amount.toLocaleString() }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="220" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-space wrap>
              <el-button text type="primary" @click="openDetail(row.id)">查看详情</el-button>
              <PermissionButton
                :permission="PERMISSION_CODE.operatorOrderHandle"
                text
                @click="goEdit(row.id)"
              >
                编辑
              </PermissionButton>
              <PermissionButton
                :permission="PERMISSION_CODE.operatorOrderHandle"
                text
                type="danger"
                @click="handleDelete(row)"
              >
                删除
              </PermissionButton>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <el-drawer v-model="detailVisible" title="订单详情" size="680px">
      <DetailSection v-if="currentDetail" title="基础信息">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单号">{{ currentDetail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="需求企业">{{
            currentDetail.enterpriseName
          }}</el-descriptions-item>
          <el-descriptions-item label="服务机构">{{ currentDetail.orgName }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">{{
            currentDetail.projectName
          }}</el-descriptions-item>
          <el-descriptions-item label="金额"
            >￥{{ currentDetail.amount.toLocaleString() }}</el-descriptions-item
          >
          <el-descriptions-item label="收样地址">{{
            currentDetail.receiverAddress
          }}</el-descriptions-item>
        </el-descriptions>
      </DetailSection>
    </el-drawer>
  </PageContainer>
</template>

<style scoped lang="scss">
.table-stat {
  color: var(--dj-color-text-primary);
  font-size: 16px;
  font-weight: 600;
}
</style>
