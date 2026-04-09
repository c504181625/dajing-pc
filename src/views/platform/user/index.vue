<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, reactive, ref } from 'vue'

import { getUserDetail, getUserList, toggleUserStatus } from '@/api/modules/user'
import PageContainer from '@/components/PageContainer.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { ACCOUNT_STATUS_MAP, USER_TYPE_OPTIONS } from '@/constants/dicts'
import { AccountStatus, UserType } from '@/enum/status'
import type { UserDetail, UserItem, UserQuery } from '@/types/business'

const loading = ref(false)
const detailVisible = ref(false)
const currentDetail = ref<UserDetail | null>(null)
const activeTab = ref<UserType | ''>('')
const tableData = ref<UserItem[]>([])

const queryForm = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  userType: '',
  accountStatus: '',
})

const searchFields = computed(() => [
  { label: '关键字', prop: 'keyword', placeholder: '姓名/手机号/企业名称/统一社会信用代码' },
  {
    label: '账号类型',
    prop: 'userType',
    component: 'select' as const,
    placeholder: '请选择账号类型',
    options: USER_TYPE_OPTIONS,
  },
  {
    label: '状态',
    prop: 'accountStatus',
    component: 'select' as const,
    placeholder: '请选择账号状态',
    options: Object.values(ACCOUNT_STATUS_MAP),
  },
])

async function loadData() {
  loading.value = true
  try {
    const params = {
      ...queryForm,
      userType: activeTab.value || queryForm.userType,
    }
    const res = await getUserList(params)
    tableData.value = res.list
  } finally {
    loading.value = false
  }
}

async function openDetail(row: UserItem) {
  currentDetail.value = await getUserDetail(row.id)
  detailVisible.value = true
}

async function handleToggle(row: UserItem) {
  await toggleUserStatus(row.id)
  ElMessage.success(row.status === AccountStatus.Enabled ? '已禁用账号' : '已启用账号')
  loadData()
}

function handleTabChange(value: string | number) {
  activeTab.value = value as UserType | ''
  loadData()
}

loadData()
</script>

<template>
  <PageContainer title="用户管理" subtitle="统一管理个人用户与企业用户账号，支持搜索、查看基本信息及启用/禁用。">
    <el-card shadow="never" class="app-card">
      <el-tabs :model-value="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部账号" name="" />
        <el-tab-pane label="个人用户" :name="UserType.Personal" />
        <el-tab-pane label="企业用户" :name="UserType.Enterprise" />
      </el-tabs>
    </el-card>

    <SearchForm v-model="queryForm" :fields="searchFields" @search="loadData" @reset="loadData" />

    <TablePanel title="账号列表" description="个人用户与企业用户共用一套账号管理逻辑，通过类型和角色区分。">
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="mobile" label="手机号" min-width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="enterpriseName" label="企业名称" min-width="200" />
        <el-table-column prop="socialCreditCode" label="统一社会信用代码" min-width="190" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="ACCOUNT_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最近登录" min-width="160" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" @click="openDetail(row)">查看</el-button>
            <PermissionButton permission="user:manage:view" text @click="handleToggle(row)">
              {{ row.status === AccountStatus.Enabled ? '禁用' : '启用' }}
            </PermissionButton>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <el-drawer v-model="detailVisible" title="用户基本信息" size="520px">
      <DetailSection v-if="currentDetail" title="账号信息">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="姓名">{{ currentDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentDetail.mobile }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentDetail.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="企业名称">{{ currentDetail.enterpriseName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="统一社会信用代码">{{ currentDetail.socialCreditCode || '-' }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ currentDetail.roleNames.join('、') }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{ currentDetail.remark || '-' }}</el-descriptions-item>
        </el-descriptions>
      </DetailSection>
    </el-drawer>
  </PageContainer>
</template>
