<script setup lang="ts">
defineOptions({
  name: 'AppTopbar',
})

import { Bell } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'

import MessageBadge from '@/components/MessageBadge.vue'
import {
  ACCOUNT_TYPE_LABEL_MAP,
  ENTERPRISE_CAPABILITY_LABEL_MAP,
  PLATFORM_ROLE_LABEL_MAP,
} from '@/enum/role'
import { useMessageStore } from '@/store/modules/message'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'

import AppBreadcrumb from './Breadcrumb.vue'
import UserDropdown from './UserDropdown.vue'

const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const messageStore = useMessageStore()

const userIdentityText = computed(() => {
  const user = userStore.userInfo
  if (!user) return ''

  if (userStore.isPlatformUser) {
    return user.platformRole
      ? PLATFORM_ROLE_LABEL_MAP[user.platformRole] || user.platformRole
      : ACCOUNT_TYPE_LABEL_MAP[user.accountType]
  }

  const capabilities = user.enterpriseCapabilities || []
  if (!capabilities.length) return ACCOUNT_TYPE_LABEL_MAP[user.accountType]
  return capabilities.map((item) => ENTERPRISE_CAPABILITY_LABEL_MAP[item] || item).join(' / ')
})

const messagePath = computed(() => {
  const accountType = userStore.userInfo?.accountType
  if (userStore.isPlatformUser) return '/platform/message'
  if (accountType === 'personal') return '/personal/dashboard'
  return '/enterprise/message'
})

watch(
  () => userStore.userInfo?.id,
  async (userId) => {
    if (!userId) {
      messageStore.resetStats()
      return
    }
    await messageStore.refreshStats()
  },
  { immediate: true },
)

function goMessageCenter() {
  router.push(messagePath.value)
}

function handleUserCommand(command: 'profile' | 'logout') {
  if (command === 'profile') {
    const target = userStore.isPlatformUser
      ? '/platform/profile'
      : userStore.userInfo?.accountType === 'personal'
        ? '/personal/profile'
        : '/enterprise/enterprise'
    router.push(target)
    return
  }

  userStore.logout()
  permissionStore.resetRoutes(router)
  messageStore.resetStats()
  ElMessage.success('已退出登录')
  router.replace('/login')
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <AppBreadcrumb />
    </div>

    <div class="topbar-right">
      <button class="message-entry" type="button" @click="goMessageCenter">
        <MessageBadge :value="messageStore.unreadCount">
          <div class="message-icon">
            <el-icon><Bell /></el-icon>
          </div>
        </MessageBadge>
        <div class="message-copy">
          <div class="title">消息中心</div>
          <div class="subtitle">未读 {{ messageStore.unreadCount }}</div>
        </div>
      </button>

      <UserDropdown
        :name="userStore.userInfo?.name"
        :role-name="userIdentityText"
        :enterprise-name="userStore.userInfo?.enterpriseName"
        @command="handleUserCommand"
      />
    </div>
  </header>
</template>

<style scoped lang="scss">
.topbar {
  height: var(--dj-header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 24px;
  background: rgb(255 255 255 / 92%);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgb(15 23 42 / 8%);
}

.topbar-left {
  min-width: 0;
  display: flex;
  align-items: center;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.message-entry {
  min-width: 156px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid rgb(15 23 42 / 8%);
  border-radius: 14px;
  background: #fff;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.message-entry:hover {
  border-color: rgb(31 94 255 / 28%);
  box-shadow: 0 10px 24px rgb(31 94 255 / 8%);
  transform: translateY(-1px);
}

.message-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgb(31 94 255 / 10%);
  color: var(--dj-color-primary);
  font-size: 18px;
}

.message-copy {
  text-align: left;
}

.message-copy .title {
  font-size: 14px;
  font-weight: 600;
  color: var(--dj-color-text-primary);
}

.message-copy .subtitle {
  margin-top: 3px;
  font-size: 12px;
  color: var(--dj-color-text-regular);
}
</style>
