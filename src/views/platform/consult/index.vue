<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { deleteConsult, getConsultList } from '@/api/modules/consult'
import PageContainer from '@/components/PageContainer.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { CONSULT_STATUS_MAP } from '@/constants/dicts'
import { PERMISSION_CODE } from '@/enum/permission'
import { ConsultStatus } from '@/enum/status'
import type { ConsultItem, ConsultQuery } from '@/types/business'

const router = useRouter()
const loading = ref(false)
const total = ref(0)
const tableData = ref<ConsultItem[]>([])

const queryForm = reactive<ConsultQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
})

const searchFields = [
  {
    label: '关键词',
    prop: 'keyword',
    placeholder: '咨询标题/企业名称/联系人',
  },
  {
    label: '状态',
    prop: 'status',
    component: 'select' as const,
    placeholder: '请选择状态',
    options: Object.values(CONSULT_STATUS_MAP),
  },
]

const consultStats = computed(() => {
  const pending = tableData.value.filter((item) => item.status === ConsultStatus.Pending).length
  const replied = tableData.value.filter((item) => item.status === ConsultStatus.Replied).length
  const closed = tableData.value.filter((item) => item.status === ConsultStatus.Closed).length

  return [
    { key: 'all', label: '全部', value: total.value },
    { key: ConsultStatus.Pending, label: '待回复', value: pending },
    { key: ConsultStatus.Replied, label: '已回复', value: replied },
    { key: ConsultStatus.Closed, label: '已关闭', value: closed },
  ]
})

async function loadData() {
  loading.value = true
  try {
    const res = await getConsultList(queryForm)
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  void loadData()
}

function handlePageChange() {
  void loadData()
}

function openDetail(id: string) {
  router.push(`/operator/business/consult/${id}`)
}

function openHandle(id: string) {
  router.push(`/operator/business/consult/${id}?mode=handle`)
}

async function handleDelete(row: ConsultItem) {
  try {
    await ElMessageBox.confirm(`确认删除咨询“${row.title}”吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  await deleteConsult(row.id)
  ElMessage.success('咨询已删除')
  await loadData()
}

loadData()
</script>

<template>
  <PageContainer title="咨询管理">
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
        <span v-for="item in consultStats" :key="item.key" class="table-stat">
          {{ item.label }}（{{ item.value }}）
        </span>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="咨询标题" min-width="260" />
        <el-table-column prop="enterpriseName" label="企业名称" min-width="180" />
        <el-table-column prop="contactName" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="CONSULT_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="提交时间" min-width="160" />
        <el-table-column label="操作" min-width="220" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-space wrap>
              <el-button text type="primary" @click="openDetail(row.id)">查看详情</el-button>
              <PermissionButton
                :permission="PERMISSION_CODE.operatorConsultHandle"
                text
                @click="openHandle(row.id)"
              >
                处理
              </PermissionButton>
              <PermissionButton
                :permission="PERMISSION_CODE.operatorConsultHandle"
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

<style scoped lang="scss">
.table-stat {
  color: var(--dj-color-text-primary);
  font-size: 16px;
  font-weight: 600;
}
</style>
