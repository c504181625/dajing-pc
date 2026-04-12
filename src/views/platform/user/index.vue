<script setup lang="ts">
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, reactive, ref } from 'vue'

import {
  deleteUser,
  getUserDetail,
  getUserList,
  toggleUserStatus,
  updateUser,
} from '@/api/modules/user'
import PageContainer from '@/components/PageContainer.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import SearchForm from '@/components-business/SearchForm/index.vue'
import StatsPanel from '@/components-business/StatsPanel/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import { ACCOUNT_STATUS_MAP, USER_TYPE_OPTIONS } from '@/constants/dicts'
import { PERMISSION_CODE } from '@/enum/permission'
import { AccountStatus, UserType } from '@/enum/status'
import type { UserDetail, UserItem, UserQuery } from '@/types/business'

const loading = ref(false)
const detailVisible = ref(false)
const editVisible = ref(false)
const currentDetail = ref<UserDetail | null>(null)
const tableData = ref<UserItem[]>([])
const total = ref(0)

const queryForm = reactive<UserQuery>({
  pageNum: 1,
  pageSize: 10,
  keyword: '',
  userType: '',
  accountStatus: '',
})

const editForm = reactive({
  id: '',
  name: '',
  mobile: '',
  email: '',
  enterpriseName: '',
  remark: '',
})

