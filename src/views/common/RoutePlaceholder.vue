<script setup lang="ts">
import { useRoute } from 'vue-router'

import PageContainer from '@/components/PageContainer.vue'
import EmptyBlock from '@/components-business/EmptyBlock/index.vue'

const route = useRoute()
</script>

<template>
  <PageContainer :title="String(route.meta.title || '建设中页面')">
    <EmptyBlock
      :title="String(route.meta.title || '功能预留')"
      description="当前模块暂未开放。"
    />
  </PageContainer>
</template>
