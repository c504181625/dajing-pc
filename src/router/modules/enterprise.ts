import type { RouteRecordRaw } from 'vue-router'

import { PERMISSION_CODE } from '@/enum/permission'
import { ACCOUNT_TYPE, ENTERPRISE_CAPABILITY } from '@/enum/role'
import Layout from '@/layout/index.vue'

const merchantAccountTypes = [ACCOUNT_TYPE.enterprise, ACCOUNT_TYPE.institution]

export const enterpriseRoutes: RouteRecordRaw = {
  path: '/enterprise',
  name: 'MerchantRoot',
  component: Layout,
  redirect: '/enterprise/dashboard',
  meta: {
    title: '企业后台',
    icon: 'OfficeBuilding',
    accountTypes: merchantAccountTypes,
  },
  children: [
    {
      path: 'dashboard',
      name: 'MerchantDashboard',
      component: () => import('@/views/merchant/dashboard/index.vue'),
      meta: {
        title: '工作台',
        icon: 'DataAnalysis',
        accountTypes: merchantAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseDashboardView],
      },
    },
    {
      path: 'enterprise',
      name: 'MerchantEnterprise',
      component: () => import('@/views/merchant/enterprise/index.vue'),
      meta: {
        title: '企业信息',
        icon: 'Memo',
        accountTypes: merchantAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseProfileEdit],
      },
    },
    {
      path: 'demand',
      name: 'MerchantDemand',
      component: () => import('@/views/merchant/demand/index.vue'),
      meta: {
        title: '我的需求',
        icon: 'Tickets',
        accountTypes: merchantAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseDemandView],
      },
    },
    {
      path: 'order',
      name: 'MerchantOrder',
      component: () => import('@/views/merchant/order/index.vue'),
      meta: {
        title: '我的订单',
        icon: 'Calendar',
        accountTypes: merchantAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseOrderView],
      },
    },
    {
      path: 'order/:id',
      name: 'MerchantOrderDetail',
      component: () => import('@/views/merchant/order/detail.vue'),
      meta: {
        title: '订单详情',
        hidden: true,
        activeMenu: '/enterprise/order',
        accountTypes: merchantAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseOrderView],
      },
    },
    {
      path: 'report',
      name: 'MerchantReport',
      component: () => import('@/views/merchant/report/index.vue'),
      meta: {
        title: '我的报告',
        icon: 'Files',
        accountTypes: merchantAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseReportView],
      },
    },
    {
      path: 'message',
      name: 'MerchantMessage',
      component: () => import('@/views/merchant/message/index.vue'),
      meta: {
        title: '消息中心',
        icon: 'Bell',
        accountTypes: merchantAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseMessageView],
      },
    },
    {
      path: 'demand-publish',
      name: 'MerchantDemandPublish',
      component: () => import('@/views/merchant/demand-publish/index.vue'),
      meta: {
        title: '发布需求',
        icon: 'EditPen',
        accountTypes: merchantAccountTypes,
        enterpriseCapabilities: [ENTERPRISE_CAPABILITY.demander],
        permissions: [PERMISSION_CODE.enterpriseDemandPublish],
      },
    },
    {
      path: 'comment',
      name: 'MerchantComment',
      component: () => import('@/views/merchant/comment/index.vue'),
      meta: {
        title: '我的评价',
        icon: 'ChatLineSquare',
        accountTypes: merchantAccountTypes,
        enterpriseCapabilities: [ENTERPRISE_CAPABILITY.demander],
        permissions: [PERMISSION_CODE.enterpriseCommentView],
      },
    },
    {
      path: 'demand-hall',
      name: 'MerchantDemandHall',
      component: () => import('@/views/merchant/demand-hall/index.vue'),
      meta: {
        title: '需求大厅',
        icon: 'Collection',
        accountTypes: merchantAccountTypes,
        enterpriseCapabilities: [ENTERPRISE_CAPABILITY.serviceProvider],
        permissions: [PERMISSION_CODE.enterpriseDemandHallView],
      },
    },
    {
      path: 'demand-follow',
      name: 'MerchantDemandFollow',
      component: () => import('@/views/merchant/demand-follow/index.vue'),
      meta: {
        title: '需求对接',
        icon: 'Connection',
        accountTypes: merchantAccountTypes,
        enterpriseCapabilities: [ENTERPRISE_CAPABILITY.serviceProvider],
        permissions: [PERMISSION_CODE.enterpriseDemandHandle],
      },
    },
    {
      path: 'consult',
      name: 'MerchantConsult',
      component: () => import('@/views/merchant/consult/index.vue'),
      meta: {
        title: '咨询管理',
        icon: 'ChatDotRound',
        accountTypes: merchantAccountTypes,
        enterpriseCapabilities: [ENTERPRISE_CAPABILITY.serviceProvider],
        permissions: [PERMISSION_CODE.enterpriseConsultView],
      },
    },
    {
      path: 'service',
      name: 'MerchantService',
      component: () => import('@/views/merchant/service/index.vue'),
      meta: {
        title: '服务管理',
        icon: 'Tools',
        accountTypes: merchantAccountTypes,
        enterpriseCapabilities: [ENTERPRISE_CAPABILITY.serviceProvider],
        permissions: [PERMISSION_CODE.enterpriseServiceView],
      },
    },
    {
      path: 'comment-view',
      name: 'MerchantCommentView',
      component: () => import('@/views/merchant/comment/index.vue'),
      meta: {
        title: '评价查看',
        icon: 'Star',
        accountTypes: merchantAccountTypes,
        enterpriseCapabilities: [ENTERPRISE_CAPABILITY.serviceProvider],
        permissions: [PERMISSION_CODE.enterpriseCommentManage],
      },
    },
    {
      path: 'order-receive',
      name: 'MerchantOrderReceive',
      component: () => import('@/views/merchant/order-receive/index.vue'),
      meta: {
        title: '接单管理',
        icon: 'Finished',
        accountTypes: merchantAccountTypes,
        enterpriseCapabilities: [ENTERPRISE_CAPABILITY.labProvider],
        permissions: [PERMISSION_CODE.enterpriseOrderReceive],
      },
    },
    {
      path: 'testing-order',
      name: 'MerchantTestingOrder',
      component: () => import('@/views/merchant/order/index.vue'),
      meta: {
        title: '检测订单',
        icon: 'List',
        accountTypes: merchantAccountTypes,
        enterpriseCapabilities: [ENTERPRISE_CAPABILITY.labProvider],
        permissions: [PERMISSION_CODE.enterpriseOrderHandle],
      },
    },
    {
      path: 'report-manage',
      name: 'MerchantReportManage',
      component: () => import('@/views/merchant/report/index.vue'),
      meta: {
        title: '报告管理',
        icon: 'DocumentCopy',
        accountTypes: merchantAccountTypes,
        enterpriseCapabilities: [ENTERPRISE_CAPABILITY.labProvider],
        permissions: [PERMISSION_CODE.enterpriseReportHandle],
      },
    },
    {
      path: 'testing-progress',
      name: 'MerchantTestingProgress',
      component: () => import('@/views/merchant/testing-progress/index.vue'),
      meta: {
        title: '检测进度',
        icon: 'Timer',
        accountTypes: merchantAccountTypes,
        enterpriseCapabilities: [ENTERPRISE_CAPABILITY.labProvider],
        permissions: [PERMISSION_CODE.enterpriseTestingProgressView],
      },
    },
    {
      path: 'data-report',
      name: 'MerchantDataReport',
      component: () => import('@/views/merchant/data-report/index.vue'),
      meta: {
        title: '数据报告',
        icon: 'TrendCharts',
        accountTypes: merchantAccountTypes,
        enterpriseCapabilities: [ENTERPRISE_CAPABILITY.labProvider],
        permissions: [PERMISSION_CODE.enterpriseDataReportView],
      },
    },
  ],
}
