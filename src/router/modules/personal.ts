import type { RouteRecordRaw } from 'vue-router'

import { ACCOUNT_TYPE } from '@/enum/role'
import Layout from '@/layout/index.vue'

export const personalRoutes: RouteRecordRaw = {
  path: '/personal',
  name: 'PersonalRoot',
  component: Layout,
  redirect: '/personal/dashboard',
  meta: {
    title: '个人中心',
    icon: 'User',
    accountTypes: [ACCOUNT_TYPE.personal],
  },
  children: [
    {
      path: 'dashboard',
      name: 'PersonalDashboard',
      component: () => import('@/views/personal/dashboard/index.vue'),
      meta: {
        title: '工作台',
        icon: 'House',
        accountTypes: [ACCOUNT_TYPE.personal],
      },
    },
    {
      path: 'profile',
      name: 'PersonalProfile',
      component: () => import('@/views/personal/profile/index.vue'),
      meta: {
        title: '个人信息',
        icon: 'User',
        accountTypes: [ACCOUNT_TYPE.personal],
      },
    },
  ],
}
