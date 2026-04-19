# OpenAPI 对接差异记录

> 本文档记录前端项目 mock 数据与真实后端 OpenAPI 接口之间的差异，以及已采取的修改方案。
>
> 后端基础地址：`http://43.138.0.218:8080`
>
> OpenAPI 文件：
> - `默认模块.openapi.json` — 用户认证、企业入驻、证书管理
> - `质检平台 - 后台管理服务 (admin-service).openapi.json` — 运营方后台管理接口

---

## 1. 认证模块 (auth)

### 1.1 发送短信验证码
- 前端原 mock：`mockSendSmsCode(payload)` 直接返回 `{ success, expireSeconds }`
- 真实接口：`POST /api/user/auth/sms/send`
- 差异说明：
  - mock 中 scene 为小写下划线格式（如 `login_mobile`）
  - 真实接口 scene 为大写格式（如 `LOGIN`）
  - mock 中手机号字段为 `mobile`，真实接口为 `phone`
- 修改方案：
  - 添加 `normalizeSmsScene()` 函数做场景映射
  - 请求时将 `mobile` 映射为 `phone`
- **状态：✅ 已对接**

### 1.2 账号密码登录
- 前端原 mock：`mockLogin(account)` 直接通过 token 前缀匹配角色
- 真实接口：`POST /api/user/auth/login/password`
- 差异说明：
  - mock 返回结构包含完整 profile（accountType, permissionCodes, menuCodes 等）
  - 真实接口返回结构未在 OpenAPI 中展开（schema 为空 `{}`）
  - 前端通过 `normalizeLoginResponse()` 做兼容适配
- 修改方案：
  - 使用 `buildLoginProfile()` 兼容多种字段命名（`account_type`/`accountType` 等）
  - 当后端不返回 menuCodes 时，前端根据 accountType 自动补充默认菜单
- 待确认：
  - ⚠️ 登录返回的完整字段列表需以后端实际返回为准
  - ⚠️ `getCurrentUser` 接口（获取当前登录用户信息）在 OpenAPI 中**不存在**，目前仍保留 mock
- **状态：✅ 已对接（登录），⚠️ getCurrentUser 保留 mock**

### 1.3 验证码登录
- 真实接口：`POST /api/user/auth/login`
- 差异同 1.2
- **状态：✅ 已对接**

### 1.4 账号注册
- 真实接口：`POST /api/user/auth/register`
- 差异说明：
  - mock 字段 `username` → 真实接口 `nickname`
  - mock 字段 `mobile` → 真实接口 `phone`
  - 真实接口额外需要 `device: "WEB"`
- **状态：✅ 已对接**

---

## 2. 用户管理 (user)

### 2.1 用户列表
- 前端原 mock 请求：`GET /system/user/page`，参数 `pageNum/pageSize/keyword/accountStatus`
- 真实接口：`GET /admin/user/list`，参数 `page/size/keyword/status`
- 差异说明：
  - 路径完全不同：`/system/user/page` → `/admin/user/list`
  - 分页参数名：`pageNum` → `page`，`pageSize` → `size`
  - 状态筛选：mock 用字符串枚举 `enabled/disabled`，真实接口用数字（推测 0=禁用 1=启用）
  - 返回结构：mock 为 `{ list, pageNum, pageSize, total }`，真实接口可能为 Spring Page 格式 `{ records/content, current/number, size, total/totalElements }`
- 修改方案：
  - 请求参数映射 `pageNum→page, pageSize→size, accountStatus→status(number)`
  - 响应通过 `normalizeUserPageResult()` 兼容 Spring Page 和自定义格式
  - 用户状态通过 `normalizeUserItem()` 将数字映射回枚举
- **状态：✅ 已对接**

### 2.2 启用/禁用用户
- 前端原 mock：`POST /system/user/{id}/toggle-status`（单接口切换）
- 真实接口：`PUT /admin/user/{userId}/disable` 和 `PUT /admin/user/{userId}/enable`（两个独立接口）
- 差异说明：
  - mock 为单个 POST 切换，真实为两个 PUT 接口
  - 需要根据当前状态判断调用哪个
