<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { getEnterpriseAuditDetail, getEnterpriseAuditList } from '@/api/modules/enterprise'
import PageContainer from '@/components/PageContainer.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { AUDIT_STATUS_MAP, SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { PERMISSION_CODE } from '@/enum/permission'
import { AuditStatus } from '@/enum/status'
import type {
  EnterpriseAuditDetail,
  EnterpriseAuditItem,
  EnterpriseAuditQuery,
} from '@/types/business'

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
  enterpriseType: '',
  startDate: '',
  endDate: '',
})

const enterpriseTypeOptions = [
  { label: '检测机构', value: '1' },
  { label: '基础服务机构', value: '2' },
]

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
    prop: 'enterpriseType',
    component: 'select' as const,
    placeholder: '请选择服务类型',
    options: enterpriseTypeOptions,
  },
]

const auditStats = computed(() => {
  const pending = tableData.value.filter((item) => item.status === AuditStatus.Pending).length
  const supplement = tableData.value.filter((item) => item.status === AuditStatus.Supplement).length
  const approved = tableData.value.filter((item) => item.status === AuditStatus.Approved).length

  return [
    { key: 'all', label: '全部', value: total.value },
    { key: AuditStatus.Pending, label: '待审核', value: pending },
    { key: AuditStatus.Supplement, label: '补材料', value: supplement },
    { key: AuditStatus.Approved, label: '已通过', value: approved },
  ]
})

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
  void loadData()
}

function handlePageChange() {
  void loadData()
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
  <PageContainer title="企业/机构审核">
    <SearchForm v-model="queryForm" :fields="searchFields" @search="handleSearch" @reset="loadData" />

    <TablePanel
      title=""
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <template #stats>
        <span v-for="item in auditStats" :key="item.key" class="table-stat">
          {{ item.label }}（{{ item.value }}）
        </span>
      </template>

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

<style scoped lang="scss">
.table-stat {
  color: var(--dj-color-text-primary);
  font-size: 16px;
  font-weight: 500;
}
</style>
