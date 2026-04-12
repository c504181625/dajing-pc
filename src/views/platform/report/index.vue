<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { deleteReport, getReportList } from '@/api/modules/report'
import PageContainer from '@/components/PageContainer.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatsPanel from '@/components-business/StatsPanel/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { REPORT_STATUS_MAP } from '@/constants/dicts'
import { PERMISSION_CODE } from '@/enum/permission'
import { ReportStatus } from '@/enum/status'
import type { ReportItem, ReportQuery } from '@/types/business'

const router = useRouter()
const loading = ref(false)
const total = ref(0)
const tableData = ref<ReportItem[]>([])
const queryForm = reactive<ReportQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  sealStatus: '',
})

const searchFields = [
  {
    label: '报告编号/订单号/企业/项目',
    prop: 'keyword',
    placeholder: '报告编号/订单号/企业/项目',
  },
  {
    label: '状态',
    prop: 'status',
    component: 'select' as const,
    placeholder: '状态',
    options: Object.values(REPORT_STATUS_MAP),
  },
  {
    label: '签章状态',
    prop: 'sealStatus',
    component: 'select' as const,
    placeholder: '签章状态',
    options: [
      { label: '待签章', value: 'pending' },
      { label: '已签章', value: 'sealed' },
      { label: '已退回', value: 'rejected' },
    ],
  },
]

const statCards = computed(() => [
  {
    title: '待审核',
    value: tableData.value.filter((item) => item.status === ReportStatus.Pending).length,
  },
  {
    title: '抽查中',
    value: tableData.value.filter((item) => item.status === ReportStatus.Reviewing).length,
  },
  {
    title: '已发布',
    value: tableData.value.filter((item) => item.status === ReportStatus.Published).length,
  },
  {
    title: '已退回',
    value: tableData.value.filter((item) => item.status === ReportStatus.Invalid).length,
  },
])

const displayStatCards = computed(() => [
  {
    ...statCards.value[0],
    hint: '待平台完成审核或签章校验的报告',
  },
  {
    ...statCards.value[1],
    hint: '已进入抽查复核与风控检查阶段',
  },
  {
    ...statCards.value[2],
    hint: '已经发布并允许查看或下载的报告',
  },
  {
    ...statCards.value[3],
    hint: '退回修改或已作废处理的报告记录',
  },
])

async function loadData() {
  loading.value = true
  try {
    const res = await getReportList(queryForm)
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

function goDetail(id: string) {
  router.push(`/operator/business/report/${id}`)
}

async function handleDelete(row: ReportItem) {
  try {
    await ElMessageBox.confirm(`确认删除报告“${row.reportNo}”吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  await deleteReport(row.id)
  ElMessage.success('报告已删除')
  await loadData()
}

loadData()
</script>

<template>
  <PageContainer
    title="报告管理"
    subtitle="报告列表负责检索与状态筛选，作废、隐藏、抽查等复杂动作进入详情页处理。"
  >
    <StatsPanel :items="displayStatCards" />

    <SearchForm v-model="queryForm" :fields="searchFields" @search="handleSearch" @reset="loadData" />

    <TablePanel
      title="报告列表"
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="reportNo" label="报告编号" min-width="180" />
        <el-table-column prop="orderNo" label="订单号" min-width="180" />
        <el-table-column prop="enterpriseName" label="企业名称" min-width="180" />
        <el-table-column prop="projectName" label="项目名称" min-width="220" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="REPORT_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column label="签章状态" width="120">
          <template #default="{ row }">
            <el-tag
              :type="
                row.sealStatus === 'sealed'
                  ? 'success'
                  : row.sealStatus === 'rejected'
                    ? 'danger'
                    : 'warning'
              "
              effect="light"
            >
              {{
                row.sealStatus === 'sealed'
                  ? '已签章'
                  : row.sealStatus === 'rejected'
                    ? '已退回'
                    : '待签章'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishAt" label="发布时间" min-width="160" />
        <el-table-column label="操作" min-width="180" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-space wrap>
              <PermissionButton :permission="PERMISSION_CODE.operatorReportView" text @click="goDetail(row.id)">
                查看详情
              </PermissionButton>
              <PermissionButton
                :permission="PERMISSION_CODE.operatorReportView"
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
  </PageContainer>
</template>

<style scoped lang="scss"></style>
