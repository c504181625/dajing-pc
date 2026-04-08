# 质量创新中心平台（一期）前端实施方案

## A. 最终技术选型

### 1. PC 组件库选择
- 选择 `Element Plus`
- 原因一：中后台场景成熟，表格、表单、抽屉、树、上传、描述列表、时间线、权限按钮封装都很顺手
- 原因二：团队常见、资料多、维护成本低，适合一期快速落地
- 原因三：与 Vue 3 + TypeScript 配合稳定，适合多人协作和长期演进
- 不选择 Vant：移动端风格明显，不适合企业 PC 后台

### 2. 完整技术栈
- 框架：Vue 3
- 语言：TypeScript
- 构建：Vite
- 状态管理：Pinia
- 路由：Vue Router
- HTTP：Axios
- 图表：ECharts
- UI：Element Plus
- 图标：`@element-plus/icons-vue`
- 样式：SCSS
- 进度条：NProgress
- 本地持久化：`pinia-plugin-persistedstate`

### 3. 依赖安装建议
```bash
npm install element-plus @element-plus/icons-vue axios echarts sass nprogress pinia-plugin-persistedstate
```

### 4. 当前工程已落地依赖
- 已在 `package.json` 中补齐上述依赖
- 已移除 `vite-plugin-vue-devtools`，避免正式后台骨架受 Vite 版本兼容影响

## B. 系统信息架构

### 1. 平台运营后台菜单树
- 工作台
- 企业审核管理
- 用户管理
- 需求管理
- 检验检测订单管理
- 报告管理
- 评价管理
- 内容资讯管理
- 社区审核管理
- 统计报表
- 系统设置
- 角色权限管理
- 基础数据维护
- 服务项目管理
- 流程模板管理
- 工作流节点管理
- 更多系统配置

### 2. 企业 / 商户后台菜单树
- 企业工作台
- 企业信息管理
- 我的订单
- 我的报告
- 消息中心
- 子账号管理
- 评价反馈

### 3. 共用页面
- 登录页
- 401 / 404 页面
- 路由占位页
- 消息中心
- 文件预览
- 附件上传
- 个人账户相关能力

### 4. 按角色隔离页面
- 平台端独占：企业审核、平台需求池、全局订单监管、全局报告监管、角色权限、基础数据、流程模板
- 企业端独占：企业工作台、企业资料维护、我的订单、我的报告、子账号
- 同页面不同视图：消息中心、部分订单详情、部分报告详情

### 5. 一期必须做 / 预留
- 一期必须做：登录、平台工作台、企业审核、用户管理、需求管理、订单管理、报告管理、角色权限、企业工作台、企业信息、我的订单、我的报告
- 一期建议做：评价管理、内容资讯、社区审核、基础数据维护、服务项目管理、消息中心、子账号管理
- 一期预留但不深做：统计报表、流程模板、工作流节点、更多系统配置

## C. 权限模型设计

### 1. RBAC 角色模型
- 超级管理员：全量菜单、全量按钮、全量企业数据
- 平台运营管理员：平台业务菜单 + 配置菜单 + 跨企业监管
- 审核员：企业审核、报告审核、部分订单查看
- 企业用户（需求方）：本企业需求、订单、报告、消息
- 企业用户（基础服务方）：本企业接单、需求响应、消息
- 企业用户（检测机构方）：本企业订单、检测进度、报告
- 企业子账号：在企业主账号授权范围内使用

### 2. 菜单权限
- 由角色决定可访问路由模块
- 使用 `route.meta.roles` 进行动态过滤
- 当前已落地于 `src/router/modules/*.ts` 与 `src/store/modules/permission.ts`

### 3. 按钮权限
- 使用统一编码规范：`模块:资源:动作`
- 示例：`audit:enterprise:approve`、`user:manage:view`
- 已落地两种方式：
- 组件方式：`src/components/PermissionButton.vue`
- 指令方式：`v-permission`，位于 `src/directives/permission.ts`

