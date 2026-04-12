<script setup lang="ts">
import { useRouter } from 'vue-router'

import PageContainer from '@/components/PageContainer.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import EmptyBlock from '@/components-business/EmptyBlock/index.vue'

const router = useRouter()
</script>

<template>
  <PageContainer title="个人工作台" subtitle="个人账号可直接发布需求、跟进订单并进入质量社区。">
    <DetailSection title="账号状态">
      <el-alert type="success" :closable="false" show-icon title="个人账号已完成注册，可直接发布需求并跟进服务进度。" />
      <div class="quick-actions">
        <el-button type="primary" @click="router.push('/personal/demand/create')">发布需求</el-button>
        <el-button plain @click="router.push('/personal/demand')">查看我的需求</el-button>
      </div>
    </DetailSection>

    <DetailSection title="后续能力" style="margin-top: 16px">
      <EmptyBlock
        title="个人业务入口已就绪"
        description="可以从“我的需求”“我的订单”以及质量社区继续处理后续业务。"
      />
    </DetailSection>
  </PageContainer>
</template>

<style scoped>
.quick-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
</style>
