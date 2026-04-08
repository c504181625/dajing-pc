import type { RouteRecordRaw } from 'vue-router'

import Layout from '@/layout/index.vue'

const RoutePlaceholder = () => import('@/views/common/RoutePlaceholder.vue')

export const enterpriseRoutes: RouteRecordRaw = {
  path: '/enterprise',
  name: 'EnterpriseRoot',
  component: Layout,
  redirect: '/enterprise/dashboard',
  meta: {
    title: '企业后台',
    icon: 'OfficeBuilding',
    roles: ['ENTERPRISE_DEMAND', 'ENTERPRISE_SERVICE', 'ENTERPRISE_LAB', 'ENTERPRISE_STAFF'],
  },
  children: [
    {
      path: 'dashboard',
      name: 'EnterpriseDashboard',
      component: () => import('@/views/enterprise/dashboard/index.vue'),
      meta: {
        title: '企业工作台',
        icon: 'DataAnalysis',
        roles: ['ENTERPRISE_DEMAND', 'ENTERPRISE_SERVICE', 'ENTERPRISE_LAB', 'ENTERPRISE_STAFF'],
      },
    },
    {
      path: 'profile',
      name: 'EnterpriseProfile',
      component: () => import('@/views/enterprise/profile/index.vue'),
      meta: {
        title: '企业信息管理',
        icon: 'Memo',
        roles: ['ENTERPRISE_DEMAND', 'ENTERPRISE_SERVICE', 'ENTERPRISE_LAB'],
      },
    },
    {
      path: 'order',
      name: 'MyOrder',
      component: () => import('@/views/enterprise/order/index.vue'),
      meta: {
        title: '我的订单',
        icon: 'Calendar',
        roles: ['ENTERPRISE_DEMAND', 'ENTERPRISE_SERVICE', 'ENTERPRISE_LAB', 'ENTERPRISE_STAFF'],
      },
    },
    {
      path: 'order/:id',
      name: 'EnterpriseOrderDetail',
      component: () => import('@/views/enterprise/order/detail.vue'),
      meta: {
        title: '订单详情',
        hidden: true,
        activeMenu: '/enterprise/order',
        roles: ['ENTERPRISE_DEMAND', 'ENTERPRISE_SERVICE', 'ENTERPRISE_LAB', 'ENTERPRISE_STAFF'],
      },
    },
    {
      path: 'report',
      name: 'MyReport',
      component: () => import('@/views/enterprise/report/index.vue'),
      meta: {
        title: '我的报告',
        icon: 'Files',
        roles: ['ENTERPRISE_DEMAND', 'ENTERPRISE_LAB'],
      },
    },
    {
      path: 'message',
      name: 'MessageCenter',
      component: RoutePlaceholder,
      meta: {
        title: '消息中心',
        icon: 'Bell',
        roles: ['ENTERPRISE_DEMAND', 'ENTERPRISE_SERVICE', 'ENTERPRISE_LAB', 'ENTERPRISE_STAFF'],
      },
    },
    {
      path: 'sub-account',
      name: 'SubAccountManagement',
      component: RoutePlaceholder,
      meta: {
        title: '子账号管理',
        icon: 'Avatar',
        roles: ['ENTERPRISE_DEMAND', 'ENTERPRISE_SERVICE', 'ENTERPRISE_LAB'],
      },
    },
    {
      path: 'comment',
      name: 'MyComment',
      component: RoutePlaceholder,
      meta: {
        title: '评价反馈',
        icon: 'ChatLineSquare',
        roles: ['ENTERPRISE_DEMAND', 'ENTERPRISE_LAB'],
      },
    },
  ],
}