- 修改方案：
  - `toggleUserStatus()` 增加 `currentStatus` 参数
  - 页面调用处传入 `row.status`
  - 新增 `disableUser()` 和 `enableUser()` 独立方法
- **状态：✅ 已对接**

### 2.3 用户详情 / 编辑 / 删除
- 真实接口：**❌ OpenAPI 中不存在**
- 修改方案：保留 mock 兜底
- **状态：⚠️ 保留 mock，待后端补充接口**

---

## 3. 企业审核 (enterprise)

### 3.1 企业审核列表
- 前端原 mock 请求：走 mock 数据
- 真实接口：`GET /admin/enterprise/list`，参数 `certStatus/keyword/page/size`
- 差异说明：
  - 之前代码中使用 `/api/user/enterprise/list`（公开接口），管理端应使用 `/admin/enterprise/list`
  - 管理端接口支持 `certStatus` 筛选：0=待审核 1=已通过 2=已驳回
  - 前端 mock 使用字符串枚举 `pending/approved/rejected`
- 修改方案：
  - 管理端列表改用 `/admin/enterprise/list`
  - 将前端字符串枚举映射为数字 `certStatus`
  - 新增 `getPendingEnterpriseList()` 对接 `GET /admin/enterprise/pending`
- **状态：✅ 已对接**

### 3.2 审核企业（通过/驳回）
- 前端原 mock：`submitEnterpriseAuditAction({ auditId, action, remark })` action 为 `approve/reject/supplement`
- 真实接口：`PUT /admin/enterprise/{enterpriseId}/audit?passed=true/false&rejectReason=xxx`
- 差异说明：
  - mock 使用 body 提交 action + remark
  - 真实接口使用 query 参数 `passed` (boolean) + `rejectReason` (string)
  - 真实接口只有通过/驳回两种操作，无 `supplement`
- 修改方案：
  - `approve` → `passed=true`
  - `reject`/`supplement` → `passed=false, rejectReason=xxx`
- **状态：✅ 已对接**

### 3.3 企业详情 / 我的企业 / 证书管理 / OCR
- 真实接口均已在之前版本对接
- **状态：✅ 已对接**

---

## 4. 数据概览 (dashboard)

### 4.1 平台数据概览
- 前端原 mock 请求：`GET /dashboard/platform-workbench`
- 真实接口：`GET /admin/dashboard/overview`
- 差异说明：
  - 路径不同
  - **⚠️ 真实接口返回结构未在 OpenAPI 中定义（schema 为空）**
  - 前端期望结构包含 todos, overviewMetrics, recentOperations, quickEntries 等
- 修改方案：
  - 编写 `normalizePlatformDashboard()` 兼容多种可能的返回结构
  - 如果后端返回扁平统计数据，自动构建 overviewMetrics 数组
- 待确认：
  - ⚠️ 返回结构需以后端实际返回为准，当前为最小可用适配
- **状态：✅ 已对接（需后端确认返回结构）**

### 4.2 商户工作台
- 真实接口：**❌ OpenAPI 中不存在**
- **状态：⚠️ 保留 mock**

---

## 5. 需求管理 (demand)

### 5.1 需求列表
- 前端原 mock 请求：`GET /demand/page`
- 真实接口：`GET /admin/order/demands`
- 差异说明：
  - 路径完全不同
  - 分页参数：`pageNum/pageSize` → `page/size`
  - 返回结构需适配
- 修改方案：
  - 路径改为 `/admin/order/demands`
  - 参数映射 + 响应标准化
- **状态：✅ 已对接**

### 5.2 需求详情 / 回复 / 分配 / 创建 / 接受 / 删除
- 真实接口：**❌ OpenAPI 中不存在**
- **状态：⚠️ 保留 mock**

