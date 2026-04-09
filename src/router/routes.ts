import type { RouteRecordRaw } from 'vue-router'

import { enterpriseRoutes } from './modules/enterprise'
import { personalRoutes } from './modules/personal'
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
    component: () => import('@/views/auth/login/index.vue'),
    meta: {
      hidden: true,
      title: '登录',
    },
  },
  {
    path: '/register/personal',
    name: 'RegisterPersonal',
    component: () => import('@/views/auth/register-personal/index.vue'),
    meta: {
      hidden: true,
      title: '个人注册',
    },
  },
  {
    path: '/register/enterprise',
    name: 'RegisterEnterprise',
    component: () => import('@/views/auth/register-enterprise/index.vue'),
    meta: {
      hidden: true,
      title: '企业注册',
    },
  },
  {
    path: '/apply/institution',
    name: 'ApplyInstitution',
    component: () => import('@/views/auth/apply-institution/index.vue'),
    meta: {
      hidden: true,
      title: '机构入驻',
    },
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/views/auth/forgot-password/index.vue'),
    meta: {
      hidden: true,
      title: '忘记密码',
    },
  },
  {
    path: '/first-login-reset-password',
    name: 'FirstLoginResetPassword',
    component: () => import('@/views/auth/first-login-reset-password/index.vue'),
    meta: {
      hidden: true,
      title: '首次登录修改密码',
    },
  },
  {
    path: '/auth-result',
    name: 'AuthResult',
    component: () => import('@/views/auth/auth-result/index.vue'),
    meta: {
      hidden: true,
      title: '认证结果',
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

export const asyncRoutes: RouteRecordRaw[] = [platformRoutes, systemRoutes, enterpriseRoutes, personalRoutes]
