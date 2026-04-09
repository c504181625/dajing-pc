import NProgress from 'nprogress'
import type { Router } from 'vue-router'

import { canAccessRoute, usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
import { getAccessToken } from '@/utils/auth'

const whiteList = [
  '/login',
  '/register/personal',
  '/register/enterprise',
  '/apply/institution',
  '/forgot-password',
  '/auth-result',
]

let isRecoveringDynamicRoute = false

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    NProgress.start()
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const token = getAccessToken()

    if (token) {
      try {
        if (!userStore.userLoaded) {
          await userStore.fetchCurrentUser()
        }

        if (userStore.needResetPassword && to.path !== '/first-login-reset-password') {
          next({
            path: '/first-login-reset-password',
            query: to.fullPath ? { redirect: to.fullPath } : undefined,
            replace: true,
          })
          return
        }

        const shouldRecoverDynamicRoute =
          to.name === 'NotFound' && !!userStore.userInfo && !whiteList.includes(to.path) && !isRecoveringDynamicRoute

        if ((!permissionStore.isRoutesGenerated || shouldRecoverDynamicRoute) && userStore.userInfo) {
          if (shouldRecoverDynamicRoute) {
            permissionStore.resetRoutes(router)
            isRecoveringDynamicRoute = true
          }

          permissionStore.mountRoutes(router, userStore.userInfo)

          next({ path: to.fullPath, replace: true })
          return
        }
      } catch {
        isRecoveringDynamicRoute = false
        userStore.resetUser()
        permissionStore.resetRoutes(router)
        next({
          path: '/login',
          query: to.fullPath ? { redirect: to.fullPath } : undefined,
          replace: true,
        })
        return
      }

      if (to.path === '/login' && !userStore.needResetPassword) {
        next()
        return
      }

      if (userStore.userInfo && !canAccessRoute(to, userStore.userInfo)) {
        isRecoveringDynamicRoute = false
        next('/401')
        return
      }

      isRecoveringDynamicRoute = false
      next()
      return
    }

    if (to.path === '/first-login-reset-password') {
      next({
        path: '/login',
        query: to.fullPath ? { redirect: to.fullPath } : undefined,
      })
      return
    }

    if (whiteList.includes(to.path)) {
      next()
      return
    }

    next({
      path: '/login',
      query: to.fullPath ? { redirect: to.fullPath } : undefined,
    })
  })

  router.afterEach(() => {
    isRecoveringDynamicRoute = false
    NProgress.done()
  })
}
