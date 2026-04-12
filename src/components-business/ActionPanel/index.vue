<script setup lang="ts">
import DetailSection from '@/components-business/DetailSection/index.vue'

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: '操作区',
    description: '',
  },
)
</script>

<template>
  <DetailSection :title="title" :description="description" class="action-panel-card">
    <div class="action-panel-stack">
      <slot />
    </div>
  </DetailSection>
</template>

<style scoped lang="scss">
.action-panel-card :deep(.el-card__body) {
  background: linear-gradient(180deg, #fcfdff 0%, #f5f8ff 100%);
}

.action-panel-stack {
  display: grid;
  gap: 12px;
}

.action-panel-stack :deep(.action-panel-button) {
  width: 100%;
  height: 42px;
  margin: 0;
  border-radius: 12px;
  justify-content: center;
}

.action-panel-stack :deep(.action-panel-button--soft),
.action-panel-stack :deep(.action-panel-button--soft:hover),
.action-panel-stack :deep(.action-panel-button--soft:focus-visible) {
  border-color: rgb(84 135 255 / 22%);
  background: linear-gradient(180deg, #f8fbff 0%, #edf4ff 100%);
  color: var(--dj-color-primary);
}

.action-panel-stack :deep(.action-panel-button--muted),
.action-panel-stack :deep(.action-panel-button--muted:hover),
.action-panel-stack :deep(.action-panel-button--muted:focus-visible) {
  border-color: rgb(84 135 255 / 18%);
  background: linear-gradient(180deg, #f7faff 0%, #eef4ff 100%);
  color: var(--dj-color-primary);
}

.action-panel-stack :deep(.action-panel-button--danger),
.action-panel-stack :deep(.action-panel-button--danger:hover),
.action-panel-stack :deep(.action-panel-button--danger:focus-visible) {
  border-color: rgb(245 108 108 / 24%);
  background: linear-gradient(180deg, #fff7f7 0%, #fff1f0 100%);
  color: var(--el-color-danger);
}

.action-panel-stack :deep(.action-panel-button--primary),
.action-panel-stack :deep(.action-panel-button--primary:hover),
.action-panel-stack :deep(.action-panel-button--primary:focus-visible) {
  background: linear-gradient(180deg, #5ca2ff 0%, #3f8ff5 100%);
  border-color: transparent;
  color: #fff;
}
</style>
