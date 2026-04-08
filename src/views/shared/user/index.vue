<script setup lang="ts">
import { ref } from 'vue'

import { getUserList } from '@/api/modules/user'
import PageContainer from '@/components/PageContainer.vue'
import PermissionButton from '@/components/PermissionButton.vue'
import TablePanel from '@/components/TablePanel.vue'

const loading = ref(false)
const tableData = ref<any[]>([])

async function loadData() {
  loading.value = true
  try {
    tableData.value = await getUserList()
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer title="用户管理" subtitle="统一管理平台账号、企业主账号与子账号，建议与角色权限页联动维护。">
    <TablePanel title="账号列表">
      <template #toolbar>
        <PermissionButton permission="user:manage:view">新增账号</PermissionButton>
      </template>

      <el-table v-loading="loading" :data="tableData" border>
        <el-table-column prop="name" label="姓名" min-width="140" />
        <el-table-column prop="mobile" label="手机号" min-width="140" />
        <el-table-column prop="roleNames" label="角色" min-width="180" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column label="操作" width="180">
          <template #default>
            <el-button text type="primary">编辑</el-button>
            <el-button text type="danger">停用</el-button>
          </template>
        </el-table-column>
      </el-table>
    </TablePanel>
  </PageContainer>
</template>
