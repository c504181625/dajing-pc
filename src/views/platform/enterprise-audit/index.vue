<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getEnterpriseAuditList } from '@/api/modules/audit'
import PageContainer from '@/components/PageContainer.vue'
import PermissionButton from '@/components/PermissionButton.vue'
import SearchForm from '@/components/SearchForm.vue'
import StatusTag from '@/components/StatusTag.vue'
import TablePanel from '@/components/TablePanel.vue'
import { AUDIT_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import type { EnterpriseAuditItem, EnterpriseAuditQuery } from '@/types/business'

const router = useRouter()
const loading = ref(false)
const tableData = ref<EnterpriseAuditItem[]>([])

const queryForm = reactive<EnterpriseAuditQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  status: '',
  serviceType: '',
  startDate: '',
  endDate: '',
})

const searchFields = [
  { label: '企业名称', prop: 'keyword', placeholder: '请输入企业名称/统一社会信用代码' },
  {
    label: '审核状态',
    prop: 'status',
    component: 'select' as const,
    placeholder: '请选择状态',
    options: Object.values(AUDIT_STATUS_MAP),
  },
  {
    label: '服务类型',
    prop: 'serviceType',
    component: 'select' as const,
    placeholder: '请选择服务类型',
    options: SERVICE_TYPE_OPTIONS,
  },
]

async function loadData() {
  loading.value = true
  try {
    const res = await getEnterpriseAuditList(queryForm)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  loadData()
}

function goDetail(id: string) {
  router.push(`/platform/enterprise-audit/${id}`)
}

loadData()
</script>

<template>
  <PageContainer title="企业审核管理" subtitle="统一承接企业入驻、补件、审核通过和驳回动作，是一期平台运营的首要入口。">
    <template #extra>
      <el-tag type="warning">建议设置待审核 SLA：24 小时内首次处理</el-tag>
    </template>

    <SearchForm v-model="queryForm" :fields="searchFields" @search="handleSearch" @reset="loadData" />

    <TablePanel title="审核任务列表" description="支持平台管理员与审核员按状态、服务类型、企业关键字筛选审核任务。">
      <template #toolbar>
        <PermissionButton permission="audit:enterprise:query" plain>导出列表</PermissionButton>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="enterpriseName" label="企业名称" min-width="220" />
        <el-table-column prop="socialCreditCode" label="统一社会信用代码" min-width="190" />
        <el-table-column label="服务类型" min-width="200">
          <template #default="{ row }">
            <el-space wrap>
              <el-tag v-for="service in row.serviceTypes" :key="service" effect="plain">
                {{ SERVICE_TYPE_OPTIONS.find((item) => item.value === service)?.label || service }}
              </el-tag>
            </el-space>
          </template>
        </el-table-column>
        <el-table-column label="审核状态" width="120">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="AUDIT_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="contactName" label="联系人" width="120" />
        <el-table-column prop="contactPhone" label="联系电话" width="140" />
        <el-table-column prop="submitTime" label="提交时间" min-width="160" />
        <el-table-column prop="reviewerName" label="审核人" width="120" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-space>
              <el-button text type="primary" @click="goDetail(row.id)">查看详情</el-button>
              <PermissionButton permission="audit:enterprise:approve" text @click="goDetail(row.id)">
                去审核
              </PermissionButton>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