### 4. 数据权限
- 数据范围不放前端做最终裁决，前端只做展示和参数透传
- 推荐后端统一返回 `dataScopes`
- 建议枚举：
- `ALL`
- `ENTERPRISE_SELF`
- `ENTERPRISE_CHILD`
- `ASSIGNED_ENTERPRISE`
- `SELF`
- 当前类型已定义在 `src/types/auth.ts`

### 5. 路由动态加载方案
- 常量路由：登录、首页重定向、401、404
- 异步路由：平台端、企业端、系统设置
- 登录后根据当前用户角色过滤异步路由
- 首次进入时通过守卫动态 `addRoute`
- 已落地文件：
- `src/router/routes.ts`
- `src/router/guard.ts`
- `src/store/modules/permission.ts`

### 6. 企业数据隔离方案
- 企业端所有查询必须透传 `enterpriseId`
- 前端列表页禁止提供切换企业入口
- 企业端首页、订单、报告、消息均只读取当前登录企业上下文
- 企业主账号与子账号共享企业边界，但按钮权限可细分

### 7. 平台管理员跨企业查看方案
- 平台管理员数据范围支持：
- 全部企业
- 指派企业
- 指定企业集合
- 前端筛选项允许按企业名称、统一社会信用代码、机构类型检索
- 详情页提供企业摘要卡，便于跨企业监管

## D. 前端工程结构设计

```text
src
├─ api
│  ├─ mock.ts
│  └─ modules
├─ components
├─ components-business
├─ constants
├─ directives
├─ enum
├─ hooks
├─ layout
├─ router
│  └─ modules
├─ store
│  └─ modules
├─ styles
├─ types
├─ utils
└─ views
```

### 目录职责
- `api`：接口分层与模块化 API，当前同时提供 mock 数据
- `components`：与业务无强绑定的通用组件
- `components-business`：审核、企业信息、附件、订单时间线等业务组件
- `constants`：字典、静态选项、演示账号
- `directives`：权限等全局指令
- `enum`：状态枚举，统一审核态、订单态、报告态
- `hooks`：权限等可复用组合式能力
- `layout`：后台基础壳、头部、侧栏、菜单
- `router`：常量路由、动态路由、守卫
- `store`：用户态、权限态
- `styles`：全局变量、页面基础样式
- `types`：API、权限、业务实体类型
- `utils`：请求封装、token 处理
- `views`：页面层，按平台端 / 企业端 / 系统端拆分

## E. 页面清单与优先级拆分

### P0
- 登录页
- 平台工作台首页
- 企业审核管理列表
- 企业审核详情页
- 用户管理
- 需求管理
- 订单管理
- 报告管理
- 角色权限管理
- 企业工作台首页
- 企业信息管理
- 我的订单
- 我的报告

### P1
- 评价管理
- 内容资讯管理
- 社区审核管理
- 基础数据维护
- 服务项目管理
- 消息中心
- 子账号管理

### P2
- 统计报表
- 流程模板管理
- 工作流节点管理
- 更多系统配置

### 页面设计摘要

#### 登录页
- 用途：统一承接账号密码、手机号、邮箱三类登录
- 关键字段：账号、密码、手机号、验证码、邮箱
- 关键交互：Tab 切换登录方式、登录成功按角色重定向
- 列表筛选项：无
- 操作按钮：登录、演示账号快捷填充
- 交互形态：整页

#### 平台工作台
- 用途：看待办、风险、订单趋势、重点订单
- 关键字段：待审核企业数、处理中需求数、检测中订单数、待发布报告数
- 关键交互：卡片点击跳转、趋势图查看、重点订单跟踪
- 操作按钮：进入审核、进入订单
- 交互形态：卡片 + 图表 + 表格

#### 企业审核管理列表
- 用途：审核任务池
- 关键字段：企业名称、统一社会信用代码、服务类型、审核状态、提交时间
- 关键交互：筛选、查看详情、去审核
- 典型筛选项：企业关键字、状态、服务类型、提交时间
- 操作按钮：查看详情、审核、导出
- 交互形态：搜索表单 + 表格

