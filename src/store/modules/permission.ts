import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { RouteRecordRaw } from 'vue-router'

import type { CurrentUser, RoleCode } from '@/types/auth'
import { asyncRoutes } from '@/router/routes'

function hasRoleAccess(route: RouteRecordRaw, roles: RoleCode[]) {
  if (!route.meta?.roles?.length) return true
  return route.meta.roles.some((role) => roles.includes(role))
}

function filterAsyncRoutes(routes: RouteRecordRaw[], roles: RoleCode[]) {
  return routes
    .filter((route) => hasRoleAccess(route, roles))
    .map((route) => {
      const current = { ...route }
      if (current.children?.length) {
        current.children = filterAsyncRoutes(current.children, roles)
      }
      return current
    })
}

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const menuRoutes = ref<RouteRecordRaw[]>([])
  const isRoutesGenerated = ref(false)

  function generateRoutes(user: CurrentUser) {
    const accessed = filterAsyncRoutes(asyncRoutes, user.roles)
    routes.value = accessed
    menuRoutes.value = accessed.filter((route) => !route.meta?.hidden)
    isRoutesGenerated.value = true
    return accessed
  }

  function resetRoutes() {
    routes.value = []
    menuRoutes.value = []
    isRoutesGenerated.value = false
  }

  return {
    routes,
    menuRoutes,
    isRoutesGenerated,
    generateRoutes,
    resetRoutes,
  }
})
