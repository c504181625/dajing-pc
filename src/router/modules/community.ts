import type { RouteRecordRaw } from 'vue-router'

import { ACCOUNT_TYPE } from '@/enum/role'
import Layout from '@/layout/index.vue'

const frontCommunityAccountTypes = [ACCOUNT_TYPE.personal, ACCOUNT_TYPE.enterprise]

export const communityRoutes: RouteRecordRaw = {
  path: '/community',
  name: 'CommunityRoot',
  component: Layout,
  redirect: '/community/news',
  meta: {
    title: '质量社区',
    icon: 'Reading',
    accountTypes: frontCommunityAccountTypes,
  },
  children: [
    {
      path: 'article',
      redirect: '/community/news',
      meta: {
        hidden: true,
        accountTypes: frontCommunityAccountTypes,
      },
    },
    {
      path: 'question',
      redirect: '/community/qa',
      meta: {
        hidden: true,
        accountTypes: frontCommunityAccountTypes,
      },
    },
    {
      path: 'expert',
      redirect: '/community/experts',
      meta: {
        hidden: true,
        accountTypes: frontCommunityAccountTypes,
      },
    },
    {
      path: 'article/detail/:id',
      redirect: (to) => `/community/news/${String(to.params.id)}`,
      meta: {
        hidden: true,
        accountTypes: frontCommunityAccountTypes,
      },
    },
    {
      path: 'question/detail/:id',
      redirect: (to) => `/community/qa/${String(to.params.id)}`,
      meta: {
        hidden: true,
        accountTypes: frontCommunityAccountTypes,
      },
    },
    {
      path: 'expert/detail/:id',
      redirect: (to) => `/community/experts/${String(to.params.id)}`,
      meta: {
        hidden: true,
        accountTypes: frontCommunityAccountTypes,
      },
    },
    {
      path: 'news',
      name: 'CommunityNews',
      component: () => import('@/views/community/article/index.vue'),
      meta: {
        title: '资讯中心',
        icon: 'Document',
        accountTypes: frontCommunityAccountTypes,
      },
    },
    {
      path: 'news/:id',
      name: 'CommunityNewsDetail',
      component: () => import('@/views/community/article/detail.vue'),
      meta: {
        title: '资讯详情',
        hidden: true,
        activeMenu: '/community/news',
        accountTypes: frontCommunityAccountTypes,
      },
    },
    {
      path: 'qa',
      name: 'CommunityQa',
      component: () => import('@/views/community/question/index.vue'),
      meta: {
        title: '社区问答',
        icon: 'ChatLineSquare',
        accountTypes: frontCommunityAccountTypes,
      },
    },
    {
      path: 'qa/ask',
      name: 'CommunityQaAsk',
      component: () => import('@/views/community/question/ask.vue'),
      meta: {
        title: '我要提问',
        hidden: true,
        activeMenu: '/community/qa',
        accountTypes: frontCommunityAccountTypes,
      },
    },
    {
      path: 'qa/:id',
      name: 'CommunityQaDetail',
      component: () => import('@/views/community/question/detail.vue'),
      meta: {
        title: '问答详情',
        hidden: true,
        activeMenu: '/community/qa',
        accountTypes: frontCommunityAccountTypes,
      },
    },
    {
      path: 'experts',
      name: 'CommunityExperts',
      component: () => import('@/views/community/expert/index.vue'),
      meta: {
        title: '专家在线',
        icon: 'User',
        accountTypes: frontCommunityAccountTypes,
      },
    },
    {
      path: 'experts/:id',
      name: 'CommunityExpertsDetail',
      component: () => import('@/views/community/expert/detail.vue'),
      meta: {
        title: '专家详情',
        hidden: true,
        activeMenu: '/community/experts',
        accountTypes: frontCommunityAccountTypes,
      },
    },
  ],
}
