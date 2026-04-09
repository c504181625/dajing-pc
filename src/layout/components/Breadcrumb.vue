<script setup lang="ts">
defineOptions({
  name: 'AppBreadcrumb',
})

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const breadcrumbItems = computed(() =>
  route.matched.filter((item) => item.meta?.title && !item.meta?.hidden && item.path !== '/'),
)

function navigate(path?: string) {
  if (!path || path === route.path) return
  router.push(path)
}
</script>

<template>
  <el-breadcrumb separator="/">
    <el-breadcrumb-item
      v-for="item in breadcrumbItems"
      :key="item.path"
      :to="item.path !== route.path ? item.path : undefined"
      @click.prevent="navigate(item.path)"
    >
      {{ item.meta?.title }}
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<style scoped lang="scss">
:deep(.el-breadcrumb__inner) {
  color: var(--dj-color-text-regular);
  font-weight: 400;
}

:deep(.el-breadcrumb__inner.is-link) {
  color: var(--dj-color-text-secondary);
}
</style>
