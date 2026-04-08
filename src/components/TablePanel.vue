<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <el-card shadow="never" class="app-card">
    <template #header>
      <div class="panel-header">
        <div>
          <div class="title">{{ title }}</div>
          <div v-if="description" class="description">{{ description }}</div>
        </div>
        <div class="toolbar">
          <slot name="toolbar" />
        </div>
      </div>
    </template>

    <slot />
  </el-card>
</template>

<style scoped lang="scss">
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.title {
  font-size: 16px;
  font-weight: 600;
}

.description {
  margin-top: 6px;
  font-size: 13px;
  color: var(--dj-color-text-regular);
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
