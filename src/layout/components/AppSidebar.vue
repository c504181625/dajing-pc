<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { usePermissionStore } from '@/store/modules/permission'

const route = useRoute()
const router = useRouter()
const permissionStore = usePermissionStore()

const activePath = computed(() => route.meta.activeMenu || route.path)

function handleSelect(index: string) {
  router.push(index)
}
</script>

<template>
  <aside class="app-sidebar">
    <div class="brand">
      <div class="brand-mark">QI</div>
      <div class="brand-text">
        <strong>质量创新中心</strong>
        <span>一期后台平台</span>
      </div>
    </div>

    <el-scrollbar class="menu-scroll">
      <el-menu
        :default-active="activePath"
        class="menu"
        background-color="#0f1b2d"
        text-color="#c7d2e5"
        active-text-color="#ffffff"
        unique-opened
        @select="handleSelect"
      >
        <AppMenuItem v-for="menu in permissionStore.menuRoutes" :key="menu.path" :route="menu" />
      </el-menu>
    </el-scrollbar>
  </aside>
</template>

<style scoped lang="scss">
.app-sidebar {
  width: var(--dj-sidebar-width);
  height: 100vh;
  background: linear-gradient(180deg, #0f1b2d 0%, #132440 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 18px 20px;
  border-bottom: 1px solid rgb(255 255 255 / 8%);
}

.brand-mark {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #1f5eff 0%, #38a3ff 100%);
  font-weight: 700;
}

.brand-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand-text strong {
  font-size: 15px;
}

.brand-text span {
  font-size: 12px;
  color: rgb(255 255 255 / 72%);
}

.menu-scroll {
  flex: 1;
}

.menu {
  border-right: none;
}
</style>
