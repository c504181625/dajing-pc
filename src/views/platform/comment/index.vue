<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, reactive, ref } from 'vue'

import { deleteComment, getCommentList } from '@/api/modules/comment'
import PageContainer from '@/components/PageContainer.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatsPanel from '@/components-business/StatsPanel/index.vue'
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

const statCards = computed(() => [
  { title: '五星', value: tableData.value.filter((item) => item.score === 5).length },
  { title: '低分', value: tableData.value.filter((item) => item.score <= 2).length },
  { title: '待申诉', value: tableData.value.filter((item) => item.appealStatus === 'pending').length },
  { title: '违规', value: tableData.value.filter((item) => item.violated).length },
])

const displayStatCards = computed(() => [
  {
    ...statCards.value[0],
    hint: '高分好评与优质服务体验的集中反馈',
  },
  {
    ...statCards.value[1],
    hint: '低分评价与重点质量风险反馈记录',
  },
  {
    ...statCards.value[2],
    hint: '等待平台介入处理的申诉评价',
  },
  {
    ...statCards.value[3],
    hint: '已标记违规或需要重点复核的评价',
  },
])

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
  <PageContainer
    title="评价管理"
    subtitle="围绕评分、申诉与违规处理统一管理评价记录，详情采用右侧滑出查看。"
  >
    <StatsPanel :items="displayStatCards" />

    <SearchForm v-model="queryForm" :fields="searchFields" @search="handleSearch" @reset="loadData" />

    <TablePanel
      title="评价列表"
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
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

<style scoped lang="scss"></style>
