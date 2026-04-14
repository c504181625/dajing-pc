# OpenAPI 接口缺字段清单

后端基址：`http://43.138.0.218:8080`

## `POST /api/user/auth/login/password`

后端需要补这些返回字段：

- `token` - 访问令牌，登录态凭证
- `refreshToken` - 刷新令牌，用于续期登录态
- `expiresIn` - 令牌有效期，单位通常为秒
- `needResetPassword` - 是否需要首次改密
- `accountId` - 账号唯一 ID
- `accountType` - 账号类型，区分个人、企业、运营方
- `enterpriseName` - 企业名称，登录后顶部展示
- `enterpriseTags` - 企业身份标签，如 demander / provider
- `permissionCodes` - 权限码列表，用于按钮、菜单、接口权限控制
- `menuCodes` - 菜单码列表，用于动态生成左侧菜单
- `homeRoute` - 登录后的默认首页路由
- `user` - 当前用户资料对象，前端登录态主数据

如果登录接口不想返回完整用户对象，也至少需要补一个：

- `GET /api/user/current` - 获取当前登录用户信息

这个接口需要返回：

- `accountId` - 账号唯一 ID
- `accountType` - 账号类型
- `enterpriseName` - 企业名称
- `enterpriseTags` - 企业身份标签
- `permissionCodes` - 权限码列表
- `menuCodes` - 菜单码列表
- `homeRoute` - 默认首页路由
- `user` - 当前用户资料对象

## `POST /api/user/enterprise/register`

后端当前要求登录后才能提交。企业入驻是可以直接在未登录状态注册的。

建议这个接口返回：

- `id` - 申请单 ID
- `status` - 申请状态

## `POST /api/user/enterprise/ocr/business-license`

后端需要补这些识别结果字段：

- `enterpriseName` - 企业名称
- `socialCreditCode` - 统一社会信用代码
- `legalPerson` - 法人
- `registeredAddress` - 营业执照登记地址
- `address` - 经营地址
- `businessScope` - 经营范围

## `GET /api/user/enterprise/list`

后端需要补这些列表字段：

- `serviceTypes` - 企业服务类型列表
- `reviewerName` - 审核人姓名
- `email` - 企业邮箱
- `registeredCapital` - 注册资本
- `companyType` - 公司性质
- `businessLicense` - 营业执照附件
- `qualificationFiles` - 资质附件列表
- `qualifications` - 资质证书列表
- `auditRecords` - 审核记录
- `province` - 省份
- `city` - 城市
- `district` - 区县
- `certStatus` - 审核状态

省份-城市-区县 当前可以不弄，为可选优化字段

## `GET /api/user/enterprise/{id}`

后端需要补这些详情字段：

- `serviceTypes` - 企业服务类型列表
- `auditRecords` - 审核记录
- `qualificationFiles` - 资质附件列表
- `businessLicense` - 营业执照附件
- `email` - 企业邮箱
- `registeredCapital` - 注册资本
- `companyType` - 公司性质
- `province` - 省份
- `city` - 城市
- `district` - 区县

省份-城市-区县 当前可以不弄，为可选优化字段

## `GET /api/user/enterprise/{enterpriseId}/cert`

后端需要把这些字段说明清楚，或者直接补全：

- `certType` - 证书类型
- `certNo` - 证书编号
- `certName` - 证书名称
- `certFile` - 证书文件地址
- `expireDate` - 到期时间
- `expireStatus` - 到期状态

## 缺少文件上传接口

当前文档里没有看到媒体文件上传相关接口，但前端注册、企业入驻、资质证书等页面都需要先上传文件，再把返回的 `url` 传给后台。

建议后端补充一个文件上传接口，至少返回下面这些字段：

- `url` - 文件可访问地址，前端后续提交给注册/资料接口使用
- `fileKey` - 文件存储键值，便于后端管理
- `fileName` - 原始文件名
- `fileType` - 文件类型
- `size` - 文件大小

如果后端希望前端直传 MinIO，也可以提供：

- 预签名上传地址 `uploadUrl`
- 预签名表单参数 `fields`
- 上传完成后的文件地址 `url`

这样前端就可以先上传文件，再把返回的 `url` 传给：

- 个人注册 `POST /api/user/auth/register`
- 企业入驻 `POST /api/user/enterprise/register`
- 企业资质证书新增 `POST /api/user/enterprise/{enterpriseId}/cert`
