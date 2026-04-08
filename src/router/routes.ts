import type { RouteRecordRaw } from 'vue-router'

import { enterpriseRoutes } from './modules/enterprise'
import { platformRoutes } from './modules/platform'
import { systemRoutes } from './modules/system'

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'RootRedirect',
    component: () => import('@/views/common/RedirectHome.vue'),
    meta: {
      hidden: true,
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: {
      hidden: true,
      title: '登录',
    },
  },
  {
    path: '/401',
    name: 'Unauthorized',
    component: () => import('@/views/common/UnauthorizedView.vue'),
    meta: {
      hidden: true,
      title: '无权限访问',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/common/NotFoundView.vue'),
    meta: {
      hidden: true,
      title: '页面不存在',
    },
  },
]

export const asyncRoutes: RouteRecordRaw[] = [platformRoutes, systemRoutes, enterpriseRoutes]
