<script setup lang="ts">
import PageContainer from '@/components/PageContainer.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import EmptyBlock from '@/components-business/EmptyBlock/index.vue'
</script>

<template>
  <PageContainer
    title="个人工作台"
    subtitle="个人账号注册后可直接登录，当前 PC 端已为个人主体预留统一入口。"
  >
    <DetailSection title="账号状态">
      <el-alert
        type="success"
        :closable="false"
        show-icon
        title="个人账号已完成注册并可正常登录使用。"
      />
    </DetailSection>

    <DetailSection title="后续能力" style="margin-top: 16px">
      <EmptyBlock
        title="个人业务入口已预留"
        description="后续接入真实个人业务模块后，可在此继续补充我的消息、个人资料与业务办理入口。"
      />
    </DetailSection>
  </PageContainer>
</template>
