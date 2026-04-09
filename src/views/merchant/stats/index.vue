<script setup lang="ts">
import PageContainer from '@/components/PageContainer.vue'
import EmptyBlock from '@/components-business/EmptyBlock/index.vue'
</script>

<template>
  <PageContainer title="报表管理" subtitle="服务提供方可查看月报、数据统计等经营分析能力。">
    <EmptyBlock
      title="报表管理预留中"
      description="当前先补齐角色权限与入口，后续可在此接入月报、订单统计、服务分析等轻量报表。"
    />
  </PageContainer>
</template>