#### 企业审核详情页
- 用途：审核闭环处理
- 关键字段：企业基础信息、营业执照、资质列表、审核记录、审核意见
- 关键交互：附件预览、通过、驳回、要求补件
- 操作按钮：审核通过、驳回、要求补充材料
- 交互形态：新页面、右侧审核操作卡、下方时间线

#### 需求管理页
- 用途：平台统一管理基础服务需求与检验检测需求入口
- 关键字段：需求标题、服务类型、对接模式、机构、状态
- 关键交互：分配机构、查看需求详情、转订单
- 典型筛选项：服务类型、状态、企业名称、对接模式
- 操作按钮：分配、关闭、查看
- 交互形态：列表为主，详情可抽屉

#### 检验检测订单管理页
- 用途：一期核心流程监管页
- 关键字段：订单号、需求企业、检测机构、项目名称、订单状态、金额、报告编号
- 关键交互：查看进度、查看附件、查看报告、退款跟踪
- 典型筛选项：订单号、企业、机构、状态、创建时间
- 操作按钮：查看详情、催办、导出
- 交互形态：列表 + 独立详情页

#### 报告管理页
- 用途：报告检索、状态跟踪、预览下载
- 关键字段：报告编号、订单号、项目名称、状态、发布时间
- 关键交互：预览、下载、作废、重新发布
- 典型筛选项：报告编号、状态、订单号、企业名称
- 操作按钮：预览、下载、作废
- 交互形态：列表 + 文件预览

#### 企业工作台
- 用途：企业查看本企业订单、报告、提醒
- 关键字段：本月订单数、检测中项目数、待上传报告数、消息数
- 关键交互：卡片跳转、查看订单分布、进入报告
- 操作按钮：查看订单、查看报告
- 交互形态：卡片 + 饼图 + 表格

#### 企业订单详情页
- 用途：企业跟踪单笔订单全流程
- 关键字段：样品信息、收样信息、附件、时间线、报告编号
- 关键交互：查看时间线、预览附件、下载报告
- 操作按钮：查看附件、返回列表
- 交互形态：新页面，左信息右时间线

## F. 通用业务组件设计

### `PageContainer`
- 场景：所有页面容器
- Props：`title`、`subtitle`
- 事件：无
- 插槽：`default`、`extra`

### `SearchForm`
- 场景：通用列表检索区
- Props：`modelValue`、`fields`
- 事件：`update:modelValue`、`search`、`reset`
- 插槽：`actions`

### `TablePanel`
- 场景：表格卡片容器
- Props：`title`、`description`
- 事件：无
- 插槽：`default`、`toolbar`

### `AuditActionBar`
- 场景：审核详情右侧操作区
- Props：`loading`、`disabled`
- 事件：`approve`、`reject`、`supplement`
- 插槽：无

### `EnterpriseQualificationCard`
- 场景：企业资质列表展示
- Props：`qualifications`
- 事件：无
- 插槽：无

### `AttachmentUploader`
- 场景：营业执照、资质证书、样品附件上传
- Props：`modelValue`、`limit`
- 事件：`update:modelValue`
- 插槽：使用 Element Plus 默认插槽扩展即可

### `FilePreview`
- 场景：PDF / 图片 / Office 文件预览入口
- Props：`visible`、`files`
- 事件：`update:visible`
- 插槽：无

### `StatusTag`
- 场景：审核态、订单态、报告态统一展示
- Props：`status`、`map`
- 事件：无
- 插槽：无

### `DictTag`
- 场景：服务类型、字典值展示
- Props：`value`、`options`
- 事件：无
- 插槽：无

### `OrderTimeline`
- 场景：订单流程状态流展示
- Props：`nodes`
- 事件：无
- 插槽：无

### `PermissionButton`
- 场景：按钮级权限控制
- Props：`permission`、`type`、`plain`、`text`、`size`、`disabled`
- 事件：`click`
- 插槽：`default`

