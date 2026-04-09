# 质量创新中心平台 PC 后台

基于 `Vue 3 + TypeScript + Vite + Element Plus + Pinia + Vue Router` 的企业级后台项目。

当前仓库不是纯模板，而是已经落地了一套“平台运营方后台 + 企业/服务提供方后台 + 政府查看角色预留”的一期前端底盘，重点覆盖：

- 企业注册与审核
- 用户、需求、咨询、订单、报告、评价、消息管理
- 企业侧工作台、订单、报告、服务管理
- 社区、商城、物流、工作流、统计等二期扩展位
- mock / real API 切换
- 角色、菜单、按钮、数据范围隔离

## 技术栈

- Vue 3
- TypeScript
- Vite
- Element Plus
- Pinia
- Vue Router
- Axios
- ECharts
- Vitest
- ESLint + Oxlint + Prettier

## 角色与端口说明

项目共用一套后台壳，按角色切换菜单与数据范围。

- 平台端：`super_admin`、`platform_admin`、`auditor`
- 企业端：`enterprise_demander`、`enterprise_service_provider`、`enterprise_lab`
- 预留角色：`government_viewer`

主要路由入口：

- `/login`：统一登录页
- `/platform/*`：平台运营后台
- `/enterprise/*`：企业/服务机构后台
- `/system/*`：系统管理与工作流预留
- `/government/*`：政府查看方预留入口

说明：

- 访问 `http://localhost:5174/` 会先进入登录页
- 登录成功后，再根据当前角色进入对应工作台

## 演示账号

当前默认接入 mock 数据，登录页可直接选择演示账号，也可手动输入以下账号，密码统一为 `123456`：

- `admin`：平台管理员
- `auditor`：审核员
- `demander`：企业需求方
- `service`：基础服务方
- `lab`：检测机构方
- `government`：政府查看方预留账号

## Mock 与真实接口切换

项目内所有页面统一从 `src/api/modules/*` 发起请求，不直接依赖页面内 mock。

mock 开关位于：

- [src/api/helper.ts](./src/api/helper.ts)

当前逻辑：

- `VITE_USE_MOCK !== 'false'` 时，默认使用 mock
- 只有明确设置 `VITE_USE_MOCK=false` 时，才切换到真实接口

可在本地 `.env.development` 中配置：

```bash
VITE_USE_MOCK=true
```

或：

```bash
VITE_USE_MOCK=false
```

## 目录结构

```text
src
├─ api                    # API 模块层，统一封装 mock / real 切换
├─ components             # 基础通用组件
├─ components-business    # 业务通用组件，如搜索表单、状态标签、详情区块
├─ constants              # 业务字典、常量
├─ directives             # 自定义指令，如权限指令
├─ enum                   # 统一枚举
├─ hooks                  # 组合式 hooks
├─ layout                 # 后台布局壳
├─ mock                   # mock 数据与 mock 模块
├─ router                 # 常量路由、动态路由、守卫
├─ store                  # Pinia 状态管理
├─ styles                 # 全局样式
├─ types                  # TypeScript 类型
├─ utils                  # 请求、鉴权、工具函数
└─ views                  # 平台端、企业端、系统端、政府端页面
```

## 已完成模块

### 平台端

- 工作台
- 用户管理
- 企业/机构审核
- 需求管理
- 咨询管理
- 订单管理
- 报告管理
- 评价管理
- 消息管理
- 角色权限管理
- 服务管理
- 社区文章 / 提问 / 专家管理
- 商城管理
- 物流信息
- 轻量统计
- 工作流模板 / 节点 / 审批记录预留页

### 企业端

- 工作台
- 企业信息管理
- 我的需求 / 咨询 / 订单 / 报告 / 评价 / 消息
- 服务管理
- 社区入口预留

### 预留模块

- 企业端数据报告
- 企业端账号安全
- 政府方真实业务页
- 工作流设计器与流程引擎

## 开发说明

### 安装依赖

```bash
pnpm install
```

### 本地开发

```bash
pnpm run dev
```

默认地址：

```text
http://localhost:5174
```

### 类型检查

```bash
pnpm run type-check
```

### 代码检查

```bash
pnpm run lint
```

### 单元测试

```bash
pnpm run test:unit
```

### 生产构建

```bash
pnpm run build
```

## 权限约定

当前权限体系分为 4 层：

- 路由权限：按角色动态注入路由
- 菜单权限：菜单随可访问路由自动过滤
- 按钮权限：统一使用 `PermissionButton` 或权限指令
- 数据权限：按 `enterpriseId / dataScopes` 约束 mock 与接口层

## 开发约定

- 页面尽量按“列表页 + 详情页/抽屉 + 操作弹窗 + 时间线”实现
- 状态显示统一使用 `StatusTag`
- 权限操作统一使用 `PermissionButton`
- 详情区域统一使用 `DetailSection`
- 操作记录统一使用 `OperationTimeline`
- 新业务优先写入 `api/modules`、`types`、`enum`、`mock/modules`

## 文档

详细前端方案见：

- [docs/quality-innovation-admin-frontend-plan.md](./docs/quality-innovation-admin-frontend-plan.md)
