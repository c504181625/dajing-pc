<script setup lang="ts">
import type { OrderTimelineNode } from '@/types/business'

defineProps<{
  nodes: OrderTimelineNode[]
}>()
</script>

<template>
  <el-timeline>
    <el-timeline-item
      v-for="node in nodes"
      :key="`${node.title}-${node.time}`"
      :type="node.status === 'done' ? 'success' : node.status === 'processing' ? 'primary' : 'info'"
      :timestamp="node.time || '待处理'"
      placement="top"
    >
      <div class="timeline-title">{{ node.title }}</div>
      <div class="timeline-desc">{{ node.description }}</div>
    </el-timeline-item>
  </el-timeline>
</template>

<style scoped lang="scss">
.timeline-title {
  font-weight: 600;
}

.timeline-desc {
  margin-top: 6px;
  font-size: 13px;
  color: var(--dj-color-text-regular);
}
</style>
