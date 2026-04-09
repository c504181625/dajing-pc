<script setup lang="ts">
import { reactive, ref } from 'vue'

import { getWorkflowTemplates } from '@/api/modules/workflow'
import PageContainer from '@/components/PageContainer.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { WORKFLOW_TEMPLATE_STATUS_MAP } from '@/constants/dicts'
import type { WorkflowQuery, WorkflowTemplateItem } from '@/types/business'

const loading = ref(false)
const tableData = ref<WorkflowTemplateItem[]>([])
const queryForm = reactive<WorkflowQuery>({ pageNum: 1, pageSize: 10, keyword: '' })

async function loadData() {
  loading.value = true
  try {
    const res = await getWorkflowTemplates(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer title="工作流模板" subtitle="一期只做模板列表和字段预留，不做拖拽设计器。">
    <SearchForm v-model="queryForm" :fields="[{ label: '关键词', prop: 'keyword', placeholder: '模板编码/模板名称/业务类型' }]" @search="loadData" @reset="loadData" />
    <TablePanel title="模板列表">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="templateCode" label="模板编码" min-width="160" />
        <el-table-column prop="templateName" label="模板名称" min-width="220" />
        <el-table-column prop="businessType" label="业务类型" min-width="160" />
        <el-table-column prop="version" label="版本" width="100" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="WORKFLOW_TEMPLATE_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" min-width="160" />
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
