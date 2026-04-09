import type { RouteRecordRaw } from 'vue-router'

import { PERMISSION_CODE } from '@/enum/permission'
import { ACCOUNT_TYPE } from '@/enum/role'
import Layout from '@/layout/index.vue'

const platformAccountTypes = [ACCOUNT_TYPE.platformAdmin]

export const platformRoutes: RouteRecordRaw = {
  path: '/platform',
  name: 'PlatformRoot',
  component: Layout,
  redirect: '/platform/dashboard',
  meta: {
    title: '平台运营后台',
    icon: 'Monitor',
    accountTypes: platformAccountTypes,
  },
  children: [
    {
      path: 'dashboard',
      name: 'PlatformDashboard',
      component: () => import('@/views/platform/dashboard/index.vue'),
      meta: {
        title: '工作台',
        icon: 'Odometer',
        accountTypes: platformAccountTypes,
        permissions: [PERMISSION_CODE.platformDashboardView],
      },
    },
    {
      path: 'user',
      name: 'PlatformUserManagement',
      component: () => import('@/views/platform/user/index.vue'),
      meta: {
        title: '用户管理',
        icon: 'User',
        accountTypes: platformAccountTypes,
        permissions: [PERMISSION_CODE.userManageView],
      },
    },
    {
      path: 'enterprise-audit',
      name: 'EnterpriseAudit',
      component: () => import('@/views/platform/enterprise-audit/index.vue'),
      meta: {
        title: '机构审核',
        icon: 'Checked',
        accountTypes: platformAccountTypes,
        permissions: [PERMISSION_CODE.auditEnterpriseQuery],
      },
    },
    {
      path: 'enterprise-audit/:id',
      name: 'EnterpriseAuditDetail',
      component: () => import('@/views/platform/enterprise-audit/detail.vue'),
      meta: {
        title: '机构审核详情',
        hidden: true,
        activeMenu: '/platform/enterprise-audit',
        accountTypes: platformAccountTypes,
        permissions: [PERMISSION_CODE.auditEnterpriseQuery],
      },
    },
    {
      path: 'demand',
      name: 'DemandManagement',
      component: () => import('@/views/platform/demand/index.vue'),
      meta: {
        title: '需求管理',
        icon: 'Tickets',
        accountTypes: platformAccountTypes,
        permissions: [PERMISSION_CODE.demandManageView],
      },
    },
    {
      path: 'consult',
      name: 'ConsultManagement',
      component: () => import('@/views/platform/consult/index.vue'),
      meta: {
        title: '咨询管理',
        icon: 'ChatLineSquare',
        accountTypes: platformAccountTypes,
        permissions: [PERMISSION_CODE.consultManageView],
      },
    },
    {
      path: 'order',
      name: 'OrderManagement',
      component: () => import('@/views/platform/order/index.vue'),
      meta: {
        title: '订单管理',
        icon: 'List',
        accountTypes: platformAccountTypes,
        permissions: [PERMISSION_CODE.orderManageView],
      },
    },
    {
      path: 'order/:id',
      name: 'OrderDetail',
      component: () => import('@/views/platform/order/detail.vue'),
      meta: {
        title: '订单详情',
        hidden: true,
        activeMenu: '/platform/order',
        accountTypes: platformAccountTypes,
        permissions: [PERMISSION_CODE.orderManageView],
      },
    },
    {
      path: 'report',
      name: 'ReportManagement',
      component: () => import('@/views/platform/report/index.vue'),
      meta: {
        title: '报告管理',
        icon: 'Document',
        accountTypes: platformAccountTypes,
        permissions: [PERMISSION_CODE.reportManageView],
      },
    },
    {
      path: 'report/:id',
      name: 'ReportDetail',
      component: () => import('@/views/platform/report/detail.vue'),
      meta: {
        title: '报告详情',
        hidden: true,
        activeMenu: '/platform/report',
        accountTypes: platformAccountTypes,
        permissions: [PERMISSION_CODE.reportManageView],
      },
    },
    {
      path: 'comment',
      name: 'CommentManagement',
      component: () => import('@/views/platform/comment/index.vue'),
      meta: {
        title: '评价管理',
        icon: 'ChatDotRound',
        accountTypes: platformAccountTypes,
        permissions: [PERMISSION_CODE.commentManageView],
      },
    },
    {
      path: 'message',
      name: 'PlatformMessageManagement',
      component: () => import('@/views/platform/message/index.vue'),
      meta: {
        title: '消息中心',
        icon: 'Bell',
        accountTypes: platformAccountTypes,
        permissions: [PERMISSION_CODE.messageManageView],
      },
    },
    {
      path: 'profile',
      name: 'PlatformProfile',
      component: () => import('@/views/platform/profile/index.vue'),
      meta: {
        title: '运营方信息',
        hidden: true,
        accountTypes: platformAccountTypes,
      },
    },
  ],
}