const searchFields = computed(() => [
  {
    label: '关键词',
    prop: 'keyword',
    placeholder: '姓名/手机号/企业名称/统一社会信用代码',
  },
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

const statCards = computed(() => {
  const personalCount = tableData.value.filter((item) => item.userType === UserType.Personal).length
  const enterpriseCount = tableData.value.filter(
    (item) => item.userType === UserType.Enterprise,
  ).length
  const riskCount = tableData.value.filter((item) => item.riskLabel).length

  return [
    {
      title: '当前列表账号数',
      value: total.value,
      hint: '基于当前筛选条件的结果',
    },
    {
      title: '个人主体',
      value: personalCount,
      hint: '可继续升级为企业账号',
    },
    {
      title: '企业主体',
      value: enterpriseCount,
      hint: '支持多能力标签叠加',
    },
    {
      title: '风险 / 待处理',
      value: riskCount,
      hint: '包含补材、临期与长时间未登录',
    },
  ]
})

async function loadData() {
  loading.value = true
  try {
    const res = await getUserList(queryForm)
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

async function openDetail(row: UserItem) {
  currentDetail.value = await getUserDetail(row.id)
  detailVisible.value = true
}

async function openEdit(row: UserItem) {
  const detail = await getUserDetail(row.id)
  currentDetail.value = detail
  editForm.id = detail.id
  editForm.name = detail.name
  editForm.mobile = detail.mobile
  editForm.email = detail.email || ''
  editForm.enterpriseName = detail.enterpriseName || ''
  editForm.remark = detail.remark || ''
  editVisible.value = true
}

async function handleSave() {
  await updateUser({
    id: editForm.id,
    name: editForm.name,
    mobile: editForm.mobile,
    email: editForm.email,
    enterpriseName: editForm.enterpriseName || undefined,
    remark: editForm.remark || undefined,
  })
  ElMessage.success('账号信息已保存')
  editVisible.value = false
  await loadData()
  if (currentDetail.value?.id === editForm.id) {
    currentDetail.value = await getUserDetail(editForm.id)
  }
}

async function handleToggle(row: UserItem) {
  await toggleUserStatus(row.id)
  ElMessage.success(row.status === AccountStatus.Enabled ? '账号已禁用' : '账号已启用')
  await loadData()
}

async function handleDelete(row: UserItem) {
  try {
    await ElMessageBox.confirm(`确认删除账号“${row.name}”吗？`, '删除确认', {
      type: 'warning',
    })
  } catch {
    return
  }

  await deleteUser(row.id)
  ElMessage.success('账号已删除')
  await loadData()
  if (currentDetail.value?.id === row.id) {
    detailVisible.value = false
    currentDetail.value = null
  }
}

loadData()
</script>

<template>
  <PageContainer
    title="用户管理"
    subtitle="把个人、企业与复合身份账号放进统一队列里，集中处理查看、编辑、状态调整与删除。"
  >
    <StatsPanel :items="statCards" />

    <SearchForm
      v-model="queryForm"
      :fields="searchFields"
      @search="handleSearch"
      @reset="loadData"
    />

    <TablePanel
      title="账号列表"
      description="统一查看账号主体、企业标签、认证状态与风险信息。"
      :total="total"
      :page-num="queryForm.pageNum"
      :page-size="queryForm.pageSize"
      @update:page-num="queryForm.pageNum = $event"
      @update:page-size="queryForm.pageSize = $event"
      @pageChange="handlePageChange"
    >
      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="name" label="姓名 / 账号" min-width="140" />
        <el-table-column label="主体与当前身份" min-width="180">
          <template #default="{ row }">
            <div class="identity-cell">
              <div>{{ row.userType === UserType.Personal ? '个人用户' : '企业用户' }}</div>
              <!-- <div class="identity-sub">{{ row.currentIdentity || '-' }}</div> -->
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="mobile" label="手机号" min-width="140" />
        <el-table-column prop="enterpriseName" label="企业名称" min-width="220" />
        <el-table-column label="企业能力标签" min-width="170">
          <template #default="{ row }">
            <el-space wrap>
              <el-tag
                v-for="item in row.enterpriseCapabilities || []"
                :key="item"
                effect="light"
                type="primary"
              >
                {{ item === 'demander' ? '需求发布方' : '服务提供方' }}
              </el-tag>
              <span v-if="!(row.enterpriseCapabilities || []).length">-</span>
            </el-space>
          </template>
        </el-table-column>
        <el-table-column label="认证状态" width="120">
          <template #default="{ row }">
            <el-tag
              :type="
                row.certificationStatus === 'approved'
                  ? 'success'
                  : row.certificationStatus === 'reviewing'
                    ? 'warning'
                    : row.certificationStatus === 'rejected'
                      ? 'danger'
                      : 'info'
              "
              effect="light"
            >
              {{
                row.certificationStatus === 'approved'
                  ? '已认证'
                  : row.certificationStatus === 'reviewing'
                    ? '审核中'
                    : row.certificationStatus === 'rejected'
                      ? '已驳回'
                      : '未开始'
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusTag :status="row.status" :map="ACCOUNT_STATUS_MAP" />
          </template>
        </el-table-column>
        <el-table-column prop="lastLoginTime" label="最近登录" min-width="160" />
        <el-table-column label="操作" min-width="220" fixed="right" align="center" header-align="center">
          <template #default="{ row }">
            <el-space wrap>
              <el-button text type="primary" @click="openDetail(row)">查看</el-button>
              <PermissionButton
                :permission="PERMISSION_CODE.operatorUserEdit"
                text
                @click="openEdit(row)"
              >
                编辑
              </PermissionButton>
              <PermissionButton
                :permission="PERMISSION_CODE.operatorUserEdit"
                text
                @click="handleToggle(row)"
              >
                {{ row.status === AccountStatus.Enabled ? '禁用' : '启用' }}
              </PermissionButton>
              <PermissionButton
                :permission="PERMISSION_CODE.operatorUserEdit"
                text
                type="danger"
                @click="handleDelete(row)"
              >
                删除
              </PermissionButton>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>

    <el-drawer v-model="detailVisible" title="账号详情" size="560px">
      <DetailSection v-if="currentDetail" title="基础信息">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="姓名">{{ currentDetail.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentDetail.mobile }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentDetail.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="企业名称">
            {{ currentDetail.enterpriseName || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="统一社会信用代码">
            {{ currentDetail.socialCreditCode || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="角色">{{
            currentDetail.roleNames.join(' / ')
          }}</el-descriptions-item>
          <el-descriptions-item label="备注">{{
            currentDetail.remark || '-'
          }}</el-descriptions-item>
        </el-descriptions>
      </DetailSection>
    </el-drawer>

    <el-dialog v-model="editVisible" title="编辑账号" width="540px">
      <el-form label-width="92px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.mobile" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="editForm.email" />
        </el-form-item>
        <el-form-item label="企业名称">
          <el-input v-model="editForm.enterpriseName" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="editForm.remark" type="textarea" :rows="4" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<style scoped lang="scss">

.identity-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.identity-sub {
  color: var(--dj-color-text-secondary);
}
</style>
