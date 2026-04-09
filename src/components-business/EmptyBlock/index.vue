<script setup lang="ts">
import { Box } from '@element-plus/icons-vue'

withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: '暂无数据',
    description: '当前没有可展示内容，请稍后重试或调整筛选条件。',
  },
)
</script>

<template>
  <div class="empty-block">
    <div class="icon">
      <el-icon><Box /></el-icon>
    </div>
    <div class="title">{{ title }}</div>
    <div class="description">{{ description }}</div>
    <div v-if="$slots.default" class="actions">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.empty-block {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 16px;
  background:
    linear-gradient(180deg, rgb(248 250 255 / 100%) 0%, rgb(255 255 255 / 100%) 100%);
}

.icon {
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: rgb(31 94 255 / 8%);
  color: var(--dj-color-primary);
  font-size: 24px;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: var(--dj-color-text-primary);
}

.description {
  max-width: 420px;
  text-align: center;
  font-size: 13px;
  line-height: 1.7;
  color: var(--dj-color-text-regular);
}

.actions {
  margin-top: 4px;
}
</style>
