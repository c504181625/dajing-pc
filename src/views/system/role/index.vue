<script setup lang="ts">
import { ref } from 'vue'

import { getRoleList } from '@/api/modules/system'
import PageContainer from '@/components/PageContainer.vue'
import TablePanel from '@/components/TablePanel.vue'

const loading = ref(false)
const tableData = ref<any[]>([])

async function loadData() {
  loading.value = true
  try {
    tableData.value = await getRoleList()
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer title="角色权限管理" subtitle="采用 RBAC + 数据范围组合模型，角色决定菜单和按钮，数据范围决定企业隔离边界。">
    <el-row :gutter="16">
      <el-col :span="10">
        <TablePanel title="角色列表">
          <el-table v-loading="loading" :data="tableData" border>
            <el-table-column prop="name" label="角色名称" min-width="180" />
            <el-table-column prop="code" label="角色编码" min-width="150" />
            <el-table-column prop="dataScope" label="数据范围" min-width="140" />
          </el-table>
        </TablePanel>
      </el-col>
      <el-col :span="14">
        <el-card shadow="never" class="app-card">
          <template #header>
            <span>权限配置建议</span>
          </template>
          <el-alert
            title="菜单权限与按钮权限建议分开维护，按钮权限编码建议按 模块:资源:动作 统一命名。"
            type="info"
            :closable="false"
          />
          <el-tree
            class="tree"
            default-expand-all
            node-key="id"
            :data="[
              { id: 1, label: '平台运营后台', children: [{ id: 11, label: '企业审核管理' }, { id: 12, label: '订单管理' }] },
              { id: 2, label: '系统设置', children: [{ id: 21, label: '角色权限管理' }, { id: 22, label: '流程模板管理' }] },
            ]"
          />
        </el-card>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<style scoped>
.tree {
  margin-top: 20px;
}
</style>
