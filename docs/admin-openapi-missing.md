# 运营方后台 OpenAPI 接口缺项与缺字段清单

后端基址：`http://43.138.0.218:8080`
涉及文件：`质检平台 - 后台管理服务 (admin-service).openapi.json`

## 1. 响应结构为空（`schema: {}`）的接口

以下接口在当前 OpenAPI 定义中存在，但是响应 `schema` 定义为空（`{}`），前端无法确认具体返回字段，目前只能按照原有 mock 数据结构进行“尽量兼容”。请对应后端开发补充并在接口注释/文档中标明详细字段及嵌套结构：

### `GET /admin/dashboard/overview` (平台数据概览)
建议至少补充：
- `todos` - 待办事项统计（例如：待审核企业数、待审核内容数）
- `overviewMetrics` - 核心指标列表（包含当月/总计数值、环比趋势等）
- `recentOperations` - 最近操作动态
- `quickEntries` - 快捷入口配置（可选）

### `GET /admin/user/list` (用户列表)
分页返回格式需明确（例如统一使用 `{ records: [...], total: 0, current: 1, size: 20 }`）。
对于用户条目，建议补充：
- `id` / `userId` - 唯一标识
- `name` / `nickname` - 用户名
- `phone` - 手机号
- `accountType` - 账号身份类型
- `status` - 用户状态（需明确：0是禁用还是草稿？1是启用还是正常？）
- `createdAt` - 注册时间

### `GET /admin/enterprise/list` 及 `GET /admin/enterprise/pending` (企业审核列表)
分页返回格式需明确。对于企业条目，建议补充：
- `id` / `enterpriseId` - 企业唯一标识
- `name` - 企业名称
- `socialCreditCode` - 统一社会信用代码
- `legalPerson` - 法人代表
- `status` / `certStatus` - 审核阶段状态
- `submitTime` / `createdAt` - 提交时间

### `GET /admin/order/{orderId}` (订单详情)
建议补充：
- 基础字段：`id`, `orderNo`, `amount`, `status`, `createdAt`
- 买方信息：`buyerId`, `buyerName`, `buyerPhone`
- 卖方信息：`providerId`, `providerName`, `providerPhone`
- 关联需求/服务：`demandId`, `serviceId`, `serviceName`
- 操作时间线：`paidAt`, `shippedAt`, `finishedAt`, `closedAt`

### `GET /admin/report/{reportId}` (举报报告详情)
建议补充：
- 基础字段：`id`, `reportNo`, `status`, `createdAt`
- 举报人信息：`reporterId`, `reporterName`
- 被举报对象：`targetType` (如 user/enterprise/article/comment), `targetId`, `targetName`
- 举报内容：`reasonType`, `content`, `attachments` (违规证明文件数组)
- 处理结果：`handleResult`, `handlerName`, `handledAt`

### `GET /admin/order/demands` (需求列表)
分页返回格式需明确。对于需求条目，建议补充：
- `id`, `title`, `budget`, `status`, `createdAt`
- 发发人信息：`publisherId`, `publisherName`
- `category` / `categoryName` - 需求分类
- `viewCount`, `applyCount` - 互动数据

### `GET /admin/content/articles` (资讯列表)
分页返回格式需明确。对于资讯条目，建议补充：
- `id`, `title`, `summary`, `cover` (封面图)
- 分类信息：`categoryCode`, `categoryName`
- 作者信息：`authorId`, `authorName` 或完整的 `author` 对象
- 状态与互动：`status` (明确0/1/2的对应关系), `viewCount`, `likeCount`, `commentCount`
- `createdAt` / `publishTime`

### `GET /admin/content/questions` (问答列表)
分页返回格式需明确。对于问答条目，建议补充：
- `id`, `title`, `summary`
- 分类信息：`categoryCode`, `categoryName`
- 提问人信息：`askerId`, `askerName` 或完整的 `asker` 对象
- 状态：`status` (审核状态), `solveStatus` (解决状态: open/solved/closed)
- 互动数据：`answerCount`, `viewCount`, `rewardText`

### `GET /admin/system/audit-log` (操作日志)
分页返回格式需明确。对应日志条目建议补充：
- `id`, `operatorId`, `operatorName` (操作人)
- `module`, `action` (操作模块与动作描述)
- `ipAddress`, `location` (来源 IP 及归属地)
- `detail` (修改详情或入参)
- `status` (操作结果成功/失败)
- `createdAt`

---

## 2. 完全缺失的模块与接口

在目前的 `admin-service.openapi.json` 中，**以下业务模块没有任何对应接口**，前端目前只能继续使用 Mock 数据。建议后端排期补充：

### 2.1 角色与权限管理 (Role & Permission)
前端需要用于配置运营方子账号及分配权限的接口：
- `GET /admin/system/role/list` - 角色列表
- `GET /admin/system/permission/tree` - 权限树/资源列表
- `POST /admin/system/role` - 创建角色
- `PUT /admin/system/role/{id}` - 修改角色及绑定权限

### 2.2 专家与咨询管理 (Consult & Expert)
前端专家栏目及一对一线上咨询的相关接口缺失：
- 专家列表及详情 CRUD
- 咨询订单（预约记录）列表与状态操作接口

### 2.3 服务项目管理 (Service)
平台企业发布的服务商品信息的集中审核与管理接口：
- 服务列表（分页及条件筛选）
- 服务的上下架控制
- 服务详情查看

### 2.4 消息通知管理 (Message)
系统全站消息（站内信、公告）管理接口：
- 推送公告/站内信创建
- 消息查询及状态更新

### 2.5 物流管理 (Logistics)
如果平台介入发收样品的物流流转：
- 物流单号录入与状态轨迹查询

### 2.6 商城管理 (Mall)
积分商城或增值服务交易模块的后台控制接口：
- 商品列表与详情 CRUD

### 2.7 工作流及工单系统 (Workflow)
审核流程可视化、复杂流转管理接口。

### 2.8 统计分析报表 (Stats)
除了运营概览外的深入分析数据：
- 用户增长曲线
- 交易额（GMV）月度/季度柱状/折线图统计等

### 2.9 商户工作台特有接口
- 提供给供应商登入后台后的针对化数据大盘（独立于 `admin`）。

---

## 3. 其他建议与规范
- **统一列表分页返回结构**：当前后端部分返回可能是 Spring 默认的 `Page` (`records`, `total`, `current`, `size`) 结构，请尽量固定一种格式，避免前端在每个接口单独兼容。
- **状态字段枚举值说明**：对于业务状态（如订单 status、用户 status），请在 OpenAPI 中通过 description 详细标注数字或字母对应的中文含义。
