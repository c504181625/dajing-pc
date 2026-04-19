<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { deleteExpert, getCommunityExpertList } from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import CommunityTabsBar from '@/components-business/CommunityTabsBar/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { ExpertServiceStatus } from '@/enum/content'
import type { DictOption } from '@/types/business'
import type { ExpertOnlineItem, ExpertQuery } from '@/types/content'

const router = useRouter()
const loading = ref(false)
const total = ref(0)
const tableData = ref<ExpertOnlineItem[]>([])

const serviceStatusMap: Record<string, DictOption> = {
  [ExpertServiceStatus.Online]: {
    label: '在线',
    value: ExpertServiceStatus.Online,
    tagType: 'success',
  },
  [ExpertServiceStatus.Busy]: {
    label: '忙碌',
    value: ExpertServiceStatus.Busy,
    tagType: 'warning',
  },
  [ExpertServiceStatus.Offline]: {
    label: '离线',
    value: ExpertServiceStatus.Offline,
    tagType: 'info',
  },
}

const queryForm = reactive<ExpertQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  serviceStatus: '',
})

const searchFields = [
  {
    label: '关键词',
    prop: 'keyword',
    placeholder: '专家姓名 / 所属机构 / 专长领域',
  },
  {
    label: '服务状态',
    prop: 'serviceStatus',
    component: 'select' as const,
    placeholder: '请选择服务状态',
    options: Object.values(serviceStatusMap),
  },
]

async function loadData() {
  loading.value = true
  try {
    const res = await getCommunityExpertList(queryForm)
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

function goDetail(row: ExpertOnlineItem) {
  router.push(`/operator/business/community/experts/detail/${row.id}`)
}

function openCreate() {
  router.push('/operator/business/community/experts/detail/create?mode=create')
}

function openEdit(row: ExpertOnlineItem) {
  router.push(`/operator/business/community/experts/detail/${row.id}?mode=edit`)
}

async function handleDelete(row: ExpertOnlineItem) {
  try {
    await ElMessageBox.confirm(`确认删除专家“${row.name}”吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  const deleted = await deleteExpert(row.id)
  if (!deleted) {
    ElMessage.warning('最新接口未提供专家删除能力，已阻止无效请求')
    return
  }
  ElMessage.success('专家信息已删除')
  await loadData()
}

onMounted(() => {
  void loadData()
})
</script>

<template>
  <PageContainer title="专家在线">
    <CommunityTabsBar current="experts" />
    <SearchForm
      v-model="queryForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="loadData"
    />

    <TablePanel
      title="专家列表"
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <template #toolbar>
        <PermissionButton permission="content:manage:view" @click="openCreate">
          新增专家
        </PermissionButton>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="name" label="专家姓名" width="140" />
        <el-table-column prop="title" label="职称" width="160" />
        <el-table-column prop="organization" label="所属机构" min-width="220" />
        <el-table-column label="专长领域" min-width="220">
          <template #default="{ row }">{{ row.specialties.join(' / ') }}</template>
        </el-table-column>
        <el-table-column label="服务状态" width="120">
          <template #default="{ row }">
            <el-tag :type="serviceStatusMap[row.serviceStatus]?.tagType" effect="light">
              {{ serviceStatusMap[row.serviceStatus]?.label || row.serviceStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" min-width="170" />
        <el-table-column label="操作" min-width="220" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-space wrap>
              <el-button text type="primary" @click="goDetail(row)">查看详情</el-button>
              <PermissionButton permission="content:manage:view" text @click="openEdit(row)">
                编辑
              </PermissionButton>
              <PermissionButton
                permission="content:manage:view"
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
