<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getEnterpriseAuditDetail, getEnterpriseAuditList } from '@/api/modules/enterprise'
import PageContainer from '@/components/PageContainer.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatsPanel from '@/components-business/StatsPanel/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { AUDIT_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { PERMISSION_CODE } from '@/enum/permission'
import { AuditStatus } from '@/enum/status'
import type { EnterpriseAuditDetail, EnterpriseAuditItem, EnterpriseAuditQuery } from '@/types/business'

const router = useRouter()
const loading = ref(false)
const total = ref(0)
const tableData = ref<EnterpriseAuditItem[]>([])
const detailVisible = ref(false)
const currentDetail = ref<EnterpriseAuditDetail | null>(null)

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
  {
    label: '企业名称',
    prop: 'keyword',
    placeholder: '请输入企业名称/统一社会信用代码',
  },
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

const statCards = computed(() => [
  {
    title: '待审核',
    value: tableData.value.filter((item) => item.status === AuditStatus.Pending).length,
  },
  {
    title: '补材料',
    value: tableData.value.filter((item) => item.status === AuditStatus.Supplement).length,
  },
  {
    title: '超时',
    value: tableData.value.filter((item) => !item.reviewerName || item.reviewerName === '未分配').length,
  },
  {
    title: '已通过',
    value: tableData.value.filter((item) => item.status === AuditStatus.Approved).length,
  },
])

const displayStatCards = computed(() => [
  {
    ...statCards.value[0],
    hint: '等待平台首轮审核处理的入驻申请',
  },
  {
    ...statCards.value[1],
    hint: '已退回补充材料，待企业重新提交',
  },
  {
    ...statCards.value[2],
    hint: '当前仍未分配或处理超时的审核任务',
  },
  {
    ...statCards.value[3],
    hint: '已经完成审核并准入的平台机构',
  },
])

async function loadData() {
  loading.value = true
  try {
    const res = await getEnterpriseAuditList(queryForm)
    tableData.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  queryForm.pageNum = 1
  loadData()
}

function handlePageChange() {
  loadData()
}

async function openDetail(id: string) {
  currentDetail.value = await getEnterpriseAuditDetail(id)
  detailVisible.value = true
}

function goAudit(id: string) {
  router.push(`/operator/business/enterprise-audit/${id}`)
}

loadData()
</script>

<template>
  <PageContainer
    title="企业审核管理"
    subtitle="统一承接企业入驻、补件、审核通过和驳回动作，是一期平台运营的重要入口。"
  >
    <StatsPanel :items="displayStatCards" />

    <SearchForm v-model="queryForm" :fields="searchFields" @search="handleSearch" @reset="loadData" />

    <TablePanel
      title="审核任务列表"
      description="支持平台管理员与审核员按状态、服务类型、企业关键字筛选审核任务。"
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <template #toolbar>
        <PermissionButton :permission="PERMISSION_CODE.auditEnterpriseQuery" plain>
          导出列表
        </PermissionButton>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="enterpriseName" label="企业名称" min-width="220" />
        <el-table-column prop="socialCreditCode" label="统一社会信用代码" min-width="190" />
        <el-table-column label="服务类型" min-width="220">
          <template #default="{ row }">
            <el-space wrap>
              <el-tag v-for="item in row.serviceTypes" :key="item" effect="light">
                {{ SERVICE_TYPE_OPTIONS.find((option) => option.value === item)?.label || item }}
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
        <el-table-column label="操作" min-width="160" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-space wrap>
              <el-button text type="primary" @click="openDetail(row.id)">查看详情</el-button>
              <PermissionButton
                :permission="PERMISSION_CODE.auditEnterpriseApprove"
                text
                @click="goAudit(row.id)"
              >
                去审核
              </PermissionButton>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <el-drawer v-model="detailVisible" title="企业详情" size="640px">
      <DetailSection v-if="currentDetail" title="主体信息">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="企业名称">
            {{ currentDetail.enterpriseName }}
          </el-descriptions-item>
          <el-descriptions-item label="统一社会信用代码">
            {{ currentDetail.socialCreditCode }}
          </el-descriptions-item>
          <el-descriptions-item label="企业类型">{{ currentDetail.enterpriseType }}</el-descriptions-item>
          <el-descriptions-item label="联系人">{{ currentDetail.contactName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentDetail.contactPhone }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentDetail.email }}</el-descriptions-item>
          <el-descriptions-item label="地址">{{ currentDetail.address }}</el-descriptions-item>
        </el-descriptions>
      </DetailSection>
    </el-drawer>
  </PageContainer>
</template>

<style scoped lang="scss"></style>
