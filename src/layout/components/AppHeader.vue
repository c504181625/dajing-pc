<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MessageBadge from '@/components/MessageBadge.vue'
import { useUserStore } from '@/store/modules/user'
import { usePermissionStore } from '@/store/modules/permission'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()

const currentTitle = computed(() => route.meta.title || '工作台')
const roleLabel = computed(() => {
  const firstRole = userStore.userInfo?.roles[0] || ''
  const roleMap: Record<string, string> = {
    SUPER_ADMIN: '超级管理员',
    PLATFORM_ADMIN: '平台运营管理员',
    AUDITOR: '审核员',
    ENTERPRISE_DEMAND: '企业需求方',
    ENTERPRISE_SERVICE: '企业服务方',
    ENTERPRISE_LAB: '检测机构',
    ENTERPRISE_STAFF: '企业员工',
  }
  return roleMap[firstRole] || firstRole
})

const topMenu = computed(() => permissionStore.menuRoutes[0]?.meta?.title || '后台管理')

function handleCommand(command: string) {
  if (command === 'logout') {
    userStore.logout()
    permissionStore.resetRoutes()
    router.replace('/login')
  }
}
</script>

<template>
  <header class="app-header">
    <div class="left">
      <div class="page-title">{{ currentTitle }}</div>
      <div class="page-subtitle">{{ topMenu }}</div>
    </div>

    <div class="right">
      <MessageBadge :value="6">
        <el-button text>消息中心</el-button>
      </MessageBadge>

      <div class="identity">
        <strong>{{ userStore.userInfo?.name }}</strong>
        <span>{{ roleLabel }}{{ userStore.userInfo?.enterpriseName ? ` · ${userStore.userInfo.enterpriseName}` : '' }}</span>
      </div>

      <el-dropdown @command="handleCommand">
        <span class="user-entry">
          账户
          <el-icon><ArrowDown /></el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<style scoped lang="scss">
.app-header {
  height: var(--dj-header-height);
  background: #fff;
  border-bottom: 1px solid var(--dj-color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.left {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-title {
  font-size: 18px;
  font-weight: 700;
}

.page-subtitle {
  font-size: 13px;
  color: var(--dj-color-text-regular);
}

.right {
  display: flex;
  align-items: center;
  gap: 18px;
}

.identity {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: right;
}

.identity span {
  font-size: 12px;
  color: var(--dj-color-text-regular);
}

.user-entry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--dj-color-text-primary);
}
</style>
