<script setup lang="ts">
import { reactive, ref } from 'vue'

import { getWorkflowRecords } from '@/api/modules/workflow'
import PageContainer from '@/components/PageContainer.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import type { WorkflowQuery, WorkflowRecordItem } from '@/types/business'

const loading = ref(false)
const tableData = ref<WorkflowRecordItem[]>([])
const queryForm = reactive<WorkflowQuery>({ pageNum: 1, pageSize: 10, keyword: '' })

async function loadData() {
  loading.value = true
  try {
    const res = await getWorkflowRecords(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer title="工作流审批记录" subtitle="保留业务单号、模板、当前节点和处理人字段，为二期接真实流转记录做准备。">
    <SearchForm v-model="queryForm" :fields="[{ label: '关键词', prop: 'keyword', placeholder: '业务单号/模板名称/当前节点' }]" @search="loadData" @reset="loadData" />
    <TablePanel title="审批记录列表">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="businessNo" label="业务单号" min-width="180" />
        <el-table-column prop="templateName" label="模板名称" min-width="220" />
        <el-table-column prop="currentNodeName" label="当前节点" min-width="160" />
        <el-table-column prop="result" label="处理结果" min-width="120" />
        <el-table-column prop="operator" label="处理人" min-width="120" />
        <el-table-column prop="operatedAt" label="处理时间" min-width="160" />
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
