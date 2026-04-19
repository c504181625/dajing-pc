<script setup lang="ts">
defineOptions({
  name: 'AppTopbar',
})

import { ArrowLeft, Bell } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

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

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const messageStore = useMessageStore()

const routeDepth = computed(() => route.path.split('/').filter(Boolean).length)
const shouldShowBack = computed(() => routeDepth.value >= 4)

const fallbackPath = computed(() => {
  const candidates = route.matched
    .map((record) => record.path)
    .filter((path) => path && path !== route.path)

  return candidates.at(-1) || '/'
})

const userIdentityText = computed(() => {
  const user = userStore.userInfo
  if (!user) return ''

  if (userStore.isPlatformUser) {
    return user.platformRole
      ? PLATFORM_ROLE_LABEL_MAP[user.platformRole] || user.platformRole
      : ACCOUNT_TYPE_LABEL_MAP[user.accountType]
  }

  const capabilities = user.enterpriseTags || user.enterpriseCapabilities || []
  if (!capabilities.length) return ACCOUNT_TYPE_LABEL_MAP[user.accountType]
  return capabilities.map((item) => ENTERPRISE_CAPABILITY_LABEL_MAP[item] || item).join(' / ')
})

const messagePath = computed(() => {
  const accountType = userStore.userInfo?.accountType
  if (userStore.isPlatformUser) return '/operator/business/message'
  if (accountType === 'personal') return '/personal/message'
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

function handleBack() {
  if (window.history.length > 1) {
    router.back()
    return
  }

  router.push(fallbackPath.value)
}

function handleUserCommand(command: 'profile' | 'logout') {
  if (command === 'profile') {
    const target = userStore.isPlatformUser
      ? '/operator/profile'
      : userStore.userInfo?.accountType === 'personal'
        ? '/personal/profile'
        : '/enterprise/account-settings'
    router.push(target)
    return
  }

  const logoutPath = userStore.isPlatformUser ? '/operator-login' : '/login'

  userStore.logout()
  permissionStore.resetRoutes(router)
  messageStore.resetStats()
  ElMessage.success('已退出登录')
  router.replace(logoutPath)
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <AppBreadcrumb />
    </div>

    <div class="topbar-right">
      <el-button v-if="shouldShowBack" plain class="topbar-back" @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        <span>返回上一级</span>
      </el-button>

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
        :avatar="userStore.userInfo?.avatar"
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
  background: var(--dj-color-header-bg);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid color-mix(in srgb, var(--dj-color-border) 90%, var(--dj-color-primary) 10%);
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

.topbar-back {
  min-width: 148px;
  height: 40px;
  padding: 0 16px;
  border-radius: 14px;
  border-color: color-mix(in srgb, var(--dj-color-primary) 28%, white);
  background: linear-gradient(180deg, #fff 0%, color-mix(in srgb, white 88%, var(--dj-color-primary) 12%) 100%);
  color: var(--dj-color-primary);
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 8px 18px rgb(31 94 255 / 8%);
}

.topbar-back:hover,
.topbar-back:focus-visible {
  border-color: color-mix(in srgb, var(--dj-color-primary) 28%, white);
  background: linear-gradient(180deg, #fff 0%, color-mix(in srgb, white 88%, var(--dj-color-primary) 12%) 100%);
  color: var(--dj-color-primary);
}

.message-entry {
  min-width: 156px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid color-mix(in srgb, var(--dj-color-border) 90%, var(--dj-color-primary) 10%);
  border-radius: 14px;
  background: var(--dj-color-bg-card);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.message-entry:hover {
  border-color: color-mix(in srgb, var(--dj-color-primary) 28%, white);
  box-shadow: 0 10px 24px color-mix(in srgb, var(--dj-color-primary) 8%, transparent);
  transform: translateY(-1px);
}

.message-icon {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--dj-color-primary) 10%, white);
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