### `MessageBadge`
- 场景：头部消息提醒角标
- Props：`value`
- 事件：无
- 插槽：`default`

### `EnterpriseSummaryCard`
- 场景：企业审核详情摘要区
- Props：`detail`
- 事件：无
- 插槽：无

## G. 核心页面原型与布局方案

### 1. 登录页
- 两栏布局
- 左侧：产品定位、业务特点、版本说明
- 右侧：登录卡片
- 推荐使用整页，不使用弹窗

### 2. 平台工作台首页
- 上区：4 个指标卡
- 下区左侧：订单趋势图
- 下区右侧：重点订单表
- 目标是“先看风险，再进业务页”

### 3. 企业审核管理列表页
- 上方检索卡
- 下方表格卡
- 详情不建议抽屉，建议独立页面

### 4. 企业审核详情页
- 左 16 / 右 8 双栏
- 左侧：企业摘要、服务范围、资质、附件
- 右侧：审核操作条、审核记录时间线
- 审核页推荐新页面，不推荐抽屉
- 附件预览建议弹窗或新窗口

### 5. 需求管理页
- 标准列表页
- 列表为主，轻详情可用抽屉
- 深操作建议跳转详情页

### 6. 检验检测订单管理页
- 列表页承担筛选与监管
- 详情页承担状态闭环
- 状态流建议用时间线 + 当前阶段高亮

### 7. 报告管理页
- 列表为主
- 文件预览建议弹窗 / 新窗口结合
- 文件状态与订单状态不要混用颜色语义

### 8. 企业工作台首页
- 卡片 + 图表 + 最近订单 / 报告列表
- 所有信息必须限定在当前企业

### 9. 企业订单详情页
- 左侧订单信息与附件
- 右侧订单时间线
- 建议独立详情页，不用抽屉
- 这样更适合后续补物流、寄样、付款、退款、报告版本

## H. API 分层规范与 TypeScript 类型设计

### API 模块
- `auth`
- `user`
- `enterprise`
- `audit`
- `demand`
- `consult`
- `order`
- `report`
- `comment`
- `content`
- `dictionary`
- `workflow`
- `system`

### 已落地类型文件
- `src/types/api.ts`
- `src/types/auth.ts`
- `src/types/business.ts`

### 类型示例
```ts
export interface PageResult<T> {
  list: T[]
  pageNum: number
  pageSize: number
  total: number
}

export interface AuditActionPayload {
  auditId: string
  action: 'approve' | 'reject' | 'supplement'
  remark: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn: number
  user: CurrentUser
}

export interface CurrentUser {
  id: string
  name: string
  roles: RoleCode[]
  permissions: string[]
  dataScopes: DataScope[]
  enterpriseId?: string
}
```

## I. 项目初始化代码骨架

### 已落地骨架文件
- `src/main.ts`
- `src/App.vue`
- `src/router/index.ts`
- `src/router/guard.ts`
- `src/router/routes.ts`
- `src/router/modules/platform.ts`
- `src/router/modules/enterprise.ts`
- `src/router/modules/system.ts`
- `src/store/modules/user.ts`
- `src/store/modules/permission.ts`
- `src/utils/request.ts`
- `src/layout/index.vue`
- `src/views/platform/enterprise-audit/index.vue`
- `src/views/platform/enterprise-audit/detail.vue`
- `src/components/PermissionButton.vue`
- `src/directives/permission.ts`

### 当前骨架特点
- 全部为 `script setup + TypeScript`
- Element Plus 风格
- 已具备登录、权限、菜单、布局、示例页面、mock 数据
- 团队可以直接在模块目录继续扩页面

## J. 后台 UI 风格规范建议

### 布局风格
- 左侧深色导航 + 顶部白色工具条 + 内容区浅灰底
- 保持标准后台感，不做营销化大插画

