# 运营方平台服务管理设计说明

## 1. 需求定位

面向 `平台超级管理员 / 运营方`，在 `平台业务` 下新增 `服务管理`。

本模块的核心目标是：

- 按企业维度查看可监管的企业列表
- 进入单个企业的服务管理面板
- 新增并上架企业服务
- 在服务列表内直接执行下架

当前页面形态已经调整为和平台其他列表页一致，不再保留顶部概览卡片、提示横幅和说明性文字。

## 2. 页面结构

### 2.1 一级页：服务管理列表

入口：`/operator/business/service`

列表页结构：

- 顶部搜索区
- 中部状态切换行
- 底部标准表格区

搜索项：

- 企业名称
  - 实际检索：企业名称 / 统一社会信用代码
- 审核状态
- 服务类型

状态切换行：

- 全部
- 待审核
- 补材料
- 已通过

表格列建议：

- 企业名称
- 统一社会信用代码
- 服务类型
- 审核状态
- 联系人
- 联系电话
- 提交时间
- 操作：`管理服务`

工具按钮：

- 导出列表

### 2.2 二级页：企业服务管理抽屉

点击 `管理服务` 后，打开右侧抽屉。

抽屉结构：

- 企业摘要
- 服务筛选
- 服务列表

企业摘要展示字段：

- 企业名称
- 统一社会信用代码
- 联系人
- 联系电话
- 机构类型
- 资质数量
- 企业地址
- 服务方向

服务筛选项：

- 服务名称
- 服务类型
- 上下架状态

### 2.3 服务列表操作

抽屉内服务列表上方需要提供按钮：

- `新增上架服务`

服务列表内操作：

- `下架`
  - 对于已上架服务，直接在列表中操作
- `上架`
  - 对于已下架服务，直接在列表中操作

### 2.4 新增上架服务面板

点击 `新增上架服务` 后，打开服务表单弹窗。

表单字段建议：

- 服务编码 `serviceCode`
  - 中文含义：服务项目编码
- 服务名称 `serviceName`
  - 中文含义：服务项目名称
- 服务类型 `serviceType`
  - 中文含义：服务所属类型
- 类别编码 `categoryCode`
  - 中文含义：服务分类编码
- 服务规范 `specification`
  - 中文含义：服务规格、执行方式或交付规范
- 适用客户 `targetCustomer`
  - 中文含义：适用客户群体
- 联系人 `contactName`
  - 中文含义：该服务对应联系人
- 联系电话 `contactPhone`
  - 中文含义：该服务联系电话
- 价格说明 `priceText`
  - 中文含义：前端展示的价格文案
- 服务描述 `description`
  - 中文含义：服务介绍说明

新增逻辑建议：

- 运营方新增后默认进入“已上架”状态
- 如果后端希望更严谨，也可以支持“保存并上架”模式

## 3. 本次前端已落内容

- 新增平台路由：`/operator/business/service`
- 新增菜单权限：
  - `operator.service`
  - `operator:service:view`
  - `operator:service:manage`
- 新增平台页面：`src/views/platform/service/index.vue`
- 列表页已调整为平台常规列表页样式
- 抽屉内已补 `新增上架服务` 按钮和表单面板
- 服务列表中已支持直接点击 `上架 / 下架`

## 4. OpenAPI 当前已确认可复用的接口

### 4.1 企业列表接口

接口：

- `GET /api/admin/admin/enterprise/list`

用途：

- 运营方分页查看平台企业列表

请求参数：

- `certStatus`
  - 中文含义：认证状态
- `keyword`
  - 中文含义：企业搜索关键词
- `page`
  - 中文含义：页码
- `size`
  - 中文含义：每页条数

建议返回字段：

- `id`
  - 中文含义：企业 ID
- `enterpriseName` / `name`
  - 中文含义：企业名称
- `socialCreditCode` / `unifiedCreditCode`
  - 中文含义：统一社会信用代码
