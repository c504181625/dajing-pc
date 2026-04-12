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
    radial-gradient(circle at top left, rgb(31 94 255 / 8%), transparent 28%),
    linear-gradient(180deg, #fcfdff 0%, #f6f8fc 100%);
  border-right: 1px solid rgb(15 23 42 / 6%);
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
  border-bottom: 1px solid rgb(15 23 42 / 6%);
}

.brand-logo {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  object-fit: contain;
  border-radius: 12px;
  padding: 6px;
  background: linear-gradient(180deg, #fff 0%, #eef4ff 100%);
  box-shadow: inset 0 0 0 1px rgb(31 94 255 / 10%);
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand-text strong {
  color: #18243d;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
}

.brand-text span {
  font-size: 12px;
  color: #6b7a90;
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
  color: #5b6b84;
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
  color: #1d4ed8;
  background: rgb(31 94 255 / 7%);
  box-shadow: inset 0 0 0 1px rgb(31 94 255 / 10%);
}

.sidebar-menu:deep(.el-sub-menu .el-menu-item) {
  min-width: auto;
  margin: 4px 0;
  padding-left: 48px !important;
  font-size: 13px;
}

.sidebar-menu:deep(.el-menu-item.is-active) {
  color: #1446bf;
  background: linear-gradient(90deg, rgb(31 94 255 / 15%) 0%, rgb(31 94 255 / 5%) 100%);
  box-shadow: inset 0 0 0 1px rgb(31 94 255 / 14%);
}

.sidebar-menu:deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  color: #17326b;
  background: rgb(15 23 42 / 4%);
}

.sidebar-menu:deep(.el-menu-item .el-icon),
.sidebar-menu:deep(.el-sub-menu__title .el-icon) {
  margin-right: 10px;
  font-size: 17px;
}
</style>
