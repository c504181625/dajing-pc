<script setup lang="ts">
import { ElMessage } from 'element-plus'
import type { TreeInstance } from 'element-plus'
import { computed, nextTick, ref, watch } from 'vue'

import { getPermissionTree, getRoleList } from '@/api/modules/system'
import PageContainer from '@/components/PageContainer.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import StatusTag from '@/components-business/StatusTag/index.vue'
import {
  ACCOUNT_TYPE_LABEL_MAP,
  ENTERPRISE_CAPABILITY_LABEL_MAP,
  PLATFORM_ROLE_LABEL_MAP,
} from '@/constants/dicts'
import { ACCOUNT_TYPE, ENTERPRISE_CAPABILITY, PLATFORM_ROLE } from '@/enum/role'
import type { DictOption, PermissionTreeNode, RoleItem } from '@/types/business'

type RoleScope = 'platform' | 'enterprise' | 'personal'

interface RoleTableItem extends RoleItem {
  roleScope: RoleScope
  capabilityTag?: string
  status: 'enabled'
}

const loading = ref(false)
const roleScope = ref<RoleScope>('platform')
const capabilityFilter = ref('')
const keyword = ref('')
const treeKeyword = ref('')
const onlyChecked = ref(false)
const selectedRoleId = ref('')
const expanded = ref(true)
const checkedKeys = ref<string[]>([])
const roleList = ref<RoleTableItem[]>([])
const permissionTree = ref<PermissionTreeNode[]>([])
const treeRef = ref<TreeInstance>()

const roleScopeOptions = [
  { label: '平台运营方', value: 'platform' as const },
  { label: '企业用户', value: 'enterprise' as const },
  { label: '个人用户', value: 'personal' as const },
]

const roleStatusMap: Record<string, DictOption> = {
  enabled: { label: '启用', value: 'enabled', tagType: 'success' },
}

const summaryCards = [
  {
    title: ACCOUNT_TYPE_LABEL_MAP[ACCOUNT_TYPE.platformAdmin],
    tags: [
      PLATFORM_ROLE_LABEL_MAP[PLATFORM_ROLE.superAdmin],
      PLATFORM_ROLE_LABEL_MAP[PLATFORM_ROLE.auditor],
    ],
  },
  {
    title: '企业能力',
    tags: [
      ENTERPRISE_CAPABILITY_LABEL_MAP[ENTERPRISE_CAPABILITY.demander],
      ENTERPRISE_CAPABILITY_LABEL_MAP[ENTERPRISE_CAPABILITY.serviceProvider],
    ],
  },
  {
    title: ACCOUNT_TYPE_LABEL_MAP[ACCOUNT_TYPE.personal],
    tags: ['个人工作台', '个人消息', '个人资料'],
  },
]

const capabilityOptions = [
  { label: '全部能力', value: '' },
  {
    label: ENTERPRISE_CAPABILITY_LABEL_MAP[ENTERPRISE_CAPABILITY.demander],
    value: ENTERPRISE_CAPABILITY.demander,
  },
  {
    label: ENTERPRISE_CAPABILITY_LABEL_MAP[ENTERPRISE_CAPABILITY.serviceProvider],
    value: ENTERPRISE_CAPABILITY.serviceProvider,
  },
]

const dataScopeLabelMap: Record<string, string> = {
  system: '系统级',
  enterprise: '企业级',
  personal: '个人级',
  self: '本人',
  all: '全部',
}

function classifyRole(role: RoleItem): RoleScope {
  const text = `${role.code} ${role.name}`.toLowerCase()
  if (/(platform|admin|audit|super|operator)/.test(text)) return 'platform'
  if (/(enterprise|provider|service|demand)/.test(text)) return 'enterprise'
  return 'personal'
}

function resolveCapability(role: RoleItem) {
  const text = `${role.code} ${role.name}`.toLowerCase()
  if (/(service|provider)/.test(text)) return ENTERPRISE_CAPABILITY.serviceProvider
  if (/(demand|demander)/.test(text)) return ENTERPRISE_CAPABILITY.demander
  return ''
}

function getRoleLeafKeys(tree: PermissionTreeNode[]): string[] {
  return tree.flatMap((item) => (item.children?.length ? getRoleLeafKeys(item.children) : [item.id]))
}

function filterTreeNodes(
  nodes: PermissionTreeNode[],
  activeKeys: Set<string>,
  keywordValue: string,
): PermissionTreeNode[] {
  return nodes
    .map((node) => {
      const children = node.children?.length
        ? filterTreeNodes(node.children, activeKeys, keywordValue)
        : []

      const matchedByKeyword =
        !keywordValue ||
        node.label.toLowerCase().includes(keywordValue) ||
        node.id.toLowerCase().includes(keywordValue)
      const matchedByChecked = !onlyChecked.value || activeKeys.has(node.id) || children.length > 0

      if ((matchedByKeyword && matchedByChecked) || children.length > 0) {
        return {
          ...node,
          children,
        }
      }

      return null
    })
    .filter(Boolean) as PermissionTreeNode[]
}

