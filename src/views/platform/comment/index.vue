<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

import { deleteComment, getCommentList } from '@/api/modules/comment'
import PageContainer from '@/components/PageContainer.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { COMMENT_STATUS_MAP } from '@/constants/dicts'
import type { CommentItem, CommentQuery } from '@/types/business'

const loading = ref(false)
const tableData = ref<CommentItem[]>([])
const queryForm = reactive<CommentQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  score: '',
})

const searchFields = [
  { label: '关键字', prop: 'keyword', placeholder: '订单号/企业/项目/评价内容' },
  {
    label: '评分',
    prop: 'score',
    component: 'select' as const,
    placeholder: '请选择评分',
    options: ['5', '4', '3', '2', '1'].map((value) => ({ label: `${value} 分`, value })),
  },
]

async function loadData() {
  loading.value = true
  try {
    const res = await getCommentList(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: string) {
  await deleteComment(id)
  ElMessage.success('评价已删除')
  loadData()
}

loadData()
</script>

<template>
  <PageContainer title="评价管理" subtitle="评价页聚焦评分展示、违规评价清理和检索查询，一期不做复杂审核流。">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="loadData" @reset="loadData" />

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
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <PermissionButton permission="report:manage:view" text type="danger" @click="handleDelete(row.id)">
              删除违规评价
            </PermissionButton>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
