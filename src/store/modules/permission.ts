import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { RouteRecordRaw, Router } from 'vue-router'

import type { CurrentUser } from '@/types/auth'
import { asyncRoutes } from '@/router/routes'

type RouteAccessTarget = Pick<RouteRecordRaw, 'meta'>

function hasAccountTypeAccess(route: RouteAccessTarget, user: CurrentUser) {
  if (!route.meta?.accountTypes?.length) return true
  return route.meta.accountTypes.includes(user.accountType)
}

function hasPlatformRoleAccess(route: RouteAccessTarget, user: CurrentUser) {
  if (!route.meta?.platformRoles?.length) return true
  return !!user.platformRole && route.meta.platformRoles.includes(user.platformRole)
}

function hasCapabilityAccess(route: RouteAccessTarget, user: CurrentUser) {
  if (!route.meta?.enterpriseCapabilities?.length) return true
  const capabilities = user.enterpriseCapabilities || []
  return route.meta.enterpriseCapabilities.some((item) => capabilities.includes(item))
}

function hasPermissionAccess(route: RouteAccessTarget, user: CurrentUser) {
  if (!route.meta?.permissions?.length) return true
  return route.meta.permissions.some(
    (item) => user.permissionCodes.includes(item) || user.permissionCodes.includes('*:*:*'),
  )
}

export function canAccessRoute(route: RouteAccessTarget, user: CurrentUser) {
  return (
    hasAccountTypeAccess(route, user) &&
    hasPlatformRoleAccess(route, user) &&
    hasCapabilityAccess(route, user) &&
    hasPermissionAccess(route, user)
  )
}

function filterAsyncRoutes(routes: RouteRecordRaw[], user: CurrentUser) {
  return routes
    .filter((route) => canAccessRoute(route, user))
    .map((route) => {
      const current: RouteRecordRaw = { ...route }
      if (current.children?.length) {
        current.children = filterAsyncRoutes(current.children, user)
      }
      return current
    })
    .filter((route) => {
      if (route.children && route.children.length === 0 && !route.component && !route.redirect) {
        return false
      }
      return !(route.children && route.children.length === 0 && !route.meta?.hidden && route.name?.toString().endsWith('Group'))
    })
}

export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const menuRoutes = ref<RouteRecordRaw[]>([])
  const isRoutesGenerated = ref(false)
  const mountedRouteNames = ref<string[]>([])

  function generateRoutes(user: CurrentUser) {
    const accessed = filterAsyncRoutes(asyncRoutes, user)
    routes.value = accessed
    menuRoutes.value = accessed.filter((route) => !route.meta?.hidden)
    isRoutesGenerated.value = true
    return accessed
  }

  function syncRoutesToRouter(router: Router, nextRoutes = routes.value) {
    mountedRouteNames.value
      .slice()
      .reverse()
      .forEach((name) => {
        if (router.hasRoute(name)) {
          router.removeRoute(name)
        }
      })

    mountedRouteNames.value = []

    nextRoutes.forEach((route) => {
      if (!route.name) return
      if (router.hasRoute(route.name)) {
        router.removeRoute(route.name)
      }
      router.addRoute(route)
      mountedRouteNames.value.push(route.name.toString())
    })
  }

  function mountRoutes(router: Router, user: CurrentUser) {
    const accessed = generateRoutes(user)
    syncRoutesToRouter(router, accessed)
    return accessed
  }

  function resetRoutes(router?: Router) {
    if (router) {
      mountedRouteNames.value
        .slice()
        .reverse()
        .forEach((name) => {
          if (router.hasRoute(name)) {
            router.removeRoute(name)
          }
        })
    }

    mountedRouteNames.value = []
    routes.value = []
    menuRoutes.value = []
    isRoutesGenerated.value = false
  }

  return {
    routes,
    menuRoutes,
    isRoutesGenerated,
    mountedRouteNames,
    generateRoutes,
    syncRoutesToRouter,
    mountRoutes,
    resetRoutes,
  }
})