- `contactName`
  - 中文含义：联系人
- `contactPhone`
  - 中文含义：联系电话
- `serviceTypes`
  - 中文含义：企业服务类型列表
- `certStatus`
  - 中文含义：审核状态
- `createTime` / `submitTime`
  - 中文含义：提交时间

### 4.2 企业详情接口

接口：

- `GET /api/admin/admin/enterprise/{enterpriseId}`

用途：

- 给抽屉顶部企业摘要区补齐展示字段

路径参数：

- `enterpriseId`
  - 中文含义：企业 ID

建议返回字段：

- `enterpriseId` / `id`
  - 中文含义：企业 ID
- `enterpriseName`
  - 中文含义：企业名称
- `socialCreditCode` / `unifiedCreditCode`
  - 中文含义：统一社会信用代码
- `contactName`
  - 中文含义：联系人
- `contactPhone`
  - 中文含义：联系电话
- `address`
  - 中文含义：详细地址
- `region`
  - 中文含义：地区信息
- `serviceRange`
  - 中文含义：服务范围描述
- `serviceTypes`
  - 中文含义：服务方向标签
- `qualification`
  - 中文含义：资质说明
- `introduction`
  - 中文含义：企业简介

### 4.3 机构服务范围维护接口

接口：

- `PUT /api/base/institution/{id}/service`

用途：

- 更新机构的服务范围、简介、联系电话

结论：

- 这个接口只能用于“机构服务范围维护”
- 不能替代“企业服务项目新增、列表、上下架、详情”接口

请求参数：

- `id`
  - 中文含义：机构 ID
- `serviceRange`
  - 中文含义：机构服务范围
- `introduction`
  - 中文含义：机构简介
- `contactPhone`
  - 中文含义：联系电话

## 5. 当前缺失的关键接口

当前 `qip-openapi-merged(3).json` 中，仍缺少真正支撑本页面的服务项目接口。

### 5.1 企业服务项目列表接口

建议接口：

- `GET /api/admin/admin/enterprise/{enterpriseId}/service`
- 或 `GET /api/admin/admin/service/list?enterpriseId=xxx`

建议请求参数：

- `enterpriseId`
  - 中文含义：企业 ID
- `keyword`
  - 中文含义：服务关键词
- `serviceType`
  - 中文含义：服务类型
- `status`
  - 中文含义：上下架状态
- `page`
  - 中文含义：页码
- `size`
  - 中文含义：每页条数

建议返回字段：

- `serviceId`
  - 中文含义：服务 ID
- `enterpriseId`
  - 中文含义：所属企业 ID
- `enterpriseName`
  - 中文含义：所属企业名称
- `serviceName`
  - 中文含义：服务名称
- `serviceCode`
  - 中文含义：服务编码
- `serviceType`
  - 中文含义：服务类型
- `priceText`
  - 中文含义：价格说明
- `contactName`
  - 中文含义：联系人
- `contactPhone`
  - 中文含义：联系电话
- `status`
  - 中文含义：上架状态
- `updatedAt`
  - 中文含义：更新时间

### 5.2 新增上架服务接口

建议接口：

- `POST /api/admin/admin/service`

建议请求字段：

- `enterpriseId`
  - 中文含义：所属企业 ID
- `serviceCode`
  - 中文含义：服务编码
- `serviceName`
  - 中文含义：服务名称
- `serviceType`
  - 中文含义：服务类型
- `categoryCode`
  - 中文含义：分类编码
- `specification`
  - 中文含义：服务规范
- `targetCustomer`
  - 中文含义：适用客户
- `contactName`
  - 中文含义：联系人
- `contactPhone`
  - 中文含义：联系电话
- `priceText`
  - 中文含义：价格说明
- `description`
  - 中文含义：服务描述
- `status`
  - 中文含义：服务状态
  - 备注：如果是“新增上架服务”，建议默认传上架状态

建议返回字段：

