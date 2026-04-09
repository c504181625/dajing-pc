<script setup lang="ts">
import { reactive, ref } from 'vue'

import { getWorkflowNodes } from '@/api/modules/workflow'
import PageContainer from '@/components/PageContainer.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { WORKFLOW_NODE_TYPE_OPTIONS } from '@/constants/dicts'
import type { WorkflowNodeItem, WorkflowQuery } from '@/types/business'

const loading = ref(false)
const tableData = ref<WorkflowNodeItem[]>([])
const queryForm = reactive<WorkflowQuery>({ pageNum: 1, pageSize: 10, keyword: '' })

async function loadData() {
  loading.value = true
  try {
    const res = await getWorkflowNodes(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer title="工作流节点" subtitle="节点列表用于预留审批人类型、排序和业务模板关系。">
    <SearchForm v-model="queryForm" :fields="[{ label: '关键词', prop: 'keyword', placeholder: '模板编码/节点编码/节点名称' }]" @search="loadData" @reset="loadData" />
    <TablePanel title="节点列表">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="templateCode" label="模板编码" min-width="160" />
        <el-table-column prop="nodeCode" label="节点编码" min-width="140" />
        <el-table-column prop="nodeName" label="节点名称" min-width="180" />
        <el-table-column label="节点类型" min-width="120">
          <template #default="{ row }">
            {{ WORKFLOW_NODE_TYPE_OPTIONS.find((item) => item.value === row.nodeType)?.label || row.nodeType }}
          </template>
        </el-table-column>
        <el-table-column prop="approverType" label="审批人类型" min-width="140" />
        <el-table-column prop="sort" label="顺序" width="80" />
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
