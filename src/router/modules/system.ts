import type { RouteRecordRaw } from 'vue-router'

import Layout from '@/layout/index.vue'

const RoutePlaceholder = () => import('@/views/common/RoutePlaceholder.vue')

export const systemRoutes: RouteRecordRaw = {
  path: '/system',
  name: 'SystemRoot',
  component: Layout,
  redirect: '/system/role',
  meta: {
    title: '系统设置',
    icon: 'Setting',
    roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
  },
  children: [
    {
      path: 'role',
      name: 'RoleManagement',
      component: () => import('@/views/system/role/index.vue'),
      meta: {
        title: '角色权限管理',
        icon: 'Lock',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
      },
    },
    {
      path: 'dictionary',
      name: 'DictionaryManagement',
      component: RoutePlaceholder,
      meta: {
        title: '基础数据维护',
        icon: 'Collection',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
      },
    },
    {
      path: 'service-project',
      name: 'ServiceProjectManagement',
      component: RoutePlaceholder,
      meta: {
        title: '服务项目管理',
        icon: 'Grid',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
      },
    },
    {
      path: 'workflow-template',
      name: 'WorkflowTemplate',
      component: RoutePlaceholder,
      meta: {
        title: '流程模板管理',
        icon: 'Share',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
      },
    },
    {
      path: 'workflow-node',
      name: 'WorkflowNode',
      component: RoutePlaceholder,
      meta: {
        title: '工作流节点管理',
        icon: 'Connection',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
      },
    },
    {
      path: 'settings',
      name: 'MoreSystemSettings',
      component: RoutePlaceholder,
      meta: {
        title: '更多系统配置',
        icon: 'Tools',
        roles: ['SUPER_ADMIN', 'PLATFORM_ADMIN'],
      },
    },
  ],
}
