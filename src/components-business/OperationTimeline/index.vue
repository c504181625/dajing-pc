<script setup lang="ts">
import { OperationStatus } from '@/enum/status'
import type { OperationTimelineNode } from '@/types/business'

defineProps<{
  nodes: OperationTimelineNode[]
}>()

function resolveType(status: OperationStatus) {
  if (status === OperationStatus.Done) return 'success'
  if (status === OperationStatus.Processing) return 'primary'
  if (status === OperationStatus.Warning) return 'warning'
  return 'info'
}
</script>

<template>
  <el-timeline class="timeline">
    <el-timeline-item
      v-for="node in nodes"
      :key="`${node.title}-${node.time}`"
      :type="resolveType(node.status)"
      :timestamp="node.time || '待处理'"
      placement="top"
    >
      <div class="timeline-card">
        <div class="timeline-title">{{ node.title }}</div>
        <div class="timeline-desc">{{ node.description }}</div>
        <div v-if="node.operator" class="timeline-operator">操作人：{{ node.operator }}</div>
      </div>
    </el-timeline-item>
  </el-timeline>
</template>

<style scoped lang="scss">
.timeline {
  margin-top: 4px;
  width: 100%;
}

.timeline :deep(.el-timeline-item__wrapper),
.timeline :deep(.el-timeline-item__content) {
  min-width: 0;
}

.timeline :deep(.el-timeline-item__timestamp) {
  display: block;
  max-width: 100%;
  white-space: normal;
  word-break: break-word;
}

.timeline-card {
  width: 100%;
  max-width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--dj-color-border);
  border-radius: 14px;
  background: linear-gradient(180deg, #fff 0%, #fbfcff 100%);
  overflow: hidden;
}

.timeline-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
  word-break: break-word;
}

.timeline-desc,
.timeline-operator {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--dj-color-text-regular);
  word-break: break-word;
}
</style>