const filteredRoles = computed(() => {
  const normalizedKeyword = keyword.value.trim().toLowerCase()

  return roleList.value.filter((item) => {
    if (item.roleScope !== roleScope.value) return false
    if (roleScope.value !== 'enterprise' && capabilityFilter.value) return false
    if (roleScope.value === 'enterprise' && capabilityFilter.value && item.capabilityTag !== capabilityFilter.value) {
      return false
    }
    if (!normalizedKeyword) return true
    return `${item.name} ${item.code}`.toLowerCase().includes(normalizedKeyword)
  })
})

const selectedRole = computed(() => filteredRoles.value.find((item) => item.id === selectedRoleId.value) || null)

const visiblePermissionTree = computed(() => {
  const activeKeys = new Set(checkedKeys.value)
  const normalizedKeyword = treeKeyword.value.trim().toLowerCase()
  return filterTreeNodes(permissionTree.value, activeKeys, normalizedKeyword)
})

watch(
  filteredRoles,
  (roles) => {
    if (!roles.length) {
      selectedRoleId.value = ''
      checkedKeys.value = []
      return
    }

    if (!roles.some((item) => item.id === selectedRoleId.value)) {
      selectedRoleId.value = roles[0]!.id
    }
  },
  { immediate: true },
)

watch(
  selectedRole,
  async (role) => {
    checkedKeys.value = role?.permissions ? [...role.permissions] : []
    await nextTick()
    treeRef.value?.setCheckedKeys(checkedKeys.value)
    setExpandState(expanded.value)
  },
  { immediate: true },
)

async function loadData() {
  loading.value = true
  try {
    const [roles, tree] = await Promise.all([getRoleList(), getPermissionTree()])
    roleList.value = roles.map((item) => ({
      ...item,
      roleScope: classifyRole(item),
      capabilityTag: resolveCapability(item),
      status: 'enabled',
    }))
    permissionTree.value = tree
  } finally {
    loading.value = false
  }
}

function handleRoleRowClick(row: RoleTableItem) {
  selectedRoleId.value = row.id
}

function handleTreeCheck() {
  checkedKeys.value = (treeRef.value?.getCheckedKeys(false) || []) as string[]
}

function setExpandState(value: boolean) {
  const nodesMap = (
    treeRef.value as TreeInstance & {
      store?: { nodesMap?: Record<string, { expanded: boolean }> }
    }
  )?.store?.nodesMap

  if (!nodesMap) return
  Object.values(nodesMap).forEach((node) => {
    node.expanded = value
  })
}

function handleSelectAll() {
  checkedKeys.value = getRoleLeafKeys(permissionTree.value)
  nextTick(() => treeRef.value?.setCheckedKeys(checkedKeys.value))
}

function handleClearAll() {
  checkedKeys.value = []
  nextTick(() => treeRef.value?.setCheckedKeys([]))
}

function handleExpandAll() {
  expanded.value = true
  setExpandState(true)
}

function handleCollapseAll() {
  expanded.value = false
  setExpandState(false)
}

function handleSave() {
  if (!selectedRole.value) return
  const target = roleList.value.find((item) => item.id === selectedRole.value?.id)
  if (target) {
    target.permissions = [...checkedKeys.value]
  }
  ElMessage.success('权限配置已保存')
}

function handleCreate() {
  ElMessage.info('当前先保留最小可用入口，后续可继续接入真实新增角色接口。')
}

function handleReset() {
  roleScope.value = 'platform'
  capabilityFilter.value = ''
  keyword.value = ''
  treeKeyword.value = ''
  onlyChecked.value = false
}

function handleExport() {
  const rows = filteredRoles.value.map((item) =>
    [
      item.name,
      item.code,
      dataScopeLabelMap[item.dataScope] || item.dataScope,
      item.permissions.length,
      roleStatusMap[item.status]?.label || '启用',
    ].join(','),
  )
  const csv = ['角色名称,角色编码,数据范围,权限数,状态', ...rows].join('\n')
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = '角色权限导出.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function resolveRoleRowClassName({ row }: { row: RoleTableItem }) {
  return row.id === selectedRoleId.value ? 'is-selected-row' : ''
}

void loadData()
</script>

