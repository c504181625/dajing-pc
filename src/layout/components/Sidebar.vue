<script setup lang="ts">
defineOptions({
  name: 'AppSidebar',
})

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { usePermissionStore } from '@/store/modules/permission'

import AppMenuItem from './AppMenuItem.vue'

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()

const activePath = computed(() => String(route.meta.activeMenu || route.path))
const openMenus = computed(() =>
  route.matched
    .filter((item) => item.path && item.path !== route.path && !item.meta?.hidden)
    .map((item) => item.path),
)

function handleSelect(index: string) {
  if (index !== route.path) {
    router.push(index)
  }
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <img class="brand-logo" src="/logo.png" alt="质量创新中心" />
      <div class="brand-text">
        <strong>质量创新中心</strong>
      </div>
    </div>

    <el-scrollbar class="sidebar-scrollbar">
      <el-menu
        :default-active="activePath"
        :default-openeds="openMenus"
        class="sidebar-menu"
        @select="handleSelect"
      >
        <AppMenuItem v-for="menu in permissionStore.menuRoutes" :key="menu.path" :route="menu" />
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<style scoped lang="scss">
.sidebar {
  width: var(--dj-sidebar-width);
  height: 100vh;
  flex: 0 0 var(--dj-sidebar-width);
  background:
    var(--dj-theme-page-decoration),
    linear-gradient(180deg, color-mix(in srgb, var(--dj-color-bg-card) 98%, var(--dj-color-primary) 2%) 0%, color-mix(in srgb, var(--dj-color-bg-card) 92%, var(--dj-color-primary) 8%) 100%);
  border-right: 1px solid color-mix(in srgb, var(--dj-color-border) 90%, var(--dj-color-primary) 10%);
  box-shadow: 10px 0 28px rgb(15 23 42 / 5%);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
}

.sidebar-brand {
  min-height: 88px;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 22px 18px;
  border-bottom: 1px solid color-mix(in srgb, var(--dj-color-border) 92%, var(--dj-color-primary) 8%);
}

.brand-logo {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  object-fit: contain;
  border-radius: 12px;
  padding: 6px;
  background: linear-gradient(180deg, #fff 0%, color-mix(in srgb, white 84%, var(--dj-color-primary) 16%) 100%);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dj-color-primary) 14%, white);
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand-text strong {
  color: var(--dj-color-text-primary);
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
}

.brand-text span {
  font-size: 12px;
  color: var(--dj-color-text-regular);
}

.sidebar-scrollbar {
  flex: 1;
  min-height: 0;
}

.sidebar-scrollbar:deep(.el-scrollbar__wrap) {
  overflow-anchor: none;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
  padding: 14px 12px 20px;
  overflow-anchor: none;
}

.sidebar-menu:deep(.el-menu) {
  background: transparent;
  border-right: none;
}

.sidebar-menu:deep(.el-menu--inline) {
  overflow: hidden;
}

.sidebar-menu:deep(.el-sub-menu__title),
.sidebar-menu:deep(.el-menu-item) {
  height: 44px;
  margin-bottom: 6px;
  border-radius: 12px;
  color: var(--dj-color-text-secondary);
  font-size: 14px;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.sidebar-menu:deep(.el-sub-menu__icon-arrow) {
  transition: transform 0.2s ease;
}

.sidebar-menu:deep(.el-sub-menu__title:hover),
.sidebar-menu:deep(.el-menu-item:hover) {
  color: var(--dj-color-primary);
  background: var(--dj-color-menu-hover);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dj-color-primary) 12%, white);
}

.sidebar-menu:deep(.el-sub-menu .el-menu-item) {
  min-width: auto;
  margin: 4px 0;
  padding-left: 48px !important;
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
}

.sidebar-menu:deep(.el-menu-item.is-active) {
  color: var(--dj-color-primary);
  background: var(--dj-color-menu-active);
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--dj-color-primary) 14%, white);
  font-weight: 600;
}

.sidebar-menu:deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  color: var(--dj-color-text-primary);
  background: color-mix(in srgb, var(--dj-color-primary) 4%, white);
}

.sidebar-menu:deep(.el-menu-item .el-icon),
.sidebar-menu:deep(.el-sub-menu__title .el-icon) {
  width: 18px;
  min-width: 18px;
  margin-right: 10px;
  font-size: 17px;
  text-align: center;
}
</style>
