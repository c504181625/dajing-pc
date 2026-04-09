<script setup lang="ts">
import { computed } from 'vue'

import type { DictOption } from '@/types/business'

const props = defineProps<{
  status: string
  map: Record<string, DictOption>
}>()

const current = computed(() => {
  return props.map[props.status] || {
    label: props.status,
    value: props.status,
    tagType: 'info' as const,
  }
})
</script>

<template>
  <el-tag :type="current.tagType || 'info'" effect="light">{{ current.label }}</el-tag>
</template>
