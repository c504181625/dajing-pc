<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

import { deleteQuestion, getQuestionList } from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { COMMUNITY_STATUS_MAP } from '@/constants/dicts'
import type { CommunityQuery, CommunityQuestionItem } from '@/types/business'

const loading = ref(false)
const tableData = ref<CommunityQuestionItem[]>([])
const queryForm = reactive<CommunityQuery>({ pageNum: 1, pageSize: 10, keyword: '' })

async function loadData() {
  loading.value = true
  try {
    const res = await getQuestionList(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: string) {
  await deleteQuestion(id)
  ElMessage.success('提问已删除')
  loadData()
}

loadData()
</script>

<template>
  <PageContainer title="社区提问管理" subtitle="一期先保留问题列表、回答数和基础清理能力。">
    <SearchForm v-model="queryForm" :fields="[{ label: '关键词', prop: 'keyword', placeholder: '问题标题/提问人' }]" @search="loadData" @reset="loadData" />
    <TablePanel title="提问列表">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="提问标题" min-width="260" />
        <el-table-column prop="askerName" label="提问人" width="140" />
        <el-table-column prop="answerCount" label="回答数" width="100" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="COMMUNITY_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="160" />
        <el-table-column label="操作" width="140">
          <template #default="{ row }">
            <PermissionButton permission="content:manage:view" text type="danger" @click="handleDelete(row.id)">删除</PermissionButton>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
