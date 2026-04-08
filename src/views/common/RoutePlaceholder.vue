<script setup lang="ts">
import { useRoute } from 'vue-router'

import PageContainer from '@/components/PageContainer.vue'

const route = useRoute()
</script>

<template>
  <PageContainer
    :title="String(route.meta.title || '建设中页面')"
    subtitle="该模块已在工程骨架中预留菜单、权限与扩展点，可继续按业务优先级补齐表格、详情与接口。"
  >
    <el-card shadow="never" class="app-card">
      <el-empty description="当前页面作为一期扩展占位，建议在后续迭代中按模块拆分列表、详情与权限按钮。" />
    </el-card>
  </PageContainer>
</template>
