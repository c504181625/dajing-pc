import type { RouteRecordRaw } from 'vue-router'

import Layout from '@/layout/index.vue'

const RoutePlaceholder = () => import('@/views/common/RoutePlaceholder.vue')

export const platformRoutes: RouteRecordRaw = {
  path: '/platform',
  name: 'PlatformRoot',
  component: Layout,
  redirect: '/platform/dashboard',
  meta: {
    title: '平台运营后台',
    icon: 'Monitor',
    roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'AUDITOR'],
  },
  children: [
    {
      path: 'dashboard',
      name: 'PlatformDashboard',
      component: () => import('@/views/platform/dashboard/index.vue'),
      meta: {
        title: '工作台',
        icon: 'Odometer',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'AUDITOR'],
      },
    },
    {
      path: 'enterprise-audit',
      name: 'EnterpriseAudit',
      component: () => import('@/views/platform/enterprise-audit/index.vue'),
      meta: {
        title: '企业审核管理',
        icon: 'Checked',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'AUDITOR'],
      },
    },
    {
      path: 'enterprise-audit/:id',
      name: 'EnterpriseAuditDetail',
      component: () => import('@/views/platform/enterprise-audit/detail.vue'),
      meta: {
        title: '企业审核详情',
        hidden: true,
        activeMenu: '/platform/enterprise-audit',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'AUDITOR'],
      },
    },
    {
      path: 'user',
      name: 'UserManagement',
      component: () => import('@/views/shared/user/index.vue'),
      meta: {
        title: '用户管理',
        icon: 'User',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
      },
    },
    {
      path: 'demand',
      name: 'DemandManagement',
      component: () => import('@/views/platform/demand/index.vue'),
      meta: {
        title: '需求管理',
        icon: 'Tickets',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'AUDITOR'],
      },
    },
    {
      path: 'order',
      name: 'OrderManagement',
      component: () => import('@/views/platform/order/index.vue'),
      meta: {
        title: '订单管理',
        icon: 'List',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'AUDITOR'],
      },
    },
    {
      path: 'report',
      name: 'ReportManagement',
      component: () => import('@/views/platform/report/index.vue'),
      meta: {
        title: '报告管理',
        icon: 'Document',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN', 'AUDITOR'],
      },
    },
    {
      path: 'comment',
      name: 'CommentManagement',
      component: RoutePlaceholder,
      meta: {
        title: '评价管理',
        icon: 'ChatDotRound',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
      },
    },
    {
      path: 'content',
      name: 'ContentManagement',
      component: RoutePlaceholder,
      meta: {
        title: '内容资讯管理',
        icon: 'Reading',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
      },
    },
    {
      path: 'community-audit',
      name: 'CommunityAudit',
      component: RoutePlaceholder,
      meta: {
        title: '社区审核管理',
        icon: 'Comment',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
      },
    },
    {
      path: 'statistics',
      name: 'StatisticsReport',
      component: RoutePlaceholder,
      meta: {
        title: '统计报表',
        icon: 'TrendCharts',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
      },
    },
  ],
}
