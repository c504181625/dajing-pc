import type { RouteRecordRaw } from 'vue-router'

import { MENU_CODE, PERMISSION_CODE } from '@/enum/permission'
import { ACCOUNT_TYPE } from '@/enum/role'
import Layout from '@/layout/index.vue'

const personalAccountTypes = [ACCOUNT_TYPE.personal]

export const personalRoutes: RouteRecordRaw = {
  path: '/personal',
  name: 'PersonalRoot',
  component: Layout,
  redirect: '/personal/dashboard',
  meta: {
    title: '个人后台',
    icon: 'User',
    accountTypes: personalAccountTypes,
  },
  children: [
    {
      path: 'dashboard',
      name: 'PersonalDashboard',
      component: () => import('@/views/personal/dashboard/index.vue'),
      meta: {
        title: '工作台',
        icon: 'Odometer',
        accountTypes: personalAccountTypes,
        permissions: [PERMISSION_CODE.personalDashboardView],
        menuCode: MENU_CODE.personalDashboard,
      },
    },
    {
      path: 'demand',
      name: 'PersonalDemand',
      component: () => import('@/views/merchant/demand/index.vue'),
      meta: {
        title: '我的需求',
        icon: 'Tickets',
        accountTypes: personalAccountTypes,
        permissions: [PERMISSION_CODE.personalDemandView],
        menuCode: MENU_CODE.personalDemand,
        pageMode: 'personal-demand',
      },
    },
    {
      path: 'demand/create',
      name: 'PersonalDemandCreate',
      component: () => import('@/views/merchant/demand-publish/index.vue'),
      meta: {
        title: '发布需求',
        hidden: true,
        activeMenu: '/personal/demand',
        accountTypes: personalAccountTypes,
        permissions: [PERMISSION_CODE.personalDemandPublish],
      },
    },
    {
      path: 'order',
      name: 'PersonalOrder',
      component: () => import('@/views/merchant/order/index.vue'),
      meta: {
        title: '我的订单',
        icon: 'Calendar',
        accountTypes: personalAccountTypes,
        permissions: [PERMISSION_CODE.personalOrderView],
        menuCode: MENU_CODE.personalOrder,
        pageMode: 'personal-order',
      },
    },
    {
      path: 'order/:id',
      name: 'PersonalOrderDetail',
      component: () => import('@/views/merchant/order/detail.vue'),
      meta: {
        title: '订单详情',
        hidden: true,
        activeMenu: '/personal/order',
        accountTypes: personalAccountTypes,
        permissions: [PERMISSION_CODE.personalOrderView],
      },
    },
    {
      path: 'message',
      name: 'PersonalMessage',
      component: () => import('@/views/merchant/message/index.vue'),
      meta: {
        title: '消息中心',
        icon: 'Bell',
        accountTypes: personalAccountTypes,
        permissions: [PERMISSION_CODE.personalMessageView],
        menuCode: MENU_CODE.personalMessage,
      },
    },
    {
      path: 'profile',
      name: 'PersonalProfile',
      component: () => import('@/views/common/account-settings/index.vue'),
      meta: {
        title: '个人资料',
        icon: 'User',
        accountTypes: personalAccountTypes,
        permissions: [PERMISSION_CODE.personalProfileView],
        menuCode: MENU_CODE.personalProfile,
        pageTitle: '个人资料',
        pageSubtitle: '维护个人账号基础信息、联系方式与密码安全设置。',
      },
    },
    {
      path: 'enterprise-upgrade',
      name: 'PersonalEnterpriseUpgrade',
      component: () => import('@/views/personal/profile/index.vue'),
      meta: {
        title: '企业升级',
        icon: 'OfficeBuilding',
        accountTypes: personalAccountTypes,
        permissions: [PERMISSION_CODE.personalEnterpriseUpgradeView],
        menuCode: MENU_CODE.personalEnterpriseUpgrade,
        pageMode: 'upgrade',
      },
    },
  ],
}
