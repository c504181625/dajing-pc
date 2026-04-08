<script setup lang="ts">
import { computed } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

import { iconMap } from './icons'

const props = defineProps<{
  route: RouteRecordRaw
}>()

const visibleChildren = computed(() => {
  return (props.route.children || []).filter((child) => !child.meta?.hidden)
})

const iconComponent = computed(() => {
  const name = props.route.meta?.icon as keyof typeof iconMap | undefined
  return name ? iconMap[name] : null
})
</script>

<template>
  <el-sub-menu v-if="visibleChildren.length > 0" :index="route.path">
    <template #title>
      <el-icon v-if="iconComponent">
        <component :is="iconComponent" />
      </el-icon>
      <span>{{ route.meta?.title }}</span>
    </template>

    <AppMenuItem
      v-for="child in visibleChildren"
      :key="child.path"
      :route="{
        ...child,
        path: child.path.startsWith('/') ? child.path : `${route.path}/${child.path}`.replace('//', '/'),
      }"
    />
  </el-sub-menu>

  <el-menu-item v-else :index="route.path">
    <el-icon v-if="iconComponent">
      <component :is="iconComponent" />
    </el-icon>
    <span>{{ route.meta?.title }}</span>
  </el-menu-item>
</template>