<template>
  <PageContainer title="角色权限管理">
    <div class="role-page">
      <div class="summary-row">
        <article v-for="item in summaryCards" :key="item.title" class="summary-card">
          <div class="summary-card__title">{{ item.title }}</div>
          <div class="summary-card__tags">
            <el-tag v-for="tag in item.tags" :key="tag" effect="light" round>{{ tag }}</el-tag>
          </div>
        </article>
      </div>

      <SectionCard title="筛选与操作">
        <div class="toolbar-row">
          <el-radio-group v-model="roleScope">
            <el-radio-button
              v-for="item in roleScopeOptions"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>

          <el-select
            v-model="capabilityFilter"
            :disabled="roleScope !== 'enterprise'"
            placeholder="企业能力筛选"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="item in capabilityOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>

          <el-input
            v-model="keyword"
            placeholder="搜索角色名称 / 角色编码"
            clearable
            style="width: 240px"
          />

          <div class="toolbar-row__actions">
            <el-button type="primary" @click="handleCreate">新增角色</el-button>
            <el-button @click="handleExport">导出</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </SectionCard>

      <div class="workspace-grid">
        <SectionCard title="角色列表" class="workspace-panel">
          <div class="table-shell" v-loading="loading">
            <el-table
              :data="filteredRoles"
              border
              highlight-current-row
              height="100%"
              :row-class-name="resolveRoleRowClassName"
              @row-click="handleRoleRowClick"
            >
              <el-table-column prop="name" label="角色名称" min-width="150" />
              <el-table-column prop="code" label="角色编码" min-width="150" />
              <el-table-column label="数据范围" width="110">
                <template #default="{ row }">
                  {{ dataScopeLabelMap[row.dataScope] || row.dataScope }}
                </template>
              </el-table-column>
              <el-table-column label="权限数" width="90">
                <template #default="{ row }">
                  {{ row.permissions.length }}
                </template>
              </el-table-column>
              <el-table-column label="状态" width="90" align="center">
                <template #default="{ row }">
                  <StatusTag :status="row.status" :map="roleStatusMap" />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </SectionCard>

        <SectionCard title="权限配置" class="workspace-panel">
          <div class="permission-shell">
            <div class="permission-header">
              <div>
                <div class="permission-role">{{ selectedRole?.name || '请选择角色' }}</div>
                <div class="permission-meta">
                  数据范围：{{ selectedRole ? dataScopeLabelMap[selectedRole.dataScope] || selectedRole.dataScope : '-' }}
                  <span class="permission-meta__divider">·</span>
                  权限数：{{ checkedKeys.length }}
                </div>
              </div>

              <el-button type="primary" :disabled="!selectedRole" @click="handleSave">
                保存配置
              </el-button>
            </div>

            <div class="permission-toolbar">
              <div class="permission-toolbar__actions">
                <el-button @click="handleSelectAll">全选</el-button>
                <el-button @click="handleClearAll">清空</el-button>
                <el-button @click="handleExpandAll">展开全部</el-button>
                <el-button @click="handleCollapseAll">收起全部</el-button>
                <el-checkbox v-model="onlyChecked">仅看已选</el-checkbox>
              </div>

              <el-input
                v-model="treeKeyword"
                placeholder="搜索权限节点"
                clearable
                style="width: 260px"
              />
            </div>

            <div class="tree-shell">
              <el-tree
                ref="treeRef"
                node-key="id"
                show-checkbox
                default-expand-all
                :data="visiblePermissionTree"
                :props="{ label: 'label', children: 'children' }"
                @check="handleTreeCheck"
              />
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.role-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.summary-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.summary-card {
  padding: 18px 20px;
  border: 1px solid color-mix(in srgb, var(--dj-color-border) 86%, var(--dj-color-primary) 14%);
  border-radius: 18px;
  background: linear-gradient(
    180deg,
    #fff 0%,
    color-mix(in srgb, white 90%, var(--dj-color-primary) 10%) 100%
  );
}

.summary-card__title {
  font-size: 16px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

.summary-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.toolbar-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
}

.toolbar-row__actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(0, 44%) minmax(0, 56%);
  gap: 18px;
  align-items: stretch;
}

.workspace-panel {
  min-height: 720px;
}

:deep(.workspace-panel > .el-card__body) {
  height: calc(100% - 57px);
}

.table-shell,
.permission-shell {
  height: 620px;
}

.table-shell {
  border: 1px solid color-mix(in srgb, var(--dj-color-border) 92%, var(--dj-color-primary) 8%);
  border-radius: 16px;
  overflow: hidden;
}

.permission-shell {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.permission-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 0 2px;
}

.permission-role {
  font-size: 24px;
  font-weight: 800;
  color: var(--dj-color-text-primary);
}

.permission-meta {
  margin-top: 8px;
  font-size: 13px;
  color: var(--dj-color-text-regular);
}

.permission-meta__divider {
  margin: 0 8px;
}

.permission-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.permission-toolbar__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.tree-shell {
  flex: 1;
  min-height: 0;
  padding: 16px 18px;
  border: 1px solid color-mix(in srgb, var(--dj-color-border) 92%, var(--dj-color-primary) 8%);
  border-radius: 16px;
  overflow: auto;
}

:deep(.is-selected-row > td) {
  background: color-mix(in srgb, var(--dj-color-primary) 6%, white) !important;
}

:deep(.el-tree-node__content) {
  min-height: 36px;
  border-radius: 10px;
}

@media (max-width: 1280px) {
  .summary-row,
  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .toolbar-row__actions {
    margin-left: 0;
  }
}
</style>
