<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, reactive, ref } from 'vue'

import { deleteComment, getCommentList } from '@/api/modules/comment'
import PageContainer from '@/components/PageContainer.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { COMMENT_STATUS_MAP } from '@/constants/dicts'
import { PERMISSION_CODE } from '@/enum/permission'
import type { CommentItem, CommentQuery } from '@/types/business'

const loading = ref(false)
const total = ref(0)
const tableData = ref<CommentItem[]>([])
const detailVisible = ref(false)
const currentDetail = ref<CommentItem | null>(null)

const queryForm = reactive<CommentQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  score: '',
  appealStatus: '',
})

const searchFields = [
  {
    label: '订单/企业/项目/评价内容',
    prop: 'keyword',
    placeholder: '订单/企业/项目/评价内容',
  },
  {
    label: '评分',
    prop: 'score',
    component: 'select' as const,
    placeholder: '评分',
    options: ['5', '4', '3', '2', '1'].map((value) => ({ label: `${value} 星`, value })),
  },
  {
    label: '申诉状态',
    prop: 'appealStatus',
    component: 'select' as const,
    placeholder: '申诉状态',
    options: [
      { label: '未申诉', value: 'none' },
      { label: '待处理', value: 'pending' },
      { label: '处理中', value: 'processing' },
      { label: '已解决', value: 'resolved' },
    ],
  },
]

const commentStats = computed(() => {
  const highScore = tableData.value.filter((item) => item.score >= 4).length
  const appealed = tableData.value.filter((item) => item.appealStatus && item.appealStatus !== 'none').length

  return [
    { key: 'all', label: '全部', value: total.value },
    { key: 'high', label: '高分评价', value: highScore },
    { key: 'appeal', label: '有申诉', value: appealed },
  ]
})

async function loadData() {
  loading.value = true
  try {
    const res = await getCommentList(queryForm)
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

function openDetail(row: CommentItem) {
  currentDetail.value = row
  detailVisible.value = true
}

async function handleDelete(row: CommentItem) {
  try {
    await ElMessageBox.confirm(`确认删除评价“${row.orderNo}”吗？`, '删除确认', { type: 'warning' })
  } catch {
    return
  }
  await deleteComment(row.id)
  ElMessage.success('评价已删除')
  await loadData()
}

loadData()
</script>

<template>
  <PageContainer title="评价管理">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="handleSearch" @reset="loadData" />

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
        <span v-for="item in commentStats" :key="item.key" class="table-stat">
          {{ item.label }}（{{ item.value }}）
        </span>
      </template>

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
        <el-table-column label="操作" min-width="160" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-space wrap>
              <el-button text type="primary" @click="openDetail(row)">查看详情</el-button>
              <PermissionButton
                :permission="PERMISSION_CODE.operatorCommentHandle"
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

    <el-drawer v-model="detailVisible" title="评价详情" size="620px">
      <DetailSection v-if="currentDetail" title="评价概览">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="订单号">{{ currentDetail.orderNo }}</el-descriptions-item>
          <el-descriptions-item label="企业名称">{{ currentDetail.enterpriseName }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">{{ currentDetail.projectName }}</el-descriptions-item>
          <el-descriptions-item label="评分">{{ currentDetail.score }} 星</el-descriptions-item>
          <el-descriptions-item label="评价内容">{{ currentDetail.content }}</el-descriptions-item>
          <el-descriptions-item label="申诉状态">
            {{ currentDetail.appealStatus || 'none' }}
          </el-descriptions-item>
          <el-descriptions-item label="违规标记">
            {{ currentDetail.violated ? '是' : '否' }}
          </el-descriptions-item>
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
