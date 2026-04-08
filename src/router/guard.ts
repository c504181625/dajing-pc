import NProgress from 'nprogress'
import type { Router } from 'vue-router'

import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
import { getAccessToken } from '@/utils/auth'

const whiteList = ['/login']

export function setupRouterGuard(router: Router) {
  router.beforeEach(async (to, _from, next) => {
    NProgress.start()
    const userStore = useUserStore()
    const permissionStore = usePermissionStore()
    const token = getAccessToken()

    if (token) {
      if (to.path === '/login') {
        next(userStore.landingPath)
        return
      }

      if (!userStore.userLoaded) {
        await userStore.fetchCurrentUser()
      }

      if (!permissionStore.isRoutesGenerated && userStore.userInfo) {
        const accessedRoutes = permissionStore.generateRoutes(userStore.userInfo)
        accessedRoutes.forEach((route) => {
          if (route.name && !router.hasRoute(route.name)) {
            router.addRoute(route)
          }
        })

        next({ ...to, replace: true })
        return
      }

      next()
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
    NProgress.done()
  })
}