- `serviceId`
  - 中文含义：新建后的服务 ID
- `status`
  - 中文含义：新建后的服务状态
- `createdAt`
  - 中文含义：创建时间

### 5.3 服务上下架接口

建议接口：

- `PUT /api/admin/admin/service/{serviceId}/status`
- 或 `PUT /api/admin/admin/service/{serviceId}/shelf`

建议请求字段：

- `serviceId`
  - 中文含义：服务 ID
- `status`
  - 中文含义：目标上下架状态
  - 备注：建议明确枚举，例如 `1=上架，0=下架`
- `reason`
  - 中文含义：上下架原因
- `operatorRemark`
  - 中文含义：运营方备注

建议返回字段：

- `serviceId`
  - 中文含义：服务 ID
- `status`
  - 中文含义：变更后的状态
- `updatedAt`
  - 中文含义：更新时间

### 5.4 服务详情接口

建议接口：

- `GET /api/admin/admin/service/{serviceId}`

用途：

- 查看单个服务完整信息
- 支撑后续扩展的“查看详情 / 查看封面 / 查看资质”等动作

路径参数：

- `serviceId`
  - 中文含义：服务 ID

建议返回字段：

- `serviceId`
  - 中文含义：服务 ID
- `enterpriseId`
  - 中文含义：所属企业 ID
- `enterpriseName`
  - 中文含义：所属企业名称
- `serviceName`
  - 中文含义：服务名称
- `serviceCode`
  - 中文含义：服务编码
- `serviceType`
  - 中文含义：服务类型
- `categoryCode`
  - 中文含义：分类编码
- `specification`
  - 中文含义：服务规范
- `targetCustomer`
  - 中文含义：适用客户
- `priceText`
  - 中文含义：价格说明
- `description`
  - 中文含义：服务描述
- `contactName`
  - 中文含义：联系人
- `contactPhone`
  - 中文含义：联系电话
- `status`
  - 中文含义：上下架状态
- `updatedAt`
  - 中文含义：更新时间

## 6. 当前缺失的关键字段

即使后端后续补了接口，前端仍建议至少返回以下字段，否则页面展示会不完整。

### 6.1 服务列表核心字段

- `serviceId`：服务 ID
- `enterpriseId`：所属企业 ID
- `enterpriseName`：所属企业名称
- `serviceName`：服务名称
- `serviceCode`：服务编码
- `serviceType`：服务类型
- `priceText`：价格说明
- `contactName`：联系人
- `contactPhone`：联系电话
- `status`：上下架状态
- `updatedAt`：更新时间

### 6.2 如果要贴近移动端展示，还建议补充

- `coverUrl`
  - 中文含义：服务封面图地址
- `tags`
  - 中文含义：服务标签数组
- `saleCount`
  - 中文含义：销量或成交数量
- `guaranteeFlag`
  - 中文含义：是否展示保障标识
- `serviceIntro`
  - 中文含义：服务简介
- `region`
  - 中文含义：地区
- `address`
  - 中文含义：详细地址

## 7. 当前实现策略

由于真实 OpenAPI 还缺“服务项目列表 / 新增 / 上下架 / 详情”接口，当前前端采用的是：

- 企业列表先接真实企业接口
- 服务新增、服务列表、服务上下架先把页面和交互骨架搭好
- mock 环境可完整演示新增和上下架
- 真实接口联调时再切换到后端接口

## 8. 后续建议

建议后端优先补下面这组最小可用接口：

1. `GET /api/admin/admin/service/list`
2. `POST /api/admin/admin/service`
3. `PUT /api/admin/admin/service/{serviceId}/status`
4. `GET /api/admin/admin/service/{serviceId}`

优先级建议：

- 第一优先：服务列表接口
- 第二优先：新增上架服务接口
- 第三优先：上下架接口
- 第四优先：服务详情接口

这样才能完整支撑当前已经确定的页面交互。