---

## 6. 订单管理 (order)

### 6.1 订单详情
- 前端原 mock 请求：`GET /order/{id}`
- 真实接口：`GET /admin/order/{orderId}`
- 差异说明：
  - 路径前缀从 `/order/` 变为 `/admin/order/`
  - **⚠️ 返回结构未在 OpenAPI 中定义**
- 修改方案：
  - 编写 `normalizeOrderDetail()` 兼容适配
- **状态：✅ 已对接（返回字段需后端确认）**

### 6.2 强制关闭订单
- 前端原 mock 请求：`POST /order/{id}/force-close`，body: `{ reason }`
- 真实接口：`PUT /admin/order/{orderId}/force-close?reason=xxx`
- 差异说明：
  - method：`POST` → `PUT`
  - reason 从 body 移到 query 参数
- 修改方案：
  - method 改为 PUT
  - reason 改为 params 传递
- **状态：✅ 已对接**

### 6.3 订单列表 / 接受 / 拒绝 / 编辑 / 删除
- 真实接口：**❌ OpenAPI 中不存在**
- **状态：⚠️ 保留 mock**

---

## 7. 报告管理 (report)

### 7.1 报告详情
- 前端原 mock 请求：`GET /report/{id}`
- 真实接口：`GET /admin/report/{reportId}`
- **状态：✅ 已对接**

### 7.2 作废/隐藏违规报告
- 前端原 mock：`POST /report/{id}/invalidate`，body: `{ reason }`
- 真实接口：`PUT /admin/report/{reportId}/invalidate`，无 body
- 差异说明：
  - method：`POST` → `PUT`
  - 无 body（不传 reason）
- 修改方案：method 改 PUT，移除 body
- **状态：✅ 已对接**

### 7.3 报告列表 / 切换隐藏 / 删除
- 真实接口：**❌ OpenAPI 中不存在**
- **状态：⚠️ 保留 mock**

---

## 8. 评价管理 (evaluation) & 评论管理 (comment)

### 8.1 删除违规评论
- 前端原 mock：`DELETE /comment/{id}`
- 真实接口：`DELETE /admin/content/comment/{id}`
- 差异说明：路径前缀变化
- **状态：✅ 已对接**

### 8.2 查看指定订单评价
- 前端无此函数
- 真实接口：`GET /admin/evaluation/order/{orderId}`
- 修改方案：新增 `getOrderEvaluation()` 函数
- **状态：✅ 已新增**

### 8.3 删除违规评价
- 前端无此函数
- 真实接口：`DELETE /admin/evaluation/{evaluationId}`
- 修改方案：新增 `deleteEvaluation()` 函数
- **状态：✅ 已新增**

### 8.4 评论列表
- 真实接口：**❌ OpenAPI 中不存在**
- **状态：⚠️ 保留 mock**

---

## 9. 内容审核 (content)

### 9.1 资讯列表
- 前端原 mock：`GET /community/article/page` 或 `GET /community/content/page`
- 真实接口：`GET /admin/content/articles?page=&size=&status=`
- 差异说明：
  - 路径完全不同
  - 分页参数：`pageNum/pageSize` → `page/size`
  - 状态筛选：前端用 `draft/pending_review/published/offline`，后端用数字 `0/1/2`
  - 后端状态枚举：0=草稿, 1=已发布, 2=下架（无 `pending_review`）
  - **⚠️ 返回结构未在 OpenAPI 中定义**
- 修改方案：
  - 路径改为 `/admin/content/articles`
  - 状态映射：`draft→0, published→1, offline→2`
  - 响应通过 `normalizeArticleItem()` 适配
- **状态：✅ 已对接**

### 9.2 审核通过/下架资讯
- 前端无此函数
- 真实接口：`PUT /admin/content/article/{id}/status?status=0/1/2`
- 修改方案：新增 `updateArticleStatus()` / `publishArticle()` / `unpublishArticle()`
- **状态：✅ 已新增**

