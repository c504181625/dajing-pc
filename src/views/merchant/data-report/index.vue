<script setup lang="ts">
import PageContainer from '@/components/PageContainer.vue'
import EmptyBlock from '@/components-business/EmptyBlock/index.vue'
</script>

<template>
  <PageContainer title="数据报告" subtitle="服务提供方可查看、上传、删除本机构的数据报告。">
    <EmptyBlock
      title="数据报告预留中"
      description="当前先补齐角色权限与菜单入口，后续可在此接入报告上传、版本管理和下载留痕。"
    />
  </PageContainer>
</template>
