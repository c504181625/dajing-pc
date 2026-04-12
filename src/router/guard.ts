import NProgress from 'nprogress'
import type { NavigationGuardNext, Router } from 'vue-router'

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

function isBackendPath(path: string) {
  return ['/personal', '/enterprise', '/operator', '/platform', '/system'].some((prefix) =>
    path.startsWith(prefix),
  )
}

function buildLoginRedirect(_path: string) {
  return {
    path: '/login',
    replace: true,
  }
}

function getSafeLandingPath(router: Router, landingPath?: string | null) {
  if (!landingPath || landingPath === '/') return '/login'
  return router.resolve(landingPath).name === 'NotFound' ? '/login' : landingPath
}

function redirectToPath(next: NavigationGuardNext, path: string) {
  next({
    path,
    replace: true,
  })
}

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    NProgress.start()
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const token = getAccessToken()

    if (!token) {
      if (to.path === '/first-login-reset-password') {
        next(buildLoginRedirect(to.fullPath))
        return
      }

      if (whiteList.includes(to.path)) {
        next()
        return
      }

      next(buildLoginRedirect(to.fullPath))
      return
    }

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
        to.name === 'NotFound' &&
        !!userStore.userInfo &&
        !whiteList.includes(to.path) &&
        !isRecoveringDynamicRoute

      if ((!permissionStore.isRoutesGenerated || shouldRecoverDynamicRoute) && userStore.userInfo) {
        if (shouldRecoverDynamicRoute) {
          permissionStore.resetRoutes(router)
          isRecoveringDynamicRoute = true
        }

        permissionStore.mountRoutes(router, userStore.userInfo)
        const targetPath = to.path === '/' || to.path === '/login' ? '/login' : to.fullPath
        redirectToPath(next, targetPath)
        return
      }
    } catch {
      isRecoveringDynamicRoute = false
      userStore.resetUser()
      permissionStore.resetRoutes(router)
      next(buildLoginRedirect(to.fullPath))
      return
    }

    const safeLandingPath = getSafeLandingPath(router, userStore.landingPath)

    if (to.path === '/login' && !userStore.needResetPassword) {
      next()
      return
    }

    if (to.path === '/') {
      redirectToPath(next, '/login')
      return
    }

    if (to.name === 'NotFound' && userStore.userInfo && isBackendPath(to.path)) {
      if (to.path === safeLandingPath) {
        next(buildLoginRedirect(to.fullPath))
        return
      }

      redirectToPath(next, safeLandingPath)
      return
    }

    if (userStore.userInfo && !canAccessRoute(to, userStore.userInfo)) {
      if (isBackendPath(to.path)) {
        if (to.path === safeLandingPath) {
          next('/401')
          return
        }

        redirectToPath(next, safeLandingPath)
        return
      }

      isRecoveringDynamicRoute = false
      next('/401')
      return
    }

    isRecoveringDynamicRoute = false
    next()
  })

  router.afterEach(() => {
    isRecoveringDynamicRoute = false
    NProgress.done()
  })
}
