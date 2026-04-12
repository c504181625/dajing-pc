import type { RouteRecordRaw } from 'vue-router'

import { MENU_CODE, PERMISSION_CODE } from '@/enum/permission'
import { ACCOUNT_TYPE, ENTERPRISE_CAPABILITY } from '@/enum/role'
import Layout from '@/layout/index.vue'

const enterpriseAccountTypes = [ACCOUNT_TYPE.enterprise]

export const enterpriseRoutes: RouteRecordRaw = {
  path: '/enterprise',
  name: 'EnterpriseRoot',
  component: Layout,
  redirect: '/enterprise/dashboard',
  meta: {
    title: '企业后台',
    icon: 'OfficeBuilding',
    accountTypes: enterpriseAccountTypes,
  },
  children: [
    {
      path: 'dashboard',
      name: 'EnterpriseDashboard',
      component: () => import('@/views/merchant/dashboard/index.vue'),
      meta: {
        title: '工作台',
        icon: 'DataAnalysis',
        accountTypes: enterpriseAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseDashboardView],
        menuCode: MENU_CODE.enterpriseDashboard,
      },
    },
    {
      path: 'enterprise',
      name: 'EnterpriseLegacyProfileRedirect',
      redirect: '/enterprise/profile',
      meta: {
        hidden: true,
        accountTypes: enterpriseAccountTypes,
      },
    },
    {
      path: 'profile',
      name: 'EnterpriseProfile',
      component: () => import('@/views/merchant/enterprise/index.vue'),
      meta: {
        title: '企业资料',
        icon: 'Memo',
        accountTypes: enterpriseAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseProfileView],
        menuCode: MENU_CODE.enterpriseProfile,
        pageMode: 'profile',
        pageTitle: '企业资料',
        pageSubtitle: '统一维护企业主体资料、服务范围、证照信息与基础经营信息。',
      },
    },
    {
      path: 'demand-publish',
      name: 'EnterpriseLegacyDemandPublishRedirect',
      redirect: '/enterprise/demand',
      meta: {
        hidden: true,
        accountTypes: enterpriseAccountTypes,
      },
    },
    {
      path: 'demand',
      name: 'EnterpriseDemand',
      component: () => import('@/views/merchant/demand/index.vue'),
      meta: {
        title: '需求管理',
        icon: 'Tickets',
        accountTypes: enterpriseAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseDemandView],
        menuCode: MENU_CODE.enterpriseDemand,
        pageMode: 'enterprise-demand',
      },
    },
    {
      path: 'demand/create',
      name: 'EnterpriseDemandCreate',
      component: () => import('@/views/merchant/demand-publish/index.vue'),
      meta: {
        title: '发布需求',
        hidden: true,
        activeMenu: '/enterprise/demand',
        accountTypes: enterpriseAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseDemandPublish],
      },
    },
    {
      path: 'order',
      name: 'EnterpriseOrder',
      component: () => import('@/views/merchant/order/index.vue'),
      meta: {
        title: '订单管理',
        icon: 'Calendar',
        accountTypes: enterpriseAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseOrderView],
        menuCode: MENU_CODE.enterpriseOrder,
        pageMode: 'enterprise-order',
      },
    },
    {
      path: 'order/:id',
      name: 'EnterpriseOrderDetail',
      component: () => import('@/views/merchant/order/detail.vue'),
      meta: {
        title: '订单详情',
        hidden: true,
        activeMenu: '/enterprise/order',
        accountTypes: enterpriseAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseOrderView],
      },
    },
    {
      path: 'comment',
      name: 'EnterpriseLegacyCommentRedirect',
      redirect: '/enterprise/report',
      meta: {
        hidden: true,
        accountTypes: enterpriseAccountTypes,
      },
    },
    {
      path: 'report',
      name: 'EnterpriseReport',
      component: () => import('@/views/merchant/report/index.vue'),
      meta: {
        title: '报告管理',
        icon: 'Files',
        accountTypes: enterpriseAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseReportView],
        menuCode: MENU_CODE.enterpriseReport,
      },
    },
    {
      path: 'message',
      name: 'EnterpriseMessage',
      component: () => import('@/views/merchant/message/index.vue'),
      meta: {
        title: '消息中心',
        icon: 'Bell',
        accountTypes: enterpriseAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseMessageView],
        menuCode: MENU_CODE.enterpriseMessage,
      },
    },
    {
      path: 'account-settings',
      name: 'EnterpriseAccountSettings',
      component: () => import('@/views/common/account-settings/index.vue'),
      meta: {
        title: '账号设置',
        icon: 'User',
        accountTypes: enterpriseAccountTypes,
        permissions: [PERMISSION_CODE.enterpriseAccountSettingsView],
        menuCode: MENU_CODE.enterpriseAccountSettings,
        pageTitle: '账号设置',
        pageSubtitle: '维护企业登录账号基础信息、联系方式与密码安全设置。',
      },
    },
    {
      path: 'demand-hall',
      name: 'EnterpriseLegacyDemandHallRedirect',
      redirect: '/enterprise/service-project',
      meta: {
        hidden: true,
        accountTypes: enterpriseAccountTypes,
        enterpriseTags: [ENTERPRISE_CAPABILITY.serviceProvider],
      },
    },
    {
      path: 'demand-follow',
      name: 'EnterpriseLegacyDemandFollowRedirect',
      redirect: '/enterprise/service-capability',
      meta: {
        hidden: true,
        accountTypes: enterpriseAccountTypes,
        enterpriseTags: [ENTERPRISE_CAPABILITY.serviceProvider],
      },
    },
    {
      path: 'consult',
      name: 'EnterpriseLegacyConsultRedirect',
      redirect: '/enterprise/service-project',
      meta: {
        hidden: true,
        accountTypes: enterpriseAccountTypes,
        enterpriseTags: [ENTERPRISE_CAPABILITY.serviceProvider],
      },
    },
    {
      path: 'service',
      name: 'EnterpriseLegacyServiceRedirect',
      redirect: '/enterprise/service-project',
      meta: {
        hidden: true,
        accountTypes: enterpriseAccountTypes,
        enterpriseTags: [ENTERPRISE_CAPABILITY.serviceProvider],
      },
    },
    {
      path: 'report-manage',
      name: 'EnterpriseLegacyReportManageRedirect',
      redirect: '/enterprise/report',
      meta: {
        hidden: true,
        accountTypes: enterpriseAccountTypes,
        enterpriseTags: [ENTERPRISE_CAPABILITY.serviceProvider],
      },
    },
    {
      path: 'testing-progress',
      name: 'EnterpriseLegacyTestingProgressRedirect',
      redirect: '/enterprise/order-receive',
      meta: {
        hidden: true,
        accountTypes: enterpriseAccountTypes,
        enterpriseTags: [ENTERPRISE_CAPABILITY.serviceProvider],
      },
    },
    {
      path: 'data-report',
      name: 'EnterpriseLegacyDataReportRedirect',
      redirect: '/enterprise/qualification',
      meta: {
        hidden: true,
        accountTypes: enterpriseAccountTypes,
        enterpriseTags: [ENTERPRISE_CAPABILITY.serviceProvider],
      },
    },
    {
      path: 'service-capability',
      name: 'EnterpriseServiceCapability',
      component: () => import('@/views/merchant/enterprise/index.vue'),
      meta: {
        title: '服务能力管理',
        icon: 'Tools',
        accountTypes: enterpriseAccountTypes,
        enterpriseTags: [ENTERPRISE_CAPABILITY.serviceProvider],
        permissions: [PERMISSION_CODE.enterpriseServiceCapabilityView],
        menuCode: MENU_CODE.enterpriseServiceCapability,
        pageMode: 'service-capability',
        pageTitle: '服务能力管理',
        pageSubtitle: '复用企业资料页结构维护服务范围、能力标签和对外服务说明。',
      },
    },
    {
      path: 'service-project',
      name: 'EnterpriseServiceProject',
      component: () => import('@/views/merchant/service/index.vue'),
      meta: {
        title: '服务项目管理',
        icon: 'Collection',
        accountTypes: enterpriseAccountTypes,
        enterpriseTags: [ENTERPRISE_CAPABILITY.serviceProvider],
        permissions: [PERMISSION_CODE.enterpriseServiceProjectView],
        menuCode: MENU_CODE.enterpriseServiceProject,
      },
    },
    {
      path: 'order-receive',
      name: 'EnterpriseOrderReceive',
      component: () => import('@/views/merchant/order-receive/index.vue'),
      meta: {
        title: '接单管理',
        icon: 'List',
        accountTypes: enterpriseAccountTypes,
        enterpriseTags: [ENTERPRISE_CAPABILITY.serviceProvider],
        permissions: [PERMISSION_CODE.enterpriseOrderReceive],
        menuCode: MENU_CODE.enterpriseOrderReceive,
      },
    },
    {
      path: 'qualification',
      name: 'EnterpriseQualification',
      component: () => import('@/views/merchant/enterprise/index.vue'),
      meta: {
        title: '资质与认证',
        icon: 'Checked',
        accountTypes: enterpriseAccountTypes,
        enterpriseTags: [ENTERPRISE_CAPABILITY.serviceProvider],
        permissions: [PERMISSION_CODE.enterpriseQualificationView],
        menuCode: MENU_CODE.enterpriseQualification,
        pageMode: 'qualification',
        pageTitle: '资质与认证',
        pageSubtitle: '复用企业资料展示区与附件区，承接认证提交、进度查看和补充材料。',
      },
    },
  ],
}
