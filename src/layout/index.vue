<script setup lang="ts">
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
</script>

<template>
  <div class="layout-shell">
    <AppSidebar />
    <div class="layout-main">
      <AppHeader />
      <el-scrollbar class="layout-scroll">
        <main class="layout-content">
          <RouterView />
        </main>
      </el-scrollbar>
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout-shell {
  display: flex;
  min-height: 100vh;
  background: var(--dj-color-bg-page);
}

.layout-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.layout-scroll {
  flex: 1;
}

.layout-content {
  padding: 20px;
}
</style>
