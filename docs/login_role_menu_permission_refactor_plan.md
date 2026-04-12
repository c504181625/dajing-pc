# 登录体系 + 角色模型 + 后台菜单权限体系重构方案

本方案以当前仓库为基线，按“增量改造、优先复用已有后台页面和线稿”的原则整理。

## 1. 需要修改的前端页面清单

已修改：

- `src/views/auth/login/index.vue`
- `src/views/common/account-settings/index.vue`
- `src/views/merchant/enterprise/index.vue`
- `src/views/merchant/demand/index.vue`
- `src/views/merchant/order/index.vue`
- `src/views/personal/profile/index.vue`
- `src/views/merchant/dashboard/index.vue`
- `src/layout/components/Topbar.vue`
- `src/views/platform/user/index.vue`
- `src/views/platform/system/role/index.vue`
- `src/views/common/RedirectHome.vue`

优先复用、当前无需重做：

- `src/views/platform/dashboard/index.vue`
- `src/views/platform/enterprise-audit/index.vue`
- `src/views/platform/enterprise-audit/detail.vue`
- `src/views/platform/demand/index.vue`
- `src/views/platform/consult/index.vue`
- `src/views/platform/order/index.vue`
- `src/views/platform/order/detail.vue`
- `src/views/platform/report/index.vue`
- `src/views/platform/report/detail.vue`
- `src/views/platform/comment/index.vue`
- `src/views/platform/message/index.vue`
- `src/views/merchant/report/index.vue`
- `src/views/merchant/message/index.vue`
- `src/views/merchant/service/index.vue`
- `src/views/merchant/order-receive/index.vue`

## 2. 需要修改的前端路由清单

已修改：

- `src/router/routes.ts`
- `src/router/guard.ts`
- `src/router/modules/platform.ts`
- `src/router/modules/enterprise.ts`
- `src/router/modules/personal.ts`
- `src/types/router.d.ts`

兼容性补充：

- 保留 `/platform/* -> /operator/*` 兼容跳转
- 保留 `/system/* -> /operator/system/*` 兼容跳转
- 保留 `/enterprise/enterprise`、`/enterprise/demand-publish` 等旧企业路由到新结构的兼容跳转

## 3. operator / enterprise / personal 三套最终菜单树

### operator

- 总览
- 工作台
- 平台业务
- 用户管理
- 企业/机构审核
- 需求管理
- 咨询管理
- 订单管理
- 报告管理
- 评价管理
- 消息中心
- 系统配置
- 角色权限
- 流程规则
- 基础配置

### enterprise

- 工作台
- 企业资料
- 需求管理
- 订单管理
- 报告管理
- 消息中心
- 账号设置

当 `enterpriseTags` 包含 `provider` 时追加：

- 服务能力管理
- 服务项目管理
- 接单管理
- 资质与认证

### personal

- 工作台
- 我的需求
- 我的订单
- 消息中心
- 个人资料
- 企业升级

## 4. 哪些菜单直接复用现有页面

| 菜单 | 复用页面 |
| --- | --- |
| operator 工作台 | `src/views/platform/dashboard/index.vue` |
| operator 用户管理 | `src/views/platform/user/index.vue` |
| operator 企业/机构审核 | `src/views/platform/enterprise-audit/index.vue` |
| operator 审核详情 | `src/views/platform/enterprise-audit/detail.vue` |
| operator 需求管理 | `src/views/platform/demand/index.vue` |
| operator 咨询管理 | `src/views/platform/consult/index.vue` |
| operator 订单管理 | `src/views/platform/order/index.vue` |
| operator 报告管理 | `src/views/platform/report/index.vue` |
| operator 评价管理 | `src/views/platform/comment/index.vue` |
| operator 消息中心 | `src/views/platform/message/index.vue` |
| operator 角色权限 | `src/views/platform/system/role/index.vue` |
| operator 流程规则 | `src/views/platform/workflow/template/index.vue` |
| enterprise 工作台 | `src/views/merchant/dashboard/index.vue` |
| enterprise 企业资料 | `src/views/merchant/enterprise/index.vue` |
| enterprise 需求管理 | `src/views/merchant/demand/index.vue` |
| enterprise 订单管理 | `src/views/merchant/order/index.vue` |
| enterprise 报告管理 | `src/views/merchant/report/index.vue` |
| enterprise 消息中心 | `src/views/merchant/message/index.vue` |
| enterprise 服务项目管理 | `src/views/merchant/service/index.vue` |
| enterprise 接单管理 | `src/views/merchant/order-receive/index.vue` |
| personal 我的需求 | `src/views/merchant/demand/index.vue` |
| personal 我的订单 | `src/views/merchant/order/index.vue` |
| personal 消息中心 | `src/views/merchant/message/index.vue` |

