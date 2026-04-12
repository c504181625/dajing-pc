<template>
  <BusinessPageContainer :show-back="showBack" :list-mode="listMode">
    <slot />
  </BusinessPageContainer>
</template>

<script setup lang="ts">
import BusinessPageContainer from '@/components-business/PageContainer/index.vue'

defineProps<{
  title?: string
  subtitle?: string
  showBack?: boolean
  listMode?: boolean
}>()
</script>
