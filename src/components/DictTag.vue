<script setup lang="ts">
import { computed } from 'vue'

import type { DictOption } from '@/types/business'

const props = defineProps<{
  value: string
  options: DictOption[]
}>()

const current = computed(() => {
  return props.options.find((item) => item.value === props.value) || {
    label: props.value,
    value: props.value,
    tagType: 'info' as const,
  }
})
</script>

<template>
  <el-tag :type="current.tagType || 'info'" effect="plain">{{ current.label }}</el-tag>
</template>