## 5. 哪些页面仅需改字段和操作权限

- 登录页：删除角色切换，改为统一登录三 Tab，并补“适用对象”说明
- 企业资料页：按路由模式切换为“企业资料 / 服务能力管理 / 资质与认证”
- 企业需求页：按 `pageMode` 与 `accountType` 区分个人视角、企业需求方视角、服务方处理视角
- 企业订单页：按 `pageMode` 区分个人 / 企业统一列表标题与默认详情跳转
- 用户管理页：增加企业认证、绑定主体、服务提供能力等字段展示
- 角色权限页：保留四块结构，语义改为 `accountType + enterpriseTags + permissionCodes`

## 6. 哪些页面需要最小化新增

- 通用账号设置页
  - `src/views/common/account-settings/index.vue`
  - 用于 personal/enterprise 共用
- operator 基础配置页暂使用占位承接
  - `src/views/common/RoutePlaceholder.vue`
  - 后续如接入真实基础配置页面，可直接替换组件，不改菜单结构

## 7. 需要修改的后端接口清单

建议新增或兼容调整：

- `POST /auth/login/password`
  - 输入：`account + password`
  - 输出：统一登录响应
- `POST /auth/login/mobile`
  - 输入：`mobile + code`
  - 输出：统一登录响应
- `POST /auth/login/credit-code`
  - 输入：`unifiedSocialCreditCode + password`
  - 兼容：后端暂不支持时，可内部转为 `creditCode + mobile + code`
- `GET /auth/current-user`
  - 返回当前登录用户的 `accountType / enterpriseTags / permissionCodes / menuCodes / homeRoute`
- `GET /system/user/page`
  - 用户管理补充企业认证字段、服务提供能力字段
- `GET /enterprise/profile`
  - 支持企业资料 / 服务能力 / 资质认证复用
- `PUT /enterprise/profile`
  - 支持最小改动更新字段
- `POST /enterprise/profile/submit`
  - 兼容“提交认证 / 提交变更审核”
- `GET /user/enterprise-upgrade/summary`
  - 返回个人升级企业进度
- `POST /user/enterprise-upgrade`
  - 支持提交企业升级申请

统一登录响应建议：

```json
{
  "token": "...",
  "accountId": "...",
  "accountType": "personal | enterprise | operator",
  "enterpriseTags": ["demander", "provider"],
  "permissionCodes": [],
  "menuCodes": [],
  "homeRoute": "/enterprise/dashboard"
}
```

## 8. 需要调整的数据结构清单

推荐最终表结构：

- `account`
  - `account_id`
  - `account_type`
- `enterprise`
  - `enterprise_id`
  - `account_id`
  - `company_name`
  - `unified_social_credit_code`
  - `enterprise_verified`
  - `provider_verified`
- `enterprise_role_tags`
  - `id`
  - `enterprise_id`
  - `tag_code`
- `menu_permission`
  - `menu_code`
  - `route_path`
  - `title`
- `role_permission`
  - `role_code`
  - `permission_code`
- `account_menu_permission`
  - `account_type`
  - `tag_code`
  - `menu_code`

兼容旧字段建议：

- `platform_admin -> operator`
- `service_provider -> provider`

## 9. 菜单与 accountType / enterpriseTags / permissionCodes 映射表

| 后台 | accountType | enterpriseTags | menuCodes | permissionCodes |
| --- | --- | --- | --- | --- |
| operator 工作台 | `operator` | `[]` | `operator.dashboard` | `operator:dashboard:view` |
| operator 用户管理 | `operator` | `[]` | `operator.user` | `operator:user:view` |
| operator 企业/机构审核 | `operator` | `[]` | `operator.enterprise-audit` | `operator:enterprise-audit:view` |
| operator 系统配置 | `operator` | `[]` | `operator.system.*` | `operator:role:view` / `operator:workflow:view` / `operator:base-config:view` |
| enterprise 基础菜单 | `enterprise` | `demander` 默认具备 | `enterprise.dashboard/profile/demand/order/report/message/account-settings` | 对应 `enterprise:*:view` |
| enterprise provider 增强菜单 | `enterprise` | `provider` | `enterprise.service-capability/service-project/order-receive/qualification` | 对应 provider 增强权限 |
| personal 菜单 | `personal` | `[]` | `personal.dashboard/demand/order/message/profile/enterprise-upgrade` | 对应 `personal:*` |

## 10. 登录成功后的时序流程

