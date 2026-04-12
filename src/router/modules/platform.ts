import type { RouteRecordRaw } from 'vue-router'

import { MENU_CODE, PERMISSION_CODE } from '@/enum/permission'
import { ACCOUNT_TYPE } from '@/enum/role'
import Layout from '@/layout/index.vue'
import RouteGroupView from '@/views/common/RouteGroupView.vue'

const operatorAccountTypes = [ACCOUNT_TYPE.operator]

export const operatorRoutes: RouteRecordRaw = {
  path: '/operator',
  name: 'OperatorRoot',
  component: Layout,
  redirect: '/operator/dashboard',
  meta: {
    title: '平台运营后台',
    icon: 'Monitor',
    accountTypes: operatorAccountTypes,
  },
  children: [
    {
      path: 'dashboard',
      name: 'OperatorDashboard',
      component: () => import('@/views/platform/dashboard/index.vue'),
      meta: {
        title: '工作台',
        icon: 'Odometer',
        accountTypes: operatorAccountTypes,
        permissions: [PERMISSION_CODE.operatorDashboardView],
        menuCode: MENU_CODE.operatorDashboard,
      },
    },
    {
      path: 'business',
      name: 'OperatorBusinessGroup',
      component: RouteGroupView,
      meta: {
        title: '平台业务',
        icon: 'Grid',
        accountTypes: operatorAccountTypes,
        menuCode: MENU_CODE.operatorBusiness,
      },
      children: [
        {
          path: 'user',
          name: 'OperatorUserManagement',
          component: () => import('@/views/platform/user/index.vue'),
          meta: {
            title: '用户管理',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.operatorUserView],
            menuCode: MENU_CODE.operatorUser,
          },
        },
        {
          path: 'enterprise-audit',
          name: 'OperatorEnterpriseAudit',
          component: () => import('@/views/platform/enterprise-audit/index.vue'),
          meta: {
            title: '企业/机构审核',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.operatorEnterpriseAuditView],
            menuCode: MENU_CODE.operatorEnterpriseAudit,
          },
        },
        {
          path: 'enterprise-audit/:id',
          name: 'OperatorEnterpriseAuditDetail',
          component: () => import('@/views/platform/enterprise-audit/detail.vue'),
          meta: {
            title: '企业/机构审核详情',
            hidden: true,
            activeMenu: '/operator/business/enterprise-audit',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.operatorEnterpriseAuditView],
          },
        },
        {
          path: 'demand',
          name: 'OperatorDemandManagement',
          component: () => import('@/views/platform/demand/index.vue'),
          meta: {
            title: '需求管理',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.operatorDemandView],
            menuCode: MENU_CODE.operatorDemand,
          },
        },
        {
          path: 'consult',
          name: 'OperatorConsultManagement',
          component: () => import('@/views/platform/consult/index.vue'),
          meta: {
            title: '咨询管理',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.operatorConsultView],
            menuCode: MENU_CODE.operatorConsult,
          },
        },
        {
          path: 'order',
          name: 'OperatorOrderManagement',
          component: () => import('@/views/platform/order/index.vue'),
          meta: {
            title: '订单管理',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.operatorOrderView],
            menuCode: MENU_CODE.operatorOrder,
          },
        },
        {
          path: 'order/:id',
          name: 'OperatorOrderDetail',
          component: () => import('@/views/platform/order/detail.vue'),
          meta: {
            title: '订单详情',
            hidden: true,
            activeMenu: '/operator/business/order',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.operatorOrderView],
          },
        },
        {
          path: 'report',
          name: 'OperatorReportManagement',
          component: () => import('@/views/platform/report/index.vue'),
          meta: {
            title: '报告管理',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.operatorReportView],
            menuCode: MENU_CODE.operatorReport,
          },
        },
        {
          path: 'report/:id',
          name: 'OperatorReportDetail',
          component: () => import('@/views/platform/report/detail.vue'),
          meta: {
            title: '报告详情',
            hidden: true,
            activeMenu: '/operator/business/report',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.operatorReportView],
          },
        },
        {
          path: 'comment',
          name: 'OperatorCommentManagement',
          component: () => import('@/views/platform/comment/index.vue'),
          meta: {
            title: '评价管理',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.operatorCommentView],
            menuCode: MENU_CODE.operatorComment,
          },
        },
        {
          path: 'message',
          name: 'OperatorMessageManagement',
          component: () => import('@/views/platform/message/index.vue'),
          meta: {
            title: '消息中心',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.operatorMessageView],
            menuCode: MENU_CODE.operatorMessage,
          },
        },
      ],
    },
    {
      path: 'community',
      name: 'OperatorCommunityGroup',
      component: RouteGroupView,
      meta: {
        title: '质量社区',
        icon: 'Reading',
        accountTypes: operatorAccountTypes,
      },
      children: [
        {
          path: 'news',
          name: 'OperatorCommunityNews',
          component: () => import('@/views/platform/community/article/index.vue'),
          meta: {
            title: '资讯管理',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.contentManageView],
          },
        },
        {
          path: 'news/detail/:id',
          name: 'OperatorCommunityNewsDetail',
          component: () => import('@/views/platform/community/article/detail.vue'),
          meta: {
            title: '资讯详情',
            hidden: true,
            activeMenu: '/operator/community/news',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.contentManageView],
          },
        },
        {
          path: 'qa',
          name: 'OperatorCommunityQa',
          component: () => import('@/views/platform/community/question/index.vue'),
          meta: {
            title: '问答管理',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.contentManageView],
          },
        },
        {
          path: 'qa/detail/:id',
          name: 'OperatorCommunityQaDetail',
          component: () => import('@/views/platform/community/question/detail.vue'),
          meta: {
            title: '问答详情',
            hidden: true,
            activeMenu: '/operator/community/qa',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.contentManageView],
          },
        },
        {
          path: 'experts',
          name: 'OperatorCommunityExperts',
          component: () => import('@/views/platform/community/expert/index.vue'),
          meta: {
            title: '专家管理',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.contentManageView],
          },
        },
        {
          path: 'experts/detail/:id',
          name: 'OperatorCommunityExpertsDetail',
          component: () => import('@/views/platform/community/expert/detail.vue'),
          meta: {
            title: '专家详情',
            hidden: true,
            activeMenu: '/operator/community/experts',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.contentManageView],
          },
        },
        {
          path: 'preview/news',
          name: 'OperatorCommunityNewsPreview',
          component: () => import('@/views/community/article/index.vue'),
          meta: {
            title: '资讯中心预览',
            hidden: true,
            activeMenu: '/operator/community/news',
            accountTypes: operatorAccountTypes,
          },
        },
        {
          path: 'preview/news/:id',
          name: 'OperatorCommunityNewsPreviewDetail',
          component: () => import('@/views/community/article/detail.vue'),
          meta: {
            title: '资讯详情预览',
            hidden: true,
            activeMenu: '/operator/community/news',
            accountTypes: operatorAccountTypes,
          },
        },
        {
          path: 'preview/qa',
          name: 'OperatorCommunityQaPreview',
          component: () => import('@/views/community/question/index.vue'),
          meta: {
            title: '社区问答预览',
            hidden: true,
            activeMenu: '/operator/community/qa',
            accountTypes: operatorAccountTypes,
          },
        },
        {
          path: 'preview/qa/:id',
          name: 'OperatorCommunityQaPreviewDetail',
          component: () => import('@/views/community/question/detail.vue'),
          meta: {
            title: '问答详情预览',
            hidden: true,
            activeMenu: '/operator/community/qa',
            accountTypes: operatorAccountTypes,
          },
        },
        {
          path: 'preview/experts',
          name: 'OperatorCommunityExpertsPreview',
          component: () => import('@/views/community/expert/index.vue'),
          meta: {
            title: '专家在线预览',
            hidden: true,
            activeMenu: '/operator/community/experts',
            accountTypes: operatorAccountTypes,
          },
        },
        {
          path: 'preview/experts/:id',
          name: 'OperatorCommunityExpertsPreviewDetail',
          component: () => import('@/views/community/expert/detail.vue'),
          meta: {
            title: '专家详情预览',
            hidden: true,
            activeMenu: '/operator/community/experts',
            accountTypes: operatorAccountTypes,
          },
        },
      ],
    },
    {
      path: 'system',
      name: 'OperatorSystemGroup',
      component: RouteGroupView,
      meta: {
        title: '系统配置',
        icon: 'Setting',
        accountTypes: operatorAccountTypes,
        menuCode: MENU_CODE.operatorSystem,
      },
      children: [
        {
          path: 'role',
          name: 'OperatorRoleManagement',
          component: () => import('@/views/platform/system/role/index.vue'),
          meta: {
            title: '角色权限',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.operatorRoleView],
            menuCode: MENU_CODE.operatorRole,
          },
        },
        {
          path: 'workflow',
          name: 'OperatorWorkflowManagement',
          component: () => import('@/views/platform/workflow/template/index.vue'),
          meta: {
            title: '流程规则',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.operatorWorkflowView],
            menuCode: MENU_CODE.operatorWorkflow,
          },
        },
        {
          path: 'base-config',
          name: 'OperatorBaseConfig',
          component: () => import('@/views/common/RoutePlaceholder.vue'),
          meta: {
            title: '基础配置',
            accountTypes: operatorAccountTypes,
            permissions: [PERMISSION_CODE.operatorBaseConfigView],
            menuCode: MENU_CODE.operatorBaseConfig,
          },
        },
      ],
    },
    {
      path: 'profile',
      name: 'OperatorProfile',
      component: () => import('@/views/platform/profile/index.vue'),
      meta: {
        title: '账号设置',
        hidden: true,
        accountTypes: operatorAccountTypes,
      },
    },
  ],
}
