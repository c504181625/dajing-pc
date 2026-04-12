import type { RouteRecordRaw } from 'vue-router'

import { communityRoutes } from './modules/community'
import { enterpriseRoutes } from './modules/enterprise'
import { operatorRoutes } from './modules/platform'
import { personalRoutes } from './modules/personal'

function normalizeLegacyPath(pathMatch?: string | string[]) {
  if (!pathMatch) return ''
  return Array.isArray(pathMatch) ? pathMatch.join('/') : pathMatch
}

function mapLegacyPlatformPath(pathMatch?: string | string[]) {
  const normalized = normalizeLegacyPath(pathMatch).replace(/^\/+/, '')
  const [first = '', ...rest] = normalized.split('/').filter(Boolean)
  const suffix = rest.length ? `/${rest.join('/')}` : ''

  if (!first) {
    return '/operator/dashboard'
  }

  const businessMap: Record<string, string> = {
    user: '/operator/business/user',
    'enterprise-audit': '/operator/business/enterprise-audit',
    demand: '/operator/business/demand',
    consult: '/operator/business/consult',
    order: '/operator/business/order',
    report: '/operator/business/report',
    comment: '/operator/business/comment',
    message: '/operator/business/message',
  }

  if (first in businessMap) {
    return `${businessMap[first]}${suffix}`
  }

  if (first === 'profile') {
    return '/operator/profile'
  }

  if (first === 'community') {
    const [communityModule = 'news', ...communityRest] = rest
    const communityMap: Record<string, string> = {
      article: 'news',
      question: 'qa',
      expert: 'experts',
      news: 'news',
      qa: 'qa',
      experts: 'experts',
    }
    const normalizedModule = communityMap[communityModule] || 'news'
    const normalizedSuffix = communityRest.length ? `/${communityRest.join('/')}` : ''
    return `/operator/community/${normalizedModule}${normalizedSuffix}`
  }

  return `/operator/${normalized}`
}

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'RootRedirect',
    redirect: '/login',
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
      title: '统一登录',
    },
  },
  {
    path: '/platform/:pathMatch(.*)*',
    name: 'LegacyPlatformRedirect',
    redirect: (to) => mapLegacyPlatformPath(to.params.pathMatch as string | string[] | undefined),
    meta: {
      hidden: true,
    },
  },
  {
    path: '/system/:pathMatch(.*)*',
    name: 'LegacySystemRedirect',
    redirect: (to) => {
      const normalized = normalizeLegacyPath(
        to.params.pathMatch as string | string[] | undefined,
      ).replace(
        /^\/+/,
        '',
      )
      return `/operator/system/${normalized || 'role'}`
    },
    meta: {
      hidden: true,
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
      title: '企业入驻/机构认证',
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

export const asyncRoutes: RouteRecordRaw[] = [
  operatorRoutes,
  enterpriseRoutes,
  personalRoutes,
  communityRoutes,
]