1. 前端调用统一登录接口
2. 后端识别账号主体并返回 `token + accountType + enterpriseTags + permissionCodes + menuCodes + homeRoute`
3. 前端保存 token
4. 前端标准化兼容字段
   - `platform_admin -> operator`
   - `service_provider -> provider`
5. 前端生成动态路由
6. 前端按 `menuCodes` 过滤菜单
7. 前端按 `permissionCodes` 控制路由访问和按钮权限
8. 前端跳转 `homeRoute`
9. 进入对应后台工作台

## 11. 前端菜单生成伪代码

```ts
const routeTree = asyncRoutes

function buildMenus(user) {
  return filterRoutes(routeTree, (route) => {
    if (route.meta?.accountTypes && !route.meta.accountTypes.includes(user.accountType)) {
      return false
    }

    if (route.meta?.enterpriseTags?.length) {
      if (!route.meta.enterpriseTags.some((tag) => user.enterpriseTags.includes(tag))) {
        return false
      }
    }

    if (route.meta?.menuCode && !user.menuCodes.includes(route.meta.menuCode)) {
      return false
    }

    if (route.meta?.permissions?.length) {
      if (!route.meta.permissions.some((code) => user.permissionCodes.includes(code))) {
        return false
      }
    }

    return true
  })
}
```

## 12. 前端路由守卫伪代码

```ts
router.beforeEach(async (to) => {
  if (!token) {
    if (whiteList.includes(to.path)) return true
    return `/login?redirect=${to.fullPath}`
  }

  if (!userStore.userLoaded) {
    await userStore.fetchCurrentUser()
  }

  if (!permissionStore.isRoutesGenerated) {
    permissionStore.mountRoutes(router, userStore.userInfo)
    return to.fullPath
  }

  if (!canAccessRoute(to, userStore.userInfo)) {
    return '/401'
  }

  return true
})
```

## 13. 按钮权限控制伪代码

```ts
function hasPermission(code: string | string[]) {
  const list = Array.isArray(code) ? code : [code]
  return list.some((item) => user.permissionCodes.includes(item) || user.permissionCodes.includes('*:*:*'))
}

// template
<PermissionButton permission="enterprise:qualification:submit">
  提交认证
</PermissionButton>
```

## 14. 登录后默认路由分发伪代码

```ts
function resolveHomeRoute(user) {
  if (user.homeRoute) return user.homeRoute
  if (user.accountType === 'operator') return '/operator/dashboard'
  if (user.accountType === 'enterprise') return '/enterprise/dashboard'
  return '/personal/dashboard'
}
```

## 15. enterprise 中 provider 标签叠加时的菜单合并规则

规则：

- enterprise 默认至少拥有 `demander`
- `provider` 不是替换，而是叠加
- 基础菜单始终保留
- 仅对 provider 追加增强菜单
- 不切后台，不切 Layout，不切默认首页

伪代码：

```ts
const enterpriseBaseMenus = [
  'enterprise.dashboard',
  'enterprise.profile',
  'enterprise.demand',
  'enterprise.order',
  'enterprise.report',
  'enterprise.message',
  'enterprise.account-settings',
]

const providerMenus = [
  'enterprise.service-capability',
  'enterprise.service-project',
  'enterprise.order-receive',
  'enterprise.qualification',
]

const finalMenus = user.enterpriseTags.includes('provider')
  ? [...enterpriseBaseMenus, ...providerMenus]
  : enterpriseBaseMenus
```

## 16. 如何在不大改现有页面路由的前提下完成本次改造

本仓库已采取的策略：

- 页面组件继续复用原 `platform`、`merchant`、`personal` 目录
- 路由层把 `platform -> operator`
- 企业后台不再拆 demander/provider 两套菜单，只通过 `enterpriseTags` 增量开放功能
- 保留旧路径兼容跳转，避免已写好的工作台快捷入口全部失效
- 业务页主要通过 `pageMode`、`menuCode`、`permissionCodes` 做差异化，不重写整页

## 17. 现有页面不足时的最小改动方案

优先级从高到低：

- 先改字段和文案
- 再改按钮权限和数据范围
- 再通过 `pageMode` 在同一页面内切换展示
- 再新增一个通用小页承接缺口
- 最后才考虑新增整套页面

当前最小改动实践：

- `账号设置` 新增为一个通用页，而不是 personal/enterprise 各做一套
- `服务能力管理 / 资质与认证` 直接复用企业资料页
- `我的需求 / 我的订单` 直接复用企业列表页，只改标题和数据范围表达
- operator 基础配置先挂占位组件，不阻塞菜单与权限体系重构
