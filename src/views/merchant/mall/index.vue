<script setup lang="ts">
import PageContainer from '@/components/PageContainer.vue'
import EmptyBlock from '@/components-business/EmptyBlock/index.vue'
</script>

<template>
  <PageContainer title="商城管理" subtitle="根据需求清单为 PC 端角色补齐商城管理入口。">
    <EmptyBlock
      title="商城管理预留中"
      description="当前先补齐角色权限与菜单入口，后续可在此接入商品查询、上架维护、规格与类别管理。"
    />
  </PageContainer>
</template>
