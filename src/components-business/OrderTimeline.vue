<script setup lang="ts">
import type { OperationTimelineNode } from '@/types/business'
import OperationTimeline from './OperationTimeline/index.vue'

defineProps<{
  nodes: OperationTimelineNode[]
}>()
</script>

<template>
  <OperationTimeline :nodes="nodes" />
</template>
