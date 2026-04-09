<script setup lang="ts">
import { useRoute } from 'vue-router'

import PageContainer from '@/components/PageContainer.vue'
import EmptyBlock from '@/components-business/EmptyBlock/index.vue'

const route = useRoute()
</script>

<template>
  <PageContainer
    :title="String(route.meta.title || '建设中页面')"
    subtitle="该模块已有菜单、权限和接口位，建议在此基础上继续补充列表、详情和操作流。"
  >
    <EmptyBlock
      :title="String(route.meta.title || '功能预留')"
      description="当前页面暂未进入一期主开发清单，但骨架已预留完成。"
    />
  </PageContainer>
</template>
