import type { RouteRecordRaw } from 'vue-router'

import { PERMISSION_CODE } from '@/enum/permission'
import { ACCOUNT_TYPE, PLATFORM_ROLE } from '@/enum/role'
import Layout from '@/layout/index.vue'
import RoutePlaceholder from '@/views/common/RoutePlaceholder.vue'

export const systemRoutes: RouteRecordRaw = {
  path: '/system',
  name: 'SystemRoot',
  component: Layout,
  redirect: '/system/role',
  meta: {
    title: '系统设置',
    icon: 'Setting',
    accountTypes: [ACCOUNT_TYPE.platformAdmin],
  },
  children: [
    {
      path: 'role',
      name: 'RoleManagement',
      component: () => import('@/views/platform/system/role/index.vue'),
      meta: {
        title: '角色权限',
        icon: 'Lock',
        accountTypes: [ACCOUNT_TYPE.platformAdmin],
        platformRoles: [PLATFORM_ROLE.superAdmin, PLATFORM_ROLE.platformAdmin],
        permissions: [PERMISSION_CODE.roleManageView],
      },
    },
    {
      path: 'dictionary',
      name: 'DictionaryManagement',
      component: RoutePlaceholder,
      meta: {
        title: '基础数据维护',
        icon: 'Collection',
        accountTypes: [ACCOUNT_TYPE.platformAdmin],
        platformRoles: [PLATFORM_ROLE.superAdmin],
        permissions: [PERMISSION_CODE.dictionaryManageView],
      },
    },
    {
      path: 'workflow-template',
      name: 'WorkflowTemplateManagement',
      component: () => import('@/views/platform/workflow/template/index.vue'),
      meta: {
        title: '流程模板',
        icon: 'Connection',
        accountTypes: [ACCOUNT_TYPE.platformAdmin],
        platformRoles: [PLATFORM_ROLE.superAdmin, PLATFORM_ROLE.platformAdmin],
        permissions: [PERMISSION_CODE.workflowManageView],
      },
    },
    {
      path: 'workflow-node',
      name: 'WorkflowNodeManagement',
      component: () => import('@/views/platform/workflow/node/index.vue'),
      meta: {
        title: '工作流节点',
        icon: 'Share',
        accountTypes: [ACCOUNT_TYPE.platformAdmin],
        platformRoles: [PLATFORM_ROLE.superAdmin, PLATFORM_ROLE.platformAdmin],
        permissions: [PERMISSION_CODE.workflowManageView],
      },
    },
    {
      path: 'workflow-record',
      name: 'WorkflowRecordManagement',
      component: () => import('@/views/platform/workflow/record/index.vue'),
      meta: {
        title: '工作流审批记录',
        icon: 'Document',
        accountTypes: [ACCOUNT_TYPE.platformAdmin],
        permissions: [PERMISSION_CODE.workflowManageView],
      },
    },
  ],
}
