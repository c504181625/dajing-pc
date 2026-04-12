<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getOrderList } from '@/api/modules/order'
import PageContainer from '@/components/PageContainer.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { ORDER_STATUS_MAP, SAMPLE_RECEIVE_STATUS_MAP } from '@/constants/dicts'
import type { OrderItem } from '@/types/business'

const router = useRouter()
const loading = ref(false)
const tableData = ref<OrderItem[]>([])

const queryForm = reactive({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
})

const searchFields = [
  { label: '关键词', prop: 'keyword', placeholder: '订单号/项目名称/需求企业' },
  {
    label: '订单状态',
    prop: 'status',
    component: 'select' as const,
    placeholder: '请选择订单状态',
    options: Object.values(ORDER_STATUS_MAP),
  },
]

function resetQuery() {
  Object.assign(queryForm, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    status: '',
  })
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const res = await getOrderList(queryForm)
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
  <PageContainer title="检测进度" subtitle="轻量查看检测订单当前执行阶段，后续可继续扩展成节点化进度面板。">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="loadData" @reset="resetQuery" />

    <TablePanel title="检测进度列表">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="enterpriseName" label="需求企业" min-width="180" />
        <el-table-column prop="projectName" label="检测项目" min-width="220" />
        <el-table-column label="检测阶段" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="ORDER_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column label="收样状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.sampleReceiveStatus" :map="SAMPLE_RECEIVE_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="reportNo" label="关联报告" min-width="160" />
        <el-table-column label="操作" min-width="120" align="center" header-align="center">
          <template #default="{ row }">
            <el-button text type="primary" @click="goDetail(row.id)">查看详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
