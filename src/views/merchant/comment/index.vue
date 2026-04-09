<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import { getCommentList } from '@/api/modules/comment'
import PageContainer from '@/components/PageContainer.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { COMMENT_STATUS_MAP } from '@/constants/dicts'
import { useUserStore } from '@/store/modules/user'
import type { CommentItem, CommentQuery } from '@/types/business'

const userStore = useUserStore()
const loading = ref(false)
const tableData = ref<CommentItem[]>([])

const isDemander = computed(() => userStore.hasEnterpriseCapability('demander'))

const queryForm = reactive<CommentQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  score: '',
})

const searchFields = [
  { label: '关键词', prop: 'keyword', placeholder: '订单号/企业/项目/评价内容' },
  {
    label: '评分',
    prop: 'score',
    component: 'select' as const,
    placeholder: '请选择评分',
    options: ['5', '4', '3', '2', '1'].map((value) => ({ label: `${value} 星`, value })),
  },
]

function resetQuery() {
  Object.assign(queryForm, {
    pageNum: 1,
    pageSize: 10,
    keyword: '',
    score: '',
  })
  loadData()
}

async function loadData() {
  loading.value = true
  try {
    const res = await getCommentList(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer
    :title="isDemander ? '我的评价' : '评价查看'"
    :subtitle="isDemander ? '查看本企业已提交评价。' : '查看本机构收到的服务评价。'"
  >
    <SearchForm v-model="queryForm" :fields="searchFields" @search="loadData" @reset="resetQuery" />

    <TablePanel title="评价列表">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="enterpriseName" label="企业名称" min-width="180" />
        <el-table-column prop="projectName" label="项目名称" min-width="220" />
        <el-table-column label="评分" width="120">
          <template #default="{ row }">
            <el-rate :model-value="row.score" disabled />
          </template>
        </el-table-column>
        <el-table-column prop="content" label="评价内容" min-width="260" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="COMMENT_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="评价时间" min-width="160" />
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
