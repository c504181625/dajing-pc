import NProgress from 'nprogress'
import type { LocationQueryRaw, NavigationGuardNext, Router } from 'vue-router'

import { canAccessRoute, usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
import { ACCOUNT_TYPE } from '@/enum/role'
import { getAccessToken } from '@/utils/auth'

const whiteList = [
  '/login',
  '/operator-login',
  '/register/personal',
  '/register/enterprise',
  '/apply/institution',
  '/forgot-password',
  '/auth-result',
]

function isBackendPath(path: string) {
  return ['/personal', '/enterprise', '/operator', '/platform', '/system'].some((prefix) =>
    path.startsWith(prefix),
  )
}

function buildLoginRedirect(path: string) {
  const isOperatorTarget = ['/operator', '/platform', '/system', '/admin'].some((prefix) =>
    path.startsWith(prefix),
  )
  const loginPath = isOperatorTarget ? '/operator-login' : '/login'
  return {
    path: loginPath,
    query: path && path !== loginPath ? { redirect: path } : undefined,
    replace: true,
  }
}

function getFallbackLandingPath(accountType?: string | null) {
  if (accountType === ACCOUNT_TYPE.operator) return '/operator/dashboard'
  if (accountType === ACCOUNT_TYPE.enterprise) return '/enterprise/dashboard'
  return '/personal/dashboard'
}

function getSafeLandingPath(landingPath?: string | null, accountType?: string | null) {
  const fallbackPath = getFallbackLandingPath(accountType)
  if (!landingPath || landingPath === '/' || landingPath === '/login' || landingPath === '/operator-login') {
    return fallbackPath
  }
  return landingPath
}

function redirectToPath(
  to: { fullPath: string; name?: string | symbol | null },
  next: NavigationGuardNext,
  target: {
    path: string
    query?: LocationQueryRaw
    hash?: string
  },
) {
  const targetFullPath = `${target.path}${target.hash || ''}`

  if ((target.path === to.fullPath || targetFullPath === to.fullPath) && to.name !== 'NotFound') {
    next()
    return
  }

  next({
    path: target.path,
    query: target.query,
    hash: target.hash,
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

      const safeLandingPath = getSafeLandingPath(
        userStore.landingPath,
        userStore.userInfo?.accountType,
      )

      if (userStore.needResetPassword && to.path !== '/first-login-reset-password') {
        next({
          path: '/first-login-reset-password',
          query: to.fullPath ? { redirect: to.fullPath } : undefined,
          replace: true,
        })
        return
      }

      if (!permissionStore.isRoutesGenerated && userStore.userInfo) {
        permissionStore.mountRoutes(router, userStore.userInfo)

        if (to.path === '/login' || to.path === '/operator-login' || to.path === '/') {
          const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : ''
          redirectToPath(to, next, {
            path:
              redirect && redirect !== '/login' && redirect !== '/operator-login'
                ? redirect
                : safeLandingPath,
          })
          return
        }

        if (to.name === 'NotFound') {
          redirectToPath(to, next, {
            path: to.path,
            query: to.query,
            hash: to.hash,
          })
          return
        }

        next()
        return
      }
    } catch {
      userStore.resetUser()
      permissionStore.resetRoutes(router)

      if (to.path === '/login' || to.path === '/operator-login') {
        next()
        return
      }

      next(buildLoginRedirect(to.fullPath))
      return
    }

    const safeLandingPath = getSafeLandingPath(
      userStore.landingPath,
      userStore.userInfo?.accountType,
    )

    if ((to.path === '/login' || to.path === '/operator-login') && !userStore.needResetPassword) {
      const redirect = typeof to.query.redirect === 'string' ? to.query.redirect : ''
      redirectToPath(to, next, {
        path:
          redirect && redirect !== '/login' && redirect !== '/operator-login'
            ? redirect
            : safeLandingPath,
      })
      return
    }

    if (to.path === '/') {
      redirectToPath(to, next, {
        path: safeLandingPath,
      })
      return
    }

    if (to.name === 'NotFound' && userStore.userInfo && isBackendPath(to.path)) {
      if (to.path === safeLandingPath) {
        next('/401')
        return
      }

      redirectToPath(to, next, {
        path: safeLandingPath,
      })
      return
    }

    if (userStore.userInfo && !canAccessRoute(to, userStore.userInfo)) {
      if (isBackendPath(to.path)) {
        if (to.path === safeLandingPath) {
          next('/401')
          return
        }

        redirectToPath(to, next, {
          path: safeLandingPath,
        })
        return
      }

      next('/401')
      return
    }

    next()
  })

  router.afterEach(() => {
    NProgress.done()
  })
}
