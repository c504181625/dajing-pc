<template>
  <el-scrollbar class="app-main-scrollbar">
    <main class="app-main">
      <RouterView />
    </main>
  </el-scrollbar>
</template>

<style scoped lang="scss">
.app-main-scrollbar {
  flex: 1;
  min-height: 0;
}

.app-main {
  min-height: calc(100vh - var(--dj-header-height));
  padding: 24px;
}
</style>
