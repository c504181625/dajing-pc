<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

import { deleteExpert, getExpertList } from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { ACCOUNT_STATUS_MAP } from '@/constants/dicts'
import type { CommunityQuery, ExpertItem } from '@/types/business'

const loading = ref(false)
const tableData = ref<ExpertItem[]>([])
const queryForm = reactive<CommunityQuery>({ pageNum: 1, pageSize: 10, keyword: '' })

async function loadData() {
  loading.value = true
  try {
    const res = await getExpertList(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: string) {
  await deleteExpert(id)
  ElMessage.success('专家信息已删除')
  loadData()
}

loadData()
</script>

<template>
  <PageContainer title="专家信息管理" subtitle="维护专家基本信息、机构归属和专长标签。">
    <SearchForm v-model="queryForm" :fields="[{ label: '关键词', prop: 'keyword', placeholder: '专家姓名/机构' }]" @search="loadData" @reset="loadData" />
    <TablePanel title="专家列表">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="name" label="专家姓名" width="120" />
        <el-table-column prop="title" label="职称" width="140" />
        <el-table-column prop="organization" label="所属机构" min-width="220" />
        <el-table-column label="专长领域" min-width="220">
          <template #default="{ row }">{{ row.specialties.join(' / ') }}</template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="ACCOUNT_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" min-width="160" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <PermissionButton permission="content:manage:view" text type="danger" @click="handleDelete(row.id)">删除</PermissionButton>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
