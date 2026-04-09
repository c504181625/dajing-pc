<script setup lang="ts">
import SectionCard from '../SectionCard/index.vue'

defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <SectionCard :title="title" :description="description">
    <template #extra>
      <slot name="extra" />
    </template>
    <slot />
  </SectionCard>
</template>
