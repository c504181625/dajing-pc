<script setup lang="ts">
import { ref } from 'vue'

import { getDemandList } from '@/api/modules/demand'
import PageContainer from '@/components/PageContainer.vue'
import StatusTag from '@/components/StatusTag.vue'
import TablePanel from '@/components/TablePanel.vue'
import { DEMAND_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import type { DemandItem } from '@/types/business'

const loading = ref(false)
const tableData = ref<DemandItem[]>([])

async function loadData() {
  loading.value = true
  try {
    const res = await getDemandList()
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer title="需求管理" subtitle="基础服务需求按表单驱动，检验检测需求按订单驱动，一期建议统一从需求池受理与分配。">
    <TablePanel title="需求池" description="支持平台分配机构和企业自主选择机构两种并存模式。">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="title" label="需求标题" min-width="240" />
        <el-table-column label="服务类型" width="120">
          <template #default="{ row }">
            {{ SERVICE_TYPE_OPTIONS.find((item) => item.value === row.serviceType)?.label || row.serviceType }}
          </template>
        </el-table-column>
        <el-table-column prop="enterpriseName" label="需求企业" min-width="180" />
        <el-table-column label="对接模式" width="140">
          <template #default="{ row }">
            {{ row.publishMode === 'PLATFORM_ASSIGN' ? '平台分配' : '自主选择机构' }}
          </template>
        </el-table-column>
        <el-table-column prop="assignedOrg" label="当前机构" min-width="180" />
        <el-table-column label="状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="DEMAND_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="160" />
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
