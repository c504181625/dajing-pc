<script setup lang="ts">
import { computed } from 'vue'
import type { RouteRecordRaw } from 'vue-router'

import { iconMap } from './icons'

const props = defineProps<{
  route: RouteRecordRaw
}>()

const visibleChildren = computed(() =>
  (props.route.children || []).filter((child) => !child.meta?.hidden),
)

const fallbackIconRules: Array<{ keywords: string[]; icon: keyof typeof iconMap }> = [
  { keywords: ['工作台', 'dashboard'], icon: 'Odometer' },
  { keywords: ['用户', 'account', 'user'], icon: 'User' },
  { keywords: ['企业', '机构', 'enterprise'], icon: 'OfficeBuilding' },
  { keywords: ['需求', 'demand'], icon: 'Tickets' },
  { keywords: ['咨询', 'consult'], icon: 'ChatLineSquare' },
  { keywords: ['订单', 'order'], icon: 'List' },
  { keywords: ['报告', 'report'], icon: 'Document' },
  { keywords: ['评价', '评论', 'comment'], icon: 'Comment' },
  { keywords: ['消息', 'message'], icon: 'Bell' },
  { keywords: ['社区', '资讯', '问答', '专家', 'community', 'news', 'qa', 'expert'], icon: 'Reading' },
  { keywords: ['角色', '权限', 'role'], icon: 'Lock' },
  { keywords: ['皮肤', '主题', 'skin', 'theme'], icon: 'Collection' },
  { keywords: ['系统', 'config'], icon: 'Setting' },
]

function resolveFallbackIcon(route: RouteRecordRaw) {
  const title = String(route.meta?.title || '')
  const path = String(route.path || '')
  const name = String(route.name || '')
  const target = `${title} ${path} ${name}`.toLowerCase()
  const matched = fallbackIconRules.find((item) =>
    item.keywords.some((keyword) => target.includes(keyword.toLowerCase())),
  )

  return matched ? iconMap[matched.icon] : iconMap.Document
}

const iconComponent = computed(() => {
  const name = props.route.meta?.icon as keyof typeof iconMap | undefined
  return name ? iconMap[name] : resolveFallbackIcon(props.route)
})

function resolvePath(path: string) {
  if (path.startsWith('/')) return path
  return `${props.route.path}/${path}`.replace(/\/+/g, '/')
}
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
        path: resolvePath(child.path),
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
