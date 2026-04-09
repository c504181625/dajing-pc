<template>
  <BusinessPageContainer :title="title" :subtitle="subtitle">
    <template #extra>
      <slot name="extra" />
    </template>
    <slot />
  </BusinessPageContainer>
</template>

<script setup lang="ts">
import BusinessPageContainer from '@/components-business/PageContainer/index.vue'

defineProps<{
  title: string
  subtitle?: string
}>()
</script>
