<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'

import { deleteArticle, getArticleList } from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { COMMUNITY_STATUS_MAP } from '@/constants/dicts'
import type { CommunityArticleItem, CommunityQuery } from '@/types/business'

const loading = ref(false)
const tableData = ref<CommunityArticleItem[]>([])
const queryForm = reactive<CommunityQuery>({ pageNum: 1, pageSize: 10, keyword: '' })

const searchFields = [{ label: '关键词', prop: 'keyword', placeholder: '文章标题/作者/分类' }]

async function loadData() {
  loading.value = true
  try {
    const res = await getArticleList(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

async function handleDelete(id: string) {
  await deleteArticle(id)
  ElMessage.success('文章已删除')
  loadData()
}

loadData()
</script>

<template>
  <PageContainer title="社区文章管理" subtitle="一期先做文章列表、状态查看和基础删除操作。">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="loadData" @reset="loadData" />
    <TablePanel title="文章列表">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="文章标题" min-width="260" />
        <el-table-column prop="authorName" label="作者" width="140" />
        <el-table-column prop="categoryName" label="分类" width="140" />
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
