<script setup lang="ts">
import { computed, ref } from 'vue'

import { getPermissionTree, getRoleList } from '@/api/modules/system'
import PageContainer from '@/components/PageContainer.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import TablePanel from '@/components-business/TablePanel/index.vue'
import {
  ACCOUNT_TYPE_LABEL_MAP,
  ENTERPRISE_CAPABILITY_LABEL_MAP,
  PLATFORM_ROLE_LABEL_MAP,
} from '@/constants/dicts'
import { ACCOUNT_TYPE, ENTERPRISE_CAPABILITY, PLATFORM_ROLE } from '@/enum/role'
import type { PermissionTreeNode, RoleItem } from '@/types/business'

const loading = ref(false)
const roleList = ref<RoleItem[]>([])
const permissionTree = ref<PermissionTreeNode[]>([])

const accountModels = computed(() => [
  {
    key: ACCOUNT_TYPE.platformAdmin,
    title: ACCOUNT_TYPE_LABEL_MAP[ACCOUNT_TYPE.platformAdmin],
    desc: '平台运营方 / 超级管理员 / 审核员统一归入平台主体，菜单与高危操作再由 platformRole + permissionCodes 控制。',
  },
  {
    key: ACCOUNT_TYPE.enterprise,
    title: ACCOUNT_TYPE_LABEL_MAP[ACCOUNT_TYPE.enterprise],
    desc: '企业只作为一个账号主体存在，不再拆成互斥角色，实际业务能力由 enterpriseCapabilities 组合表达。',
  },
  {
    key: ACCOUNT_TYPE.personal,
    title: ACCOUNT_TYPE_LABEL_MAP[ACCOUNT_TYPE.personal],
    desc: '一期 PC 端仅预留结构，后续可与前台或移动端账号体系打通。',
  },
])

const capabilityModels = computed(() => [
  ENTERPRISE_CAPABILITY.demander,
  ENTERPRISE_CAPABILITY.serviceProvider,
  ENTERPRISE_CAPABILITY.provider,
].map((item) => ({
  key: item,
  title: ENTERPRISE_CAPABILITY_LABEL_MAP[item],
})))

const platformRoleModels = computed(() => [
  PLATFORM_ROLE.superAdmin,
  PLATFORM_ROLE.platformAdmin,
  PLATFORM_ROLE.auditor,
].map((item) => ({
  key: item,
  title: PLATFORM_ROLE_LABEL_MAP[item],
})))

async function loadData() {
  loading.value = true
  try {
    const [roles, tree] = await Promise.all([getRoleList(), getPermissionTree()])
    roleList.value = roles
    permissionTree.value = tree
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer title="角色权限管理" subtitle="当前按账号主体、企业业务身份和平台内部角色三层建模，便于后续接入真实权限接口。">
    <el-row :gutter="16">
      <el-col :span="12">
        <SectionCard title="账号主体模型" description="入口域先按 accountType 划分，再叠加内部角色与能力。">
          <div class="model-list">
            <div v-for="item in accountModels" :key="item.key" class="model-item">
              <div class="model-title">{{ item.title }}</div>
              <div class="model-desc">{{ item.desc }}</div>
            </div>
          </div>
        </SectionCard>
      </el-col>
      <el-col :span="6">
        <SectionCard title="企业能力" description="企业可同时具备多个业务身份。">
          <div class="tag-list">
            <el-tag v-for="item in capabilityModels" :key="item.key" effect="light" size="large">
              {{ item.title }}
            </el-tag>
          </div>
        </SectionCard>
      </el-col>
      <el-col :span="6">
        <SectionCard title="平台角色" description="平台主体下仍可细分内部角色。">
          <div class="tag-list">
            <el-tag v-for="item in platformRoleModels" :key="item.key" type="warning" effect="light" size="large">
              {{ item.title }}
            </el-tag>
          </div>
        </SectionCard>
      </el-col>
    </el-row>

    <el-row :gutter="16">
      <el-col :span="10">
        <TablePanel title="角色列表示例">
          <el-table v-loading="loading" :data="roleList" border>
            <el-table-column prop="name" label="角色名称" min-width="180" />
            <el-table-column prop="code" label="角色编码" min-width="180" />
            <el-table-column prop="dataScope" label="数据范围" min-width="120" />
            <el-table-column label="权限数" width="90">
              <template #default="{ row }">{{ row.permissions.length }}</template>
            </el-table-column>
          </el-table>
        </TablePanel>
      </el-col>
      <el-col :span="14">
        <DetailSection title="权限树" description="菜单权限和按钮权限统一展示，dataScope 仍由后端最终下发，前端只做显示与交互控制。">
          <el-tree
            default-expand-all
            node-key="id"
            show-checkbox
            :data="permissionTree"
            :props="{ label: 'label', children: 'children' }"
          />
        </DetailSection>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<style scoped lang="scss">
.model-list {
  display: grid;
  gap: 12px;
}

.model-item {
  padding: 14px 16px;
  border: 1px solid var(--dj-color-border);
  border-radius: 14px;
  background: #fff;
}

.model-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

.model-desc {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--dj-color-text-regular);
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