### 颜色建议
- 主色：稳重蓝 `#1F5EFF`
- 成功：`#18A058`
- 警告：`#F0A020`
- 危险：`#D03050`
- 页面背景：`#F5F7FA`

### 表格页规范
- 固定“搜索区 + 表格区”结构
- 表格卡片化，少用复杂阴影
- 列操作不超过 3 个常驻按钮

### 表单页规范
- 单列或双列栅格
- 必填项、上传项、审批意见区域分组
- 编辑页和只读详情页视觉层级要明显区分

### 详情页规范
- 建议使用描述列表 + 分组卡片
- 关键状态放在右上角，不埋在正文

### 审核页规范
- 审核操作固定在右侧
- 审核记录使用时间线
- 附件统一从附件预览入口打开

### 间距与栅格
- 页面外边距：20
- 卡片间距：16
- 栅格优先 24 制
- 大表单建议宽度控制在 720 到 960 之间

### 图标建议
- 全站优先 Element Plus Icons
- 菜单图标要稳定、易识别，不堆花哨图标

### 首页卡片布局建议
- 平台端：4 指标卡 + 1 图表 + 1 重点表
- 企业端：4 指标卡 + 订单分布 + 最近订单 / 报告

## K. 风险点与最佳实践

- 管理员端和企业端共后台时，最大风险是“同页不同角色共用接口但未正确带数据范围参数”
- 企业数据隔离必须以后端鉴权为准，前端只辅助，不可只靠前端隐藏菜单
- 审核状态、订单状态、报告状态必须拆枚举，不能共用一个 `status`
- 多登录方式需要尽早和后端对齐账号归并规则、绑定关系和唯一性校验
- 附件上传必须统一文件结构：`id/name/url/fileType/size`
- 流程配置即使一期不做，也要预留模块与路由，避免二期整体重构
- 列表页应统一成 SearchForm + TablePanel 模式，避免团队风格失控
- API 返回格式和分页结构必须统一，否则 TS 类型会迅速失效
- ECharts 默认打包较重，建议二期按图表类型做按需拆分

## L. 两周冲刺的前端任务拆解

### 第 1 周目标
- 搭建可运行后台基础骨架
- 完成登录、权限、布局、路由、全局样式
- 完成平台工作台、企业审核列表/详情、角色权限管理的前端页面骨架

### 第 2 周目标
- 完成需求管理、订单管理、报告管理、企业工作台、企业信息、我的订单、我的报告
- 抽离通用业务组件并固化页面规范
- 与后端对齐接口字段，逐步替换 mock

### 任务拆分建议
- A 同学：框架层
- 负责布局、路由、权限、请求封装、Pinia、全局组件
- B 同学：平台业务页
- 负责工作台、企业审核、需求管理、订单管理、报告管理
- C 同学：企业业务页
- 负责企业工作台、企业信息、我的订单、我的报告
- D 同学：通用业务组件
- 负责 SearchForm、TablePanel、StatusTag、AuditActionBar、FilePreview、OrderTimeline

### 可先 mock 的接口
- 登录接口
- 当前用户信息
- 企业审核列表 / 详情 / 审核动作
- 订单列表 / 详情
- 报告列表
- 工作台汇总指标

### 必须尽早与后端对齐的内容
- 用户体系与账号归并规则
- 企业唯一键规则：手机号、邮箱、统一社会信用代码
- 权限模型：角色、菜单、按钮、数据范围
- 订单状态流与报告状态流
- 附件返回结构
- 分页结构与通用响应结构

## 当前仓库对应关系

- 方案文档：`docs/quality-innovation-admin-frontend-plan.md`
- 路由与权限：`src/router`、`src/store/modules`
- API 与类型：`src/api`、`src/types`
- 通用组件：`src/components`
- 业务组件：`src/components-business`
- 平台页示例：`src/views/platform`
- 企业页示例：`src/views/enterprise`

当前状态已经满足“可直接进入开发”的最低标准：框架可运行、构件已分层、核心页面有示例、权限模型已落骨架、P1/P2 模块已有预留位。
