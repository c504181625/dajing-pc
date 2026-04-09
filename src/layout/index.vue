<script setup lang="ts">
import AppMain from './components/AppMain.vue'
import Sidebar from './components/Sidebar.vue'
import Topbar from './components/Topbar.vue'
</script>

<template>
  <div class="layout-shell">
    <Sidebar />
    <div class="layout-main">
      <Topbar />
      <AppMain />
    </div>
  </div>
</template>

<style scoped lang="scss">
.layout-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgb(31 94 255 / 7%), transparent 28%),
    var(--dj-color-bg-page);
}

.layout-main {
  flex: 1;
  height: 100vh;
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