### 9.3 删除违规资讯
- 前端原 mock：`DELETE /community/article/{id}`
- 真实接口：`DELETE /admin/content/article/{id}`
- **状态：✅ 已对接**

### 9.4 问答列表
- 前端原 mock：`GET /community/question/page`
- 真实接口：`GET /admin/content/questions?page=&size=`
- **状态：✅ 已对接**

---

## 10. 字典管理 (dictionary)

### 10.1 按类型查询字典列表
- 前端原 mock：`GET /system/dictionary/{code}`
- 真实接口：`GET /dict/list/{dictType}`
- 差异说明：路径完全不同
- **状态：✅ 已对接**

### 10.2 新增字典 CRUD 操作
- 前端原来无此功能
- 真实接口：
  - `GET /dict/types` — 查询所有字典类型
  - `POST /dict` — 新增字典项
  - `PUT /dict/{id}` — 修改字典项
  - `DELETE /dict/{id}` — 删除字典项
  - `PUT /dict/{id}/status?status=0/1` — 启用/禁用字典项
- 修改方案：新增全套 CRUD 函数
- **状态：✅ 已新增**

---

## 11. 系统设置 (system)

### 11.1 操作日志
- 前端原来无此函数
- 真实接口：`GET /admin/system/audit-log?module=&operatorId=&page=&size=`
- 修改方案：新增 `getAuditLog()` 函数和 `AuditLogItem` / `AuditLogQuery` 类型
- 待确认：
  - ⚠️ 返回字段以后端实际返回为准
- **状态：✅ 已新增**

### 11.2 角色列表 / 权限树
- 真实接口：**❌ OpenAPI 中不存在**
- **状态：⚠️ 保留 mock**

---

## 12. 完全无 OpenAPI 接口的模块（保留 mock）

以下模块在两个 OpenAPI JSON 文件中**完全没有对应接口**：

| 模块 | API 文件 | 说明 |
|------|---------|------|
| 咨询管理 | `consult.ts` | 列表、详情、回复、删除 |
| 服务项目 | `service.ts` | 列表、保存、状态切换、删除 |
| 消息通知 | `message.ts` | 列表、详情、已读、全部已读、删除 |
| 物流管理 | `logistics.ts` | 物流追踪、地址管理 |
| 商城管理 | `mall.ts` | 商品列表、保存、删除 |
| 工作流 | `workflow.ts` | 模板、节点、记录 |
| 统计数据 | `stats.ts` | 月度统计、关键指标 |

这些模块当前全部保留 mock 数据，等待后端提供对应接口后再行对接。

---

## 13. OpenAPI 返回结构不完整的接口

以下接口在 OpenAPI JSON 中**响应 schema 为空对象 `{}`**，前端已做最小可用适配：

| 接口 | 路径 | 当前兼容处理 |
|------|------|------------|
| 平台数据概览 | `GET /admin/dashboard/overview` | 兼容扁平统计 + 嵌套结构 |
| 用户列表 | `GET /admin/user/list` | 兼容 Spring Page / 自定义分页 |
| 企业列表 | `GET /admin/enterprise/list` | 同上 |
| 订单详情 | `GET /admin/order/{orderId}` | 字段名兼容映射 |
| 报告详情 | `GET /admin/report/{reportId}` | 字段名兼容映射 |
| 需求列表 | `GET /admin/order/demands` | 兼容多种分页格式 |
| 资讯列表 | `GET /admin/content/articles` | 状态数字↔枚举互转 |
| 问答列表 | `GET /admin/content/questions` | 兼容多种分页格式 |
| 操作日志 | `GET /admin/system/audit-log` | 字段名兼容映射 |
| 所有登录接口 | `/api/user/auth/*` | 兼容多种 token/profile 字段 |

> **⚠️ 以上接口的字段均以后端实际返回为准，前端当前处理方式为"尽量兼容"，非最终适配。**
