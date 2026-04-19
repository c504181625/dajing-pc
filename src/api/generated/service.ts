/* eslint-disable */
// Auto-generated from qip-openapi-merged(2).json. Do not edit manually.

import { apiRequest, type ResultData } from '@/api/runtime'
import type * as Schemas from './schemas'

/** Internal API, front-end should not call directly. */
export function updateStatus(options: updateStatusOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/user/{userId}/status",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 审核实名认证（运营方） */
export function auditRealName(options: auditRealNameOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/user/{userId}/real-name/audit",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** Internal API, front-end should not call directly. */
export function updateMemberLevel(options: updateMemberLevelOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/user/{userId}/member-level",
    method: "put",
    pathParams: options.path,
    query: options.query,
    headers: options.headers,
  })
}

/** 修改昵称 */
export function updateNickname(options: updateNicknameOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/user/nickname",
    method: "put",
    query: options.query,
  })
}

/** 修改头像 */
export function updateAvatar(options: updateAvatarOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/user/avatar",
    method: "put",
    query: options.query,
  })
}

/** 地址详情 */
export function detail(options: detailOptions) {
  return apiRequest<ResultData<Schemas.user_ResultEnterpriseShippingAddress>>({
    url: "/api/user/shipping-address/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 修改地址 */
export function update(options: updateOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/shipping-address/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除地址（软删除） */
export function delete_api(options: delete_apiOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/shipping-address/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 设为默认地址 */
export function setDefault(options: setDefaultOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/shipping-address/{id}/default",
    method: "put",
    pathParams: options.path,
  })
}

/** 修改角色名称/描述/状态 */
export function update_1(options: update_1Options) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/role/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除自定义角色（内置角色不可删） */
export function delete_1(options: delete_1Options) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/role/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 查询用户已分配的角色 */
export function getUserRoles(options: getUserRolesOptions) {
  return apiRequest<ResultData<Schemas.user_ResultListString>>({
    url: "/api/user/role/user/{userId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 给用户分配角色（全量覆盖） */
export function assignRoles(options: assignRolesOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/role/user/{userId}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 开票资料详情 */
export function detail_1(options: detail_1Options) {
  return apiRequest<ResultData<Schemas.user_ResultEnterpriseInvoiceInfo>>({
    url: "/api/user/invoice-info/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 修改开票资料 */
export function update_2(options: update_2Options) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/invoice-info/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除开票资料（软删除） */
export function delete_2(options: delete_2Options) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/invoice-info/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 设为默认开票资料 */
export function setDefault_1(options: setDefault_1Options) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/invoice-info/{id}/default",
    method: "put",
    pathParams: options.path,
  })
}

/** 根据ID查询企业信息（公开） */
export function getEnterpriseById(options: getEnterpriseByIdOptions) {
  return apiRequest<ResultData<Schemas.user_ResultEnterpriseVO>>({
    url: "/api/user/enterprise/{enterpriseId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 更新企业信息 */
export function updateEnterprise(options: updateEnterpriseOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/enterprise/{enterpriseId}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 需求方升级为服务提供方（提交服务资质） */
export function upgradeToProvider(options: upgradeToProviderOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/enterprise/{enterpriseId}/upgrade-provider",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 启用企业（运营方） */
export function enableEnterprise(options: enableEnterpriseOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/enterprise/{enterpriseId}/enable",
    method: "put",
    pathParams: options.path,
  })
}

/** 禁用企业（运营方） */
export function disableEnterprise(options: disableEnterpriseOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/enterprise/{enterpriseId}/disable",
    method: "put",
    pathParams: options.path,
  })
}

/** 审核企业入驻（运营方） */
export function auditEnterprise(options: auditEnterpriseOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/enterprise/{enterpriseId}/audit",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 设置用户名（用于用户名+密码登录） */
export function setUsername(options: setUsernameOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/account/username",
    method: "put",
    query: options.query,
  })
}

/** 更新个人资料（昵称、头像） */
export function updateProfile(options: updateProfileOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/account/profile",
    method: "put",
    body: options.body,
  })
}

/** 更换手机号（需新手机号验证码） */
export function changePhone(options: changePhoneOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/account/phone",
    method: "put",
    body: options.body,
  })
}

/** 设置/修改登录密码 */
export function changePassword(options: changePasswordOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/account/password",
    method: "put",
    body: options.body,
  })
}

/** 绑定/更换邮箱（需密码验证） */
export function changeEmail(options: changeEmailOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/account/email",
    method: "put",
    body: options.body,
  })
}

/** 我的地址列表（按默认优先排序） */
export function myAddresses(options: myAddressesOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultListEnterpriseShippingAddress>>({
    url: "/api/user/shipping-address",
    method: "get",
  })
}

/** 新增地址 */
export function create(options: createOptions) {
  return apiRequest<ResultData<Schemas.user_ResultLong>>({
    url: "/api/user/shipping-address",
    method: "post",
    body: options.body,
  })
}

/** 新增自定义角色 */
export function create_1(options: create_1Options) {
  return apiRequest<ResultData<Schemas.user_ResultLong>>({
    url: "/api/user/role",
    method: "post",
    body: options.body,
  })
}

/** 追加单个角色给用户 */
export function addRole(options: addRoleOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/role/user/{userId}/add",
    method: "post",
    pathParams: options.path,
    query: options.query,
  })
}

/** 运营方手动调整积分（奖励/扣除） */
export function adminAdjust(options: adminAdjustOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/points/admin/adjust",
    method: "post",
    query: options.query,
  })
}

/** 我的开票资料列表（默认优先） */
export function myInvoices(options: myInvoicesOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultListEnterpriseInvoiceInfo>>({
    url: "/api/user/invoice-info",
    method: "get",
  })
}

/** 新增开票资料 */
export function create_2(options: create_2Options) {
  return apiRequest<ResultData<Schemas.user_ResultLong>>({
    url: "/api/user/invoice-info",
    method: "post",
    body: options.body,
  })
}

/** 通用文件上传 */
export function upload(options: uploadOptions) {
  return apiRequest<ResultData<Schemas.user_ResultFileUploadVO>>({
    url: "/api/user/file/upload",
    method: "post",
    query: options.query,
    body: options.body,
  })
}

/** 上传微信头像（公开，登录前使用） */
export function uploadWxAvatar(options: uploadWxAvatarOptions) {
  return apiRequest<ResultData<Schemas.user_ResultFileUploadVO>>({
    url: "/api/user/file/upload/wx-avatar",
    method: "post",
    body: options.body,
  })
}

/** 上传营业执照 */
export function uploadLicense(options: uploadLicenseOptions) {
  return apiRequest<ResultData<Schemas.user_ResultFileUploadVO>>({
    url: "/api/user/file/upload/license",
    method: "post",
    body: options.body,
  })
}

/** 上传身份证照片 */
export function uploadIdCard(options: uploadIdCardOptions) {
  return apiRequest<ResultData<Schemas.user_ResultFileUploadVO>>({
    url: "/api/user/file/upload/id-card",
    method: "post",
    body: options.body,
  })
}

/** 上传资质文件（授权委托书、检测资质等） */
export function uploadCert(options: uploadCertOptions) {
  return apiRequest<ResultData<Schemas.user_ResultFileUploadVO>>({
    url: "/api/user/file/upload/cert",
    method: "post",
    body: options.body,
  })
}

/** 查询企业证书列表 */
export function listCerts(options: listCertsOptions) {
  return apiRequest<ResultData<Schemas.user_ResultListEnterpriseCertVO>>({
    url: "/api/user/enterprise/{enterpriseId}/cert",
    method: "get",
    pathParams: options.path,
  })
}

/** 上传企业证书（CMA/CNAS等） */
export function addCert(options: addCertOptions) {
  return apiRequest<ResultData<Schemas.user_ResultLong>>({
    url: "/api/user/enterprise/{enterpriseId}/cert",
    method: "post",
    pathParams: options.path,
    body: options.body,
  })
}

/** 提交企业入驻申请（支持未登录：通过 contactPhone 自动找/建账号） */
export function registerEnterprise(options: registerEnterpriseOptions) {
  return apiRequest<ResultData<Schemas.user_ResultEnterpriseRegisterResultVO>>({
    url: "/api/user/enterprise/register",
    method: "post",
    body: options.body,
  })
}

/** 营业执照OCR识别 */
export function ocrBusinessLicense(options: ocrBusinessLicenseOptions) {
  return apiRequest<ResultData<Schemas.user_ResultBusinessLicenseOcrVO>>({
    url: "/api/user/enterprise/ocr/business-license",
    method: "post",
    body: options.body,
  })
}

/** 微信扫码登录（PC端 OAuth2 code） */
export function wechatQrLogin(options: wechatQrLoginOptions) {
  return apiRequest<ResultData<Schemas.user_ResultLoginVO>>({
    url: "/api/user/auth/wechat/qr/login",
    method: "post",
    body: options.body,
  })
}

/** 微信小程序快捷登录（wx.login code） */
export function wechatMiniLogin(options: wechatMiniLoginOptions) {
  return apiRequest<ResultData<Schemas.user_ResultLoginVO>>({
    url: "/api/user/auth/wechat/mini/login",
    method: "post",
    body: options.body,
  })
}

/** 微信手机号快捷绑定（getPhoneNumber code） */
export function wechatBindPhone(options: wechatBindPhoneOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/auth/wechat/mini/bindPhone",
    method: "post",
    body: options.body,
  })
}

/** 绑定微信账号（已登录用户绑定微信） */
export function bindWechat(options: bindWechatOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/auth/wechat/bind",
    method: "post",
    body: options.body,
  })
}

/** 发送短信验证码 */
export function sendSmsCode(options: sendSmsCodeOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/auth/sms/send",
    method: "post",
    body: options.body,
  })
}

/** 忘记密码（用验证码重置） */
export function resetPassword(options: resetPasswordOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/auth/reset-password",
    method: "post",
    body: options.body,
  })
}

/** 账号密码注册（需先获取短信验证码） */
export function register(options: registerOptions) {
  return apiRequest<ResultData<Schemas.user_ResultLoginVO>>({
    url: "/api/user/auth/register",
    method: "post",
    body: options.body,
  })
}

/** 刷新令牌（refreshToken 换新 token，旧令牌同时失效） */
export function refresh(options: refreshOptions) {
  return apiRequest<ResultData<Schemas.user_ResultLoginVO>>({
    url: "/api/user/auth/refresh",
    method: "post",
    query: options.query,
  })
}

/** 退出登录 */
export function logout(options: logoutOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/auth/logout",
    method: "post",
  })
}

/** 手机号+验证码登录（未注册自动注册） */
export function login(options: loginOptions) {
  return apiRequest<ResultData<Schemas.user_ResultLoginVO>>({
    url: "/api/user/auth/login",
    method: "post",
    body: options.body,
  })
}

/** 账号密码登录（支持手机号/邮箱/营业执照号） */
export function passwordLogin(options: passwordLoginOptions) {
  return apiRequest<ResultData<Schemas.user_ResultLoginVO>>({
    url: "/api/user/auth/login/password",
    method: "post",
    body: options.body,
  })
}

/** 查询我的实名认证状态 */
export function getRealNameStatus(options: getRealNameStatusOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultRealNameAuthVO>>({
    url: "/api/user/account/real-name",
    method: "get",
  })
}

/** 提交个人实名认证 */
export function submitRealName(options: submitRealNameOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/account/real-name",
    method: "post",
    body: options.body,
  })
}

/** Internal API, front-end should not call directly. */
export function getUserById(options: getUserByIdOptions) {
  return apiRequest<ResultData<Schemas.user_ResultUserVO>>({
    url: "/api/user/user/{userId}",
    method: "get",
    pathParams: options.path,
    headers: options.headers,
  })
}

/** 待审核实名认证列表（运营方） */
export function pendingRealName(options: pendingRealNameOptions) {
  return apiRequest<ResultData<Schemas.user_ResultPageResultUserVO>>({
    url: "/api/user/user/real-name/pending",
    method: "get",
    query: options.query,
  })
}

/** 用户列表（运营方，支持按状态/关键字筛选） */
export function listUsers(options: listUsersOptions) {
  return apiRequest<ResultData<Schemas.user_ResultPageResultUserVO>>({
    url: "/api/user/user/list",
    method: "get",
    query: options.query,
  })
}

/** 获取当前登录用户信息 */
export function getCurrentUser(options: getCurrentUserOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultUserVO>>({
    url: "/api/user/user/current",
    method: "get",
  })
}

/** 获取当前登录用户信息 */
export function getCurrentUser_1(options: getCurrentUser_1Options = {}) {
  return apiRequest<ResultData<Schemas.user_ResultUserVO>>({
    url: "/api/user/user/me",
    method: "get",
  })
}

/** 企业的客户趋势（按日：咨询/活跃/新增客户） */
export function enterpriseCustomerTrend(options: enterpriseCustomerTrendOptions) {
  return apiRequest<ResultData<Schemas.user_ResultListMapStringObject>>({
    url: "/api/user/stats/enterprise/{enterpriseId}/customer-trend",
    method: "get",
    pathParams: options.path,
    query: options.query,
  })
}

/** 平台用户数据摘要（今日/昨日 入驻企业、新增用户） */
export function adminSummary(options: adminSummaryOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultMapStringLong>>({
    url: "/api/user/stats/admin/summary",
    method: "get",
  })
}

/** 平台用户相关审核待办计数（企业认证/实名认证） */
export function adminPendingCounts(options: adminPendingCountsOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultMapStringLong>>({
    url: "/api/user/stats/admin/pending-counts",
    method: "get",
  })
}

/** 在线统计（在线用户/机构/专家 —— 基于 sa-token session） */
export function adminOnline(options: adminOnlineOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultMapStringLong>>({
    url: "/api/user/stats/admin/online",
    method: "get",
  })
}

/** 获取我的默认地址（无则返回 null） */
export function myDefault(options: myDefaultOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultEnterpriseShippingAddress>>({
    url: "/api/user/shipping-address/default",
    method: "get",
  })
}

/** 角色列表 */
export function list(options: listOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultListSysRole>>({
    url: "/api/user/role/list",
    method: "get",
  })
}

/** 查询指定用户积分（运营方） */
export function userPoints(options: userPointsOptions) {
  return apiRequest<ResultData<Schemas.user_ResultInteger>>({
    url: "/api/user/points/user/{userId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 积分规则说明（公开） */
export function rules(options: rulesOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultMapStringInteger>>({
    url: "/api/user/points/rules",
    method: "get",
  })
}

/** 我的总积分 */
export function myPoints(options: myPointsOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultInteger>>({
    url: "/api/user/points/my",
    method: "get",
  })
}

/** 我的积分流水（分页） */
export function myHistory(options: myHistoryOptions) {
  return apiRequest<ResultData<Schemas.user_ResultPageResultPointsRecord>>({
    url: "/api/user/points/my/history",
    method: "get",
    query: options.query,
  })
}

/** 获取我的默认开票资料（无则返回 null） */
export function myDefault_1(options: myDefault_1Options = {}) {
  return apiRequest<ResultData<Schemas.user_ResultEnterpriseInvoiceInfo>>({
    url: "/api/user/invoice-info/default",
    method: "get",
  })
}

/** Internal API, front-end should not call directly. */
export function getInstitutionUserId(options: getInstitutionUserIdOptions) {
  return apiRequest<ResultData<number>>({
    url: "/api/user/enterprise/{enterpriseId}/institution-user-id",
    method: "get",
    pathParams: options.path,
  })
}

/** 工作台-待办事项（9 项） */
export function todo(options: todoOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultEnterpriseTodoVO>>({
    url: "/api/user/enterprise/workbench/todo",
    method: "get",
  })
}

/** 工作台-顶部 5 卡摘要 */
export function summary(options: summaryOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultEnterpriseSummaryVO>>({
    url: "/api/user/enterprise/workbench/summary",
    method: "get",
  })
}

/** 工作台-业务承接总览（累计订单/进行中/已完成/待响应需求） */
export function serviceOverview(options: serviceOverviewOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultServiceOverviewVO>>({
    url: "/api/user/enterprise/workbench/service-overview",
    method: "get",
  })
}

/** 工作台-服务与商品总览（按 serviceType 的订单分布，饼图） */
export function serviceDistribution(options: serviceDistributionOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultListServiceDistributionVO>>({
    url: "/api/user/enterprise/workbench/service-distribution",
    method: "get",
  })
}

/** 工作台-接单与转化趋势 */
export function orderTrend(options: orderTrendOptions) {
  return apiRequest<ResultData<Schemas.user_ResultListOrderTrendPointVO>>({
    url: "/api/user/enterprise/workbench/order-trend",
    method: "get",
    query: options.query,
  })
}

/** 工作台-收入结构（环形图） */
export function incomeStructure(options: incomeStructureOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultIncomeStructureVO>>({
    url: "/api/user/enterprise/workbench/income-structure",
    method: "get",
  })
}

/** 工作台-业务执行与交付趋势 */
export function deliveryTrend(options: deliveryTrendOptions) {
  return apiRequest<ResultData<Schemas.user_ResultListDeliveryTrendPointVO>>({
    url: "/api/user/enterprise/workbench/delivery-trend",
    method: "get",
    query: options.query,
  })
}

/** 工作台-用户趋势（咨询/活跃/新增） */
export function customerTrend(options: customerTrendOptions) {
  return apiRequest<ResultData<Schemas.user_ResultListCustomerTrendPointVO>>({
    url: "/api/user/enterprise/workbench/customer-trend",
    method: "get",
    query: options.query,
  })
}

/** 待审核企业列表（运营方） */
export function pendingList(options: pendingListOptions) {
  return apiRequest<ResultData<Schemas.user_ResultPageResultEnterpriseVO>>({
    url: "/api/user/enterprise/pending",
    method: "get",
    query: options.query,
  })
}

/** 获取我的企业信息 */
export function getMyEnterprise(options: getMyEnterpriseOptions = {}) {
  return apiRequest<ResultData<Schemas.user_ResultEnterpriseVO>>({
    url: "/api/user/enterprise/my",
    method: "get",
  })
}

/** 分页查询已认证机构列表（公开） */
export function pageInstitutions(options: pageInstitutionsOptions) {
  return apiRequest<ResultData<Schemas.user_ResultPageResultEnterpriseVO>>({
    url: "/api/user/enterprise/list",
    method: "get",
    query: options.query,
  })
}

/** 所有企业列表（运营方，支持按状态/关键字筛选） */
export function allList(options: allListOptions) {
  return apiRequest<ResultData<Schemas.user_ResultPageResultEnterpriseVO>>({
    url: "/api/user/enterprise/all",
    method: "get",
    query: options.query,
  })
}

/** 撤销用户某个角色 */
export function removeRole(options: removeRoleOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/role/user/{userId}/remove",
    method: "delete",
    pathParams: options.path,
    query: options.query,
  })
}

/** 删除企业证书 */
export function deleteCert(options: deleteCertOptions) {
  return apiRequest<ResultData<Schemas.user_ResultVoid>>({
    url: "/api/user/enterprise/{enterpriseId}/cert/{certId}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 修改字典项（运营方） */
export function update_3(options: update_3Options) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/dict/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除字典项（运营方） */
export function delete_api_2(options: delete_api_2Options) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/dict/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 启用/禁用字典项（运营方） */
export function toggleStatus(options: toggleStatusOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/dict/{id}/status",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 启用用户 */
export function enable(options: enableOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/admin/user/{userId}/enable",
    method: "put",
    pathParams: options.path,
  })
}

/** 禁用用户 */
export function disable(options: disableOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/admin/user/{userId}/disable",
    method: "put",
    pathParams: options.path,
  })
}

/** 作废/隐藏违规报告 */
export function invalidate(options: invalidateOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/admin/report/{reportId}/invalidate",
    method: "put",
    pathParams: options.path,
  })
}

/** 强制关闭订单（介入纠纷） */
export function forceClose(options: forceCloseOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/admin/order/{orderId}/force-close",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 启用企业 */
export function enable_1(options: enable_1Options) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/admin/enterprise/{enterpriseId}/enable",
    method: "put",
    pathParams: options.path,
  })
}

/** 禁用企业 */
export function disable_1(options: disable_1Options) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/admin/enterprise/{enterpriseId}/disable",
    method: "put",
    pathParams: options.path,
  })
}

/** 审核企业入驻申请 */
export function audit(options: auditOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/admin/enterprise/{enterpriseId}/audit",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 审核通过/下架资讯（status:1=发布 0=草稿 2=下架） */
export function updateArticleStatus(options: updateArticleStatusOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/admin/content/article/{id}/status",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 新增字典项（运营方） */
export function create_3(options: create_3Options) {
  return apiRequest<ResultData<Schemas.admin_ResultLong>>({
    url: "/api/admin/dict",
    method: "post",
    body: options.body,
  })
}

/** 查询所有字典类型（运营方） */
export function allTypes(options: allTypesOptions = {}) {
  return apiRequest<ResultData<Schemas.admin_ResultListString>>({
    url: "/api/admin/dict/types",
    method: "get",
  })
}

/** 按类型查询字典列表（公开） */
export function listByType(options: listByTypeOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultListDict>>({
    url: "/api/admin/dict/list/{dictType}",
    method: "get",
    pathParams: options.path,
  })
}

/** 用户详情 */
export function getUser(options: getUserOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/user/{userId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 用户列表（支持按状态/关键字筛选） */
export function listUsers_2(options: listUsers_2Options) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/user/list",
    method: "get",
    query: options.query,
  })
}

/** 查看操作日志 */
export function auditLog(options: auditLogOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultPageResultAuditLog>>({
    url: "/api/admin/admin/system/audit-log",
    method: "get",
    query: options.query,
  })
}

/** 查看报告详情 */
export function getReport(options: getReportOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/report/{reportId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 报告全列表 */
export function listReports(options: listReportsOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/report/list",
    method: "get",
    query: options.query,
  })
}

/** 查看订单详情 */
export function getOrder(options: getOrderOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/order/{orderId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 订单全列表 */
export function listOrders(options: listOrdersOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/order/list",
    method: "get",
    query: options.query,
  })
}

/** 查看所有需求列表 */
export function listDemands(options: listDemandsOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/order/demands",
    method: "get",
    query: options.query,
  })
}

/** 需求详情 */
export function getDemand(options: getDemandOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/order/demand/{demandId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 删除违规需求（软删） */
export function deleteDemand(options: deleteDemandOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/admin/order/demand/{demandId}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 查看指定订单评价 */
export function getByOrder(options: getByOrderOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/evaluation/order/{orderId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 评价全列表 */
export function list_2(options: list_2Options) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/evaluation/list",
    method: "get",
    query: options.query,
  })
}

/** 企业详情 */
export function detail_2(options: detail_2Options) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/enterprise/{enterpriseId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 待审核企业列表 */
export function pendingList_2(options: pendingList_2Options) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/enterprise/pending",
    method: "get",
    query: options.query,
  })
}

/** 所有企业列表（支持按状态/关键字筛选） */
export function allList_2(options: allList_2Options) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/enterprise/list",
    method: "get",
    query: options.query,
  })
}

/** 工作台-服务交易与质量产出趋势 */
export function tradeTrend(options: tradeTrendOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultListTradeTrendPointVO>>({
    url: "/api/admin/admin/dashboard/workbench/trade-trend",
    method: "get",
    query: options.query,
  })
}

/** 工作台-顶部 5 卡摘要 */
export function workbenchSummary(options: workbenchSummaryOptions = {}) {
  return apiRequest<ResultData<Schemas.admin_ResultWorkbenchSummaryVO>>({
    url: "/api/admin/admin/dashboard/workbench/summary",
    method: "get",
  })
}

/** 工作台-质量服务结构分布（环形图） */
export function serviceDistribution_2(options: serviceDistribution_2Options = {}) {
  return apiRequest<ResultData<Schemas.admin_ResultListServiceDistributionVO>>({
    url: "/api/admin/admin/dashboard/workbench/service-distribution",
    method: "get",
  })
}

/** 工作台-审核待办计数（8 项） */
export function workbenchPendingAudits(options: workbenchPendingAuditsOptions = {}) {
  return apiRequest<ResultData<Schemas.admin_ResultWorkbenchPendingAuditsVO>>({
    url: "/api/admin/admin/dashboard/workbench/pending-audits",
    method: "get",
  })
}

/** 工作台-在线统计（用户/机构/专家） */
export function onlineStats(options: onlineStatsOptions = {}) {
  return apiRequest<ResultData<Schemas.admin_ResultOnlineStatsVO>>({
    url: "/api/admin/admin/dashboard/workbench/online-stats",
    method: "get",
  })
}

/** 工作台-热门检测品类词云 */
export function categoryCloud(options: categoryCloudOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultListHotCategoryVO>>({
    url: "/api/admin/admin/dashboard/workbench/category-cloud",
    method: "get",
    query: options.query,
  })
}

/** 工作台-检测业务趋势（发布/响应/完成） */
export function businessTrend(options: businessTrendOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultListBusinessTrendPointVO>>({
    url: "/api/admin/admin/dashboard/workbench/business-trend",
    method: "get",
    query: options.query,
  })
}

/** 平台数据概览（原有） */
export function overview(options: overviewOptions = {}) {
  return apiRequest<ResultData<Schemas.admin_ResultDashboardOverviewVO>>({
    url: "/api/admin/admin/dashboard/overview",
    method: "get",
  })
}

/** 查看问答列表 */
export function listQuestions(options: listQuestionsOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/content/questions",
    method: "get",
    query: options.query,
  })
}

/** 问答详情 */
export function getQuestion(options: getQuestionOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/content/question/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 删除违规问答（软删） */
export function deleteQuestion(options: deleteQuestionOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/admin/content/question/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 查看资讯列表（含草稿/待审） */
export function listArticles(options: listArticlesOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/content/articles",
    method: "get",
    query: options.query,
  })
}

/** 资讯详情 */
export function getArticle(options: getArticleOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultObject>>({
    url: "/api/admin/admin/content/article/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 删除违规资讯 */
export function deleteArticle(options: deleteArticleOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/admin/content/article/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 删除违规评价 */
export function delete_1_2(options: delete_1_2Options) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/admin/evaluation/{evaluationId}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 删除违规评论 */
export function deleteComment(options: deleteCommentOptions) {
  return apiRequest<ResultData<Schemas.admin_ResultVoid>>({
    url: "/api/admin/admin/content/comment/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 取消报名 */
export function cancelEnrollment(options: cancelEnrollmentOptions) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/training/enrollment/{id}/cancel",
    method: "put",
    pathParams: options.path,
  })
}

/** 培训课程详情（公开） */
export function courseDetail(options: courseDetailOptions) {
  return apiRequest<ResultData<Schemas.base_ResultTrainingCourse>>({
    url: "/api/base/training/course/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 修改培训课程（运营方） */
export function updateCourse(options: updateCourseOptions) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/training/course/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除培训课程（运营方） */
export function deleteCourse(options: deleteCourseOptions) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/training/course/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 标准详情（公开） */
export function detail_3(options: detail_3Options) {
  return apiRequest<ResultData<Schemas.base_ResultStandard>>({
    url: "/api/base/standard/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 修改标准（运营方） */
export function update_4(options: update_4Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/standard/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除标准（运营方） */
export function delete_api_3(options: delete_api_3Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/standard/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 政策详情（公开） */
export function detail_1_2(options: detail_1_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultPolicy>>({
    url: "/api/base/policy/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 修改政策（运营方） */
export function update_1_2(options: update_1_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/policy/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除政策（运营方） */
export function delete_1_3(options: delete_1_3Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/policy/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 计量器具详情（公开） */
export function detail_3_2(options: detail_3_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultMeasurementInstrument>>({
    url: "/api/base/measurement-instrument/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 修改计量器具（运营方） */
export function update_2_2(options: update_2_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/measurement-instrument/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除计量器具（运营方） */
export function delete_2_2(options: delete_2_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/measurement-instrument/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 知识详情（公开） */
export function detail_4(options: detail_4Options) {
  return apiRequest<ResultData<Schemas.base_ResultKnowledge>>({
    url: "/api/base/knowledge/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 修改知识内容 */
export function update_3_2(options: update_3_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/knowledge/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除知识内容（运营方） */
export function delete_3(options: delete_3Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/knowledge/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 机构更新服务范围/简介/联系方式（入驻机构自助修改） */
export function updateService(options: updateServiceOptions) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/institution/{id}/service",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 运营方强制更新机构信息 */
export function adminUpdate(options: adminUpdateOptions) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/institution/{id}/admin",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 项目详情（公开） */
export function detail_6(options: detail_6Options) {
  return apiRequest<ResultData<Schemas.base_ResultInspectionItem>>({
    url: "/api/base/inspection-item/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 修改检测项目（运营方） */
export function update_4_2(options: update_4_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/inspection-item/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除检测项目（运营方） */
export function delete_4(options: delete_4Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/inspection-item/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 运营方审核申请（通过自动入库，驳回记录原因） */
export function audit_2(options: audit_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/inspection-item/apply/{id}/audit",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 问卷详情含题目列表（公开） */
export function detail_7(options: detail_7Options) {
  return apiRequest<ResultData<Schemas.base_ResultMapStringObject>>({
    url: "/api/base/diagnosis/tool/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 修改问卷（运营方） */
export function update_5(options: update_5Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/diagnosis/tool/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 上线/下线问卷（运营方） */
export function toggleStatus_2(options: toggleStatus_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/diagnosis/tool/{id}/status",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 修改题目（运营方） */
export function updateQuestion(options: updateQuestionOptions) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/diagnosis/tool/question/{questionId}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除题目（运营方） */
export function deleteQuestion_2(options: deleteQuestion_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/diagnosis/tool/question/{questionId}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 诊断案例详情（公开） */
export function caseDetail(options: caseDetailOptions) {
  return apiRequest<ResultData<Schemas.base_ResultDiagnosisCase>>({
    url: "/api/base/diagnosis/case/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 修改诊断案例（运营方） */
export function updateCase(options: updateCaseOptions) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/diagnosis/case/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除诊断案例（运营方） */
export function deleteCase(options: deleteCaseOptions) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/diagnosis/case/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 诊断机构详情（公开） */
export function agencyDetail(options: agencyDetailOptions) {
  return apiRequest<ResultData<Schemas.base_ResultDiagnosisAgency>>({
    url: "/api/base/diagnosis/agency/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 修改诊断机构（运营方） */
export function updateAgency(options: updateAgencyOptions) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/diagnosis/agency/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除诊断机构（运营方） */
export function deleteAgency(options: deleteAgencyOptions) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/diagnosis/agency/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 运营方：回复需求 */
export function reply(options: replyOptions) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/consultation/admin/{id}/reply",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 运营方：关闭需求 */
export function close(options: closeOptions) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/consultation/admin/{id}/close",
    method: "put",
    pathParams: options.path,
  })
}

/** 认证流程指南详情（公开） */
export function guideDetail(options: guideDetailOptions) {
  return apiRequest<ResultData<Schemas.base_ResultCertGuide>>({
    url: "/api/base/certification/guide/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 修改认证流程指南（运营方） */
export function updateGuide(options: updateGuideOptions) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/certification/guide/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除认证流程指南（运营方） */
export function deleteGuide(options: deleteGuideOptions) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/certification/guide/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 认证机构详情（公开） */
export function agencyDetail_1(options: agencyDetail_1Options) {
  return apiRequest<ResultData<Schemas.base_ResultCertificationAgency>>({
    url: "/api/base/certification/agency/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 修改认证机构（运营方） */
export function updateAgency_1(options: updateAgency_1Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/certification/agency/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除认证机构（运营方） */
export function deleteAgency_1(options: deleteAgency_1Options) {
  return apiRequest<ResultData<Schemas.base_ResultVoid>>({
    url: "/api/base/certification/agency/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 新增培训课程（运营方） */
export function createCourse(options: createCourseOptions) {
  return apiRequest<ResultData<Schemas.base_ResultLong>>({
    url: "/api/base/training/course",
    method: "post",
    body: options.body,
  })
}

/** 培训课程报名 */
export function enroll(options: enrollOptions) {
  return apiRequest<ResultData<Schemas.base_ResultLong>>({
    url: "/api/base/training/course/{courseId}/enroll",
    method: "post",
    pathParams: options.path,
    body: options.body,
  })
}

/** 新增标准（运营方） */
export function create_4(options: create_4Options) {
  return apiRequest<ResultData<Schemas.base_ResultLong>>({
    url: "/api/base/standard",
    method: "post",
    body: options.body,
  })
}

/** 订阅/取消订阅标准（切换） */
export function toggle(options: toggleOptions) {
  return apiRequest<ResultData<Schemas.base_ResultBoolean>>({
    url: "/api/base/standard/follow/toggle/{standardId}",
    method: "post",
    pathParams: options.path,
  })
}

/** 新增政策（运营方） */
export function create_1_2(options: create_1_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultLong>>({
    url: "/api/base/policy",
    method: "post",
    body: options.body,
  })
}

/** 新增计量器具（运营方） */
export function create_2_2(options: create_2_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultLong>>({
    url: "/api/base/measurement-instrument",
    method: "post",
    body: options.body,
  })
}

/** 发布知识内容 */
export function create_3_2(options: create_3_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultLong>>({
    url: "/api/base/knowledge",
    method: "post",
    body: options.body,
  })
}

/** 新增检测项目（运营方） */
export function create_4_2(options: create_4_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultLong>>({
    url: "/api/base/inspection-item",
    method: "post",
    body: options.body,
  })
}

/** 机构提交自定义检测项目申请 */
export function apply(options: applyOptions) {
  return apiRequest<ResultData<Schemas.base_ResultLong>>({
    url: "/api/base/inspection-item/apply",
    method: "post",
    body: options.body,
  })
}

/** 新增自评问卷（运营方） */
export function create_5(options: create_5Options) {
  return apiRequest<ResultData<Schemas.base_ResultLong>>({
    url: "/api/base/diagnosis/tool",
    method: "post",
    body: options.body,
  })
}

/** 新增题目（运营方） */
export function addQuestion(options: addQuestionOptions) {
  return apiRequest<ResultData<Schemas.base_ResultLong>>({
    url: "/api/base/diagnosis/tool/{questionnaireId}/question",
    method: "post",
    pathParams: options.path,
    body: options.body,
  })
}

/** 提交自评答案，返回诊断评分与建议 */
export function submit(options: submitOptions) {
  return apiRequest<ResultData<Schemas.base_ResultMapStringObject>>({
    url: "/api/base/diagnosis/tool/{id}/submit",
    method: "post",
    pathParams: options.path,
    body: options.body,
  })
}

/** 新增诊断案例（运营方） */
export function createCase(options: createCaseOptions) {
  return apiRequest<ResultData<Schemas.base_ResultLong>>({
    url: "/api/base/diagnosis/case",
    method: "post",
    body: options.body,
  })
}

/** 新增诊断机构（运营方） */
export function createAgency(options: createAgencyOptions) {
  return apiRequest<ResultData<Schemas.base_ResultLong>>({
    url: "/api/base/diagnosis/agency",
    method: "post",
    body: options.body,
  })
}

/** 提交服务需求（可匿名，登录后自动关联） */
export function submit_1(options: submit_1Options) {
  return apiRequest<ResultData<Schemas.base_ResultLong>>({
    url: "/api/base/consultation/submit",
    method: "post",
    body: options.body,
  })
}

/** 新增认证流程指南（运营方） */
export function createGuide(options: createGuideOptions) {
  return apiRequest<ResultData<Schemas.base_ResultLong>>({
    url: "/api/base/certification/guide",
    method: "post",
    body: options.body,
  })
}

/** 新增认证机构（运营方） */
export function createAgency_1(options: createAgency_1Options) {
  return apiRequest<ResultData<Schemas.base_ResultLong>>({
    url: "/api/base/certification/agency",
    method: "post",
    body: options.body,
  })
}

/** 我的报名列表 */
export function myEnrollments(options: myEnrollmentsOptions = {}) {
  return apiRequest<ResultData<Schemas.base_ResultListTrainingEnrollment>>({
    url: "/api/base/training/enrollment/my",
    method: "get",
  })
}

/** 查看课程报名列表（运营方） */
export function courseEnrollments(options: courseEnrollmentsOptions) {
  return apiRequest<ResultData<Schemas.base_ResultListTrainingEnrollment>>({
    url: "/api/base/training/course/{courseId}/enrollments",
    method: "get",
    pathParams: options.path,
  })
}

/** 分页查询培训课程（公开） */
export function courseList(options: courseListOptions) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultTrainingCourse>>({
    url: "/api/base/training/course/list",
    method: "get",
    query: options.query,
  })
}

/** 分页查询标准（公开） */
export function list_3(options: list_3Options) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultStandard>>({
    url: "/api/base/standard/list",
    method: "get",
    query: options.query,
  })
}

/** 查询是否已订阅 */
export function status(options: statusOptions) {
  return apiRequest<ResultData<Schemas.base_ResultBoolean>>({
    url: "/api/base/standard/follow/status/{standardId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 我的订阅列表（分页） */
export function myFollows(options: myFollowsOptions) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultStandardFollow>>({
    url: "/api/base/standard/follow/my",
    method: "get",
    query: options.query,
  })
}

/** 分页查询政策法规（公开） */
export function list_1(options: list_1Options) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultPolicy>>({
    url: "/api/base/policy/list",
    method: "get",
    query: options.query,
  })
}

/** 计量机构详情（公开） */
export function detail_2_2(options: detail_2_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultMeasurement>>({
    url: "/api/base/measurement/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 分页查询计量机构（公开） */
export function list_2_2(options: list_2_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultMeasurement>>({
    url: "/api/base/measurement/list",
    method: "get",
    query: options.query,
  })
}

/** 分页查询计量器具（公开） */
export function list_3_2(options: list_3_2Options) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultMeasurementInstrument>>({
    url: "/api/base/measurement-instrument/list",
    method: "get",
    query: options.query,
  })
}

/** 分页查询知识库（公开） */
export function list_4(options: list_4Options) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultKnowledge>>({
    url: "/api/base/knowledge/list",
    method: "get",
    query: options.query,
  })
}

/** 机构详情（公开，未登录用户联系电话隐藏防跳单） */
export function detail_5(options: detail_5Options) {
  return apiRequest<ResultData<Schemas.base_ResultInstitution>>({
    url: "/api/base/institution/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** ES全文搜索检测机构（公开） */
export function search(options: searchOptions) {
  return apiRequest<ResultData<Schemas.base_ResultListInstitutionEsDoc>>({
    url: "/api/base/institution/search",
    method: "get",
    query: options.query,
  })
}

/** 分页查询检测机构（公开） */
export function list_5(options: list_5Options) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultInstitution>>({
    url: "/api/base/institution/list",
    method: "get",
    query: options.query,
  })
}

/** 分页查询检测项目（公开） */
export function list_6(options: list_6Options) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultInspectionItem>>({
    url: "/api/base/inspection-item/list",
    method: "get",
    query: options.query,
  })
}

/** 按分类列出全部项目（公开，供下单选择） */
export function byCategory(options: byCategoryOptions) {
  return apiRequest<ResultData<Schemas.base_ResultListInspectionItem>>({
    url: "/api/base/inspection-item/by-category",
    method: "get",
    query: options.query,
  })
}

/** 我的申请列表（机构方） */
export function myApplies(options: myAppliesOptions) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultInspectionItemApply>>({
    url: "/api/base/inspection-item/apply/my",
    method: "get",
    query: options.query,
  })
}

/** 运营方查看全部申请 */
export function adminList(options: adminListOptions) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultInspectionItemApply>>({
    url: "/api/base/inspection-item/apply/admin/list",
    method: "get",
    query: options.query,
  })
}

/** 自评问卷列表（公开） */
export function list_7(options: list_7Options) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultDiagnosisQuestionnaire>>({
    url: "/api/base/diagnosis/tool/list",
    method: "get",
    query: options.query,
  })
}

/** 分页查询诊断案例（公开） */
export function caseList(options: caseListOptions) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultDiagnosisCase>>({
    url: "/api/base/diagnosis/case/list",
    method: "get",
    query: options.query,
  })
}

/** 分页查询诊断机构（公开） */
export function agencyList(options: agencyListOptions) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultDiagnosisAgency>>({
    url: "/api/base/diagnosis/agency/list",
    method: "get",
    query: options.query,
  })
}

/** 需求详情 */
export function detail_8(options: detail_8Options) {
  return apiRequest<ResultData<Schemas.base_ResultServiceConsultation>>({
    url: "/api/base/consultation/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 我的需求列表 */
export function myList(options: myListOptions = {}) {
  return apiRequest<ResultData<Schemas.base_ResultListServiceConsultation>>({
    url: "/api/base/consultation/my",
    method: "get",
  })
}

/** 运营方：分页查看所有需求 */
export function adminList_1(options: adminList_1Options) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultServiceConsultation>>({
    url: "/api/base/consultation/admin/list",
    method: "get",
    query: options.query,
  })
}

/** 认证流程指南列表（公开） */
export function guideList(options: guideListOptions) {
  return apiRequest<ResultData<Schemas.base_ResultListCertGuide>>({
    url: "/api/base/certification/guide/list",
    method: "get",
    query: options.query,
  })
}

/** 分页查询认证机构（公开） */
export function agencyList_1(options: agencyList_1Options) {
  return apiRequest<ResultData<Schemas.base_ResultPageResultCertificationAgency>>({
    url: "/api/base/certification/agency/list",
    method: "get",
    query: options.query,
  })
}

/** 作废违规报告（运营方） */
export function invalidate_2(options: invalidate_2Options) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/report/{reportId}/invalidate",
    method: "put",
    pathParams: options.path,
  })
}

/** 机构确认线下退款完成（status 1→2） */
export function institutionConfirm(options: institutionConfirmOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/refund/{id}/institution-confirm",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 运营方审核退款申请（通过=通知机构，驳回=3） */
export function audit_3(options: audit_3Options) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/refund/{id}/audit",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 放款：资金托管→已放款（确认报告后自动调用，运营方也可手动触发） */
export function releaseEscrow(options: releaseEscrowOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/order/{orderId}/release-escrow",
    method: "put",
    pathParams: options.path,
  })
}

/** 支付回调：资金入托管，订单 0→1（待寄样） */
export function payCallback(options: payCallbackOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/order/{orderId}/pay-callback",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 上传线下支付凭证（待支付订单） */
export function uploadOfflinePayment(options: uploadOfflinePaymentOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/order/{orderId}/offline-payment",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 确认报告完成 */
export function confirmReport(options: confirmReportOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/order/{orderId}/confirm-report",
    method: "put",
    pathParams: options.path,
  })
}

/** 机构确认线下收款，订单 0→1 */
export function confirmOfflinePayment(options: confirmOfflinePaymentOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/order/{orderId}/confirm-offline-payment",
    method: "put",
    pathParams: options.path,
  })
}

/** 取消订单 */
export function cancelOrder(options: cancelOrderOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/order/{orderId}/cancel",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 修改委托（异常订单，调整检测项目等） */
export function amendEntrust(options: amendEntrustOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/order/{orderId}/amend-entrust",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 处理发票申请（机构/运营方） */
export function handle(options: handleOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/invoice/{applyId}/handle",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 发布草稿（status 0→1） */
export function publishDraft(options: publishDraftOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/demand/{demandId}/publish",
    method: "put",
    pathParams: options.path,
  })
}

/** 修改草稿内容 */
export function updateDraft(options: updateDraftOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/demand/{demandId}/draft",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 关闭需求 */
export function closeDemand(options: closeDemandOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/demand/{demandId}/close",
    method: "put",
    pathParams: options.path,
  })
}

/** 生成报告 PDF（iText7 → MinIO） */
export function generate(options: generateOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultReport>>({
    url: "/api/trade/report/{reportId}/generate",
    method: "post",
    pathParams: options.path,
  })
}

/** 机构上传检测报告 */
export function upload_2(options: upload_2Options) {
  return apiRequest<ResultData<Schemas.trade_ResultLong>>({
    url: "/api/trade/report/upload",
    method: "post",
    body: options.body,
  })
}

/** 提交退款申请 */
export function apply_2(options: apply_2Options) {
  return apiRequest<ResultData<Schemas.trade_ResultLong>>({
    url: "/api/trade/refund/apply",
    method: "post",
    body: options.body,
  })
}

/** 补样申请（异常订单，需求方重新寄送样品） */
export function sampleSupplement(options: sampleSupplementOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/order/{orderId}/sample-supplement",
    method: "post",
    pathParams: options.path,
    query: options.query,
  })
}

/** 退样申请（异常订单，需求方申请退回样品） */
export function sampleReturn(options: sampleReturnOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/order/{orderId}/sample-return",
    method: "post",
    pathParams: options.path,
    query: options.query,
  })
}

/** 需求方提交寄样/上门取样信息，状态 1→2 */
export function submitShipping(options: submitShippingOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/order/shipping",
    method: "post",
    body: options.body,
  })
}

/** 机构确认收样，状态 2→3(检测中)或 8(异常) */
export function receiveConfirm(options: receiveConfirmOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/order/receive-confirm",
    method: "post",
    body: options.body,
  })
}

/** 提交服务评价 */
export function evaluate(options: evaluateOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/order/evaluate",
    method: "post",
    body: options.body,
  })
}

/** 直接下单（计量/认证/标准编写） */
export function placeDirectOrder(options: placeDirectOrderOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultLong>>({
    url: "/api/trade/order/direct",
    method: "post",
    body: options.body,
  })
}

/** 下单确认（推荐） */
export function confirmOrder(options: confirmOrderOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultLong>>({
    url: "/api/trade/order/confirm",
    method: "post",
    body: options.body,
  })
}

/** 确认报价生成订单（旧接口，保留兼容） */
export function confirmBid(options: confirmBidOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultLong>>({
    url: "/api/trade/order/confirm/{bidId}",
    method: "post",
    pathParams: options.path,
  })
}

/** 机构添加进度节点 */
export function add(options: addOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/order-progress/{orderId}/add",
    method: "post",
    pathParams: options.path,
    query: options.query,
  })
}

/** 提交发票申请 */
export function apply_1(options: apply_1Options) {
  return apiRequest<ResultData<Schemas.trade_ResultLong>>({
    url: "/api/trade/invoice/apply",
    method: "post",
    body: options.body,
  })
}

/** 发布检测需求 */
export function publishDemand(options: publishDemandOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultLong>>({
    url: "/api/trade/demand/publish",
    method: "post",
    body: options.body,
  })
}

/** 暂存草稿（必填字段可不完整） */
export function saveDraft(options: saveDraftOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultLong>>({
    url: "/api/trade/demand/draft",
    method: "post",
    body: options.body,
  })
}

/** 机构报价 */
export function submitBid(options: submitBidOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultLong>>({
    url: "/api/trade/demand/bid",
    method: "post",
    body: options.body,
  })
}

/** 根据选择的检测项目自动计算报价明细 */
export function calculate(options: calculateOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultListBidFeeItem>>({
    url: "/api/trade/bid/auto-quote/calculate",
    method: "post",
    body: options.body,
  })
}

/** 查询报价费用明细 */
export function list_1_2(options: list_1_2Options) {
  return apiRequest<ResultData<Schemas.trade_ResultListBidFeeItem>>({
    url: "/api/trade/bid-fee/{bidId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 保存/更新报价费用明细（机构提交报价时调用） */
export function save(options: saveOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/bid-fee/{bidId}",
    method: "post",
    pathParams: options.path,
    body: options.body,
  })
}

/** 企业待办事项计数 */
export function enterpriseTodo(options: enterpriseTodoOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultMapStringLong>>({
    url: "/api/trade/stats/enterprise/{enterpriseId}/todo",
    method: "get",
    pathParams: options.path,
  })
}

/** 企业工作台摘要（今日订单/待办需求/完成报告/今日收入） */
export function enterpriseSummary(options: enterpriseSummaryOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultMapStringObject>>({
    url: "/api/trade/stats/enterprise/{enterpriseId}/summary",
    method: "get",
    pathParams: options.path,
  })
}

/** 企业-服务与商品总览（按 serviceType 的订单分布） */
export function enterpriseServiceDistribution(options: enterpriseServiceDistributionOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultListMapStringObject>>({
    url: "/api/trade/stats/enterprise/{enterpriseId}/service-distribution",
    method: "get",
    pathParams: options.path,
  })
}

/** 企业接单与转化趋势（按日聚合：接收/报价/成交） */
export function enterpriseOrderTrend(options: enterpriseOrderTrendOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultListMapStringObject>>({
    url: "/api/trade/stats/enterprise/{enterpriseId}/order-trend",
    method: "get",
    pathParams: options.path,
    query: options.query,
  })
}

/** 企业收入结构（已回款/待回款/退款） */
export function enterpriseIncome(options: enterpriseIncomeOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultMapStringBigDecimal>>({
    url: "/api/trade/stats/enterprise/{enterpriseId}/income",
    method: "get",
    pathParams: options.path,
  })
}

/** 企业-执行与交付趋势（按日：进行中/完成/报告上传） */
export function enterpriseDeliveryTrend(options: enterpriseDeliveryTrendOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultListMapStringObject>>({
    url: "/api/trade/stats/enterprise/{enterpriseId}/delivery-trend",
    method: "get",
    pathParams: options.path,
    query: options.query,
  })
}

/** 企业-业务承接总览（累计订单/进行中/已完成/待响应需求） */
export function enterpriseBusinessOverview(options: enterpriseBusinessOverviewOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultMapStringLong>>({
    url: "/api/trade/stats/enterprise/{enterpriseId}/business-overview",
    method: "get",
    pathParams: options.path,
  })
}

/** 服务交易与质量产出趋势（按日聚合：成交/已完成/平台收入） */
export function adminTradeTrend(options: adminTradeTrendOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultListMapStringObject>>({
    url: "/api/trade/stats/admin/trade-trend",
    method: "get",
    query: options.query,
  })
}

/** 平台交易数据摘要（今日/昨日） */
export function adminSummary_2(options: adminSummary_2Options = {}) {
  return apiRequest<ResultData<Schemas.trade_ResultMapStringLong>>({
    url: "/api/trade/stats/admin/summary",
    method: "get",
  })
}

/** 质量服务结构分布（需求按 serviceType 聚合） */
export function adminServiceDistribution(options: adminServiceDistributionOptions = {}) {
  return apiRequest<ResultData<Schemas.trade_ResultListMapStringObject>>({
    url: "/api/trade/stats/admin/service-distribution",
    method: "get",
  })
}

/** 平台交易相关待审核/异常计数 */
export function adminPendingCounts_2(options: adminPendingCounts_2Options = {}) {
  return apiRequest<ResultData<Schemas.trade_ResultMapStringLong>>({
    url: "/api/trade/stats/admin/pending-counts",
    method: "get",
  })
}

/** 热门检测品类词云（TOP-K 品类） */
export function adminCategoryCloud(options: adminCategoryCloudOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultListMapStringObject>>({
    url: "/api/trade/stats/admin/category-cloud",
    method: "get",
    query: options.query,
  })
}

/** 检测业务趋势（按日聚合：发布需求/响应需求/完成检测） */
export function adminBusinessTrend(options: adminBusinessTrendOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultListMapStringObject>>({
    url: "/api/trade/stats/admin/business-trend",
    method: "get",
    query: options.query,
  })
}

/** 按报告ID查看报告（运营方） */
export function getById(options: getByIdOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultReport>>({
    url: "/api/trade/report/{reportId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 下载报告 PDF（鉴权后返回 PreSigned URL，15 分钟有效） */
export function download(options: downloadOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultDownloadUrlVO>>({
    url: "/api/trade/report/{reportId}/download",
    method: "get",
    pathParams: options.path,
  })
}

/** 按报告编号查验（公开） */
export function verify(options: verifyOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultReport>>({
    url: "/api/trade/report/verify/{reportNo}",
    method: "get",
    pathParams: options.path,
  })
}

/** 按订单查看报告 */
export function getByOrder_2(options: getByOrder_2Options) {
  return apiRequest<ResultData<Schemas.trade_ResultReport>>({
    url: "/api/trade/report/order/{orderId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 报告全列表（运营方） */
export function adminList_2(options: adminList_2Options) {
  return apiRequest<ResultData<Schemas.trade_ResultPageResultReport>>({
    url: "/api/trade/report/admin/list",
    method: "get",
    query: options.query,
  })
}

/** 我的退款申请列表 */
export function myList_2(options: myList_2Options = {}) {
  return apiRequest<ResultData<Schemas.trade_ResultListRefundApply>>({
    url: "/api/trade/refund/my",
    method: "get",
  })
}

/** 运营方：分页查看所有退款申请 */
export function adminList_1_2(options: adminList_1_2Options) {
  return apiRequest<ResultData<Schemas.trade_ResultPageResultRefundApply>>({
    url: "/api/trade/refund/admin/list",
    method: "get",
    query: options.query,
  })
}

/** 订单详情 */
export function getOrder_2(options: getOrder_2Options) {
  return apiRequest<ResultData<Schemas.trade_ResultOrderVO>>({
    url: "/api/trade/order/{orderId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 我的订单列表 */
export function myOrders(options: myOrdersOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultPageResultOrderVO>>({
    url: "/api/trade/order/my",
    method: "get",
    query: options.query,
  })
}

/** 按订单查评价（运营方） */
export function getEvaluation(options: getEvaluationOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultEvaluation>>({
    url: "/api/trade/order/evaluate/{orderId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 评价全列表（运营方） */
export function adminListEvaluations(options: adminListEvaluationsOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultPageResultEvaluation>>({
    url: "/api/trade/order/evaluate/admin/list",
    method: "get",
    query: options.query,
  })
}

/** 订单全列表（运营方） */
export function adminListOrders(options: adminListOrdersOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultPageResultTradeOrder>>({
    url: "/api/trade/order/admin/list",
    method: "get",
    query: options.query,
  })
}

/** 查询订单进度列表 */
export function list_8(options: list_8Options) {
  return apiRequest<ResultData<Schemas.trade_ResultListOrderProgress>>({
    url: "/api/trade/order-progress/{orderId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 我的发票申请列表 */
export function myApplies_2(options: myApplies_2Options = {}) {
  return apiRequest<ResultData<Schemas.trade_ResultListInvoiceApply>>({
    url: "/api/trade/invoice/my",
    method: "get",
  })
}

/** 需求详情 */
export function getDemand_2(options: getDemand_2Options) {
  return apiRequest<ResultData<Schemas.trade_ResultDemandVO>>({
    url: "/api/trade/demand/{demandId}",
    method: "get",
    pathParams: options.path,
  })
}

/** 删除违规需求（运营方，软删） */
export function deleteDemand_2(options: deleteDemand_2Options) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/demand/{demandId}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 查看需求报价列表 */
export function getBids(options: getBidsOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultListBidVO>>({
    url: "/api/trade/demand/{demandId}/bids",
    method: "get",
    pathParams: options.path,
  })
}

/** 我的需求列表 */
export function myDemands(options: myDemandsOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultPageResultDemandVO>>({
    url: "/api/trade/demand/my",
    method: "get",
    query: options.query,
  })
}

/** 需求大厅（公开） */
export function hall(options: hallOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultPageResultDemandVO>>({
    url: "/api/trade/demand/hall",
    method: "get",
    query: options.query,
  })
}

/** 删除违规评价（运营方） */
export function deleteEvaluation(options: deleteEvaluationOptions) {
  return apiRequest<ResultData<Schemas.trade_ResultVoid>>({
    url: "/api/trade/order/evaluate/{evaluationId}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 采纳回答 */
export function accept(options: acceptOptions) {
  return apiRequest<ResultData<Schemas.community_ResultVoid>>({
    url: "/api/community/question/{questionId}/accept/{answerId}",
    method: "put",
    pathParams: options.path,
  })
}

/** 运营方：确认预约 */
export function confirm(options: confirmOptions) {
  return apiRequest<ResultData<Schemas.community_ResultVoid>>({
    url: "/api/community/expert-appointment/{id}/confirm",
    method: "put",
    pathParams: options.path,
  })
}

/** 取消预约 */
export function cancel(options: cancelOptions) {
  return apiRequest<ResultData<Schemas.community_ResultVoid>>({
    url: "/api/community/expert-appointment/{id}/cancel",
    method: "put",
    pathParams: options.path,
  })
}

/** 资讯详情（公开） */
export function detail_2_3(options: detail_2_3Options) {
  return apiRequest<ResultData<Schemas.community_ResultArticle>>({
    url: "/api/community/article/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 修改资讯 */
export function update_6(options: update_6Options) {
  return apiRequest<ResultData<Schemas.community_ResultVoid>>({
    url: "/api/community/article/{id}",
    method: "put",
    pathParams: options.path,
    body: options.body,
  })
}

/** 删除资讯（运营方） */
export function delete_1_4(options: delete_1_4Options) {
  return apiRequest<ResultData<Schemas.community_ResultVoid>>({
    url: "/api/community/article/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 审核/下架资讯（运营方，status: 0=草稿 1=已发布 2=已下架） */
export function updateStatus_2(options: updateStatus_2Options) {
  return apiRequest<ResultData<Schemas.community_ResultVoid>>({
    url: "/api/community/article/{id}/status",
    method: "put",
    pathParams: options.path,
    query: options.query,
  })
}

/** 发布问题 */
export function post(options: postOptions) {
  return apiRequest<ResultData<Schemas.community_ResultLong>>({
    url: "/api/community/question",
    method: "post",
    body: options.body,
  })
}

/** 回答问题 */
export function answer(options: answerOptions) {
  return apiRequest<ResultData<Schemas.community_ResultLong>>({
    url: "/api/community/question/{id}/answer",
    method: "post",
    pathParams: options.path,
    body: options.body,
  })
}

/** 切换点赞（已赞则取消，未赞则点赞） */
export function toggle_2(options: toggle_2Options) {
  return apiRequest<ResultData<Schemas.community_ResultBoolean>>({
    url: "/api/community/like/toggle",
    method: "post",
    query: options.query,
  })
}

/** 关注/取消关注问题 */
export function toggle_1(options: toggle_1Options) {
  return apiRequest<ResultData<Schemas.community_ResultBoolean>>({
    url: "/api/community/follow/question/toggle",
    method: "post",
    query: options.query,
  })
}

/** 切换收藏（已收藏则取消，未收藏则添加） */
export function toggle_2_2(options: toggle_2_2Options) {
  return apiRequest<ResultData<Schemas.community_ResultBoolean>>({
    url: "/api/community/favorite/toggle",
    method: "post",
    query: options.query,
  })
}

/** 新增专家（运营方） */
export function create_6(options: create_6Options) {
  return apiRequest<ResultData<Schemas.community_ResultLong>>({
    url: "/api/community/expert",
    method: "post",
    body: options.body,
  })
}

/** 提交预约咨询意向 */
export function submit_2(options: submit_2Options) {
  return apiRequest<ResultData<Schemas.community_ResultLong>>({
    url: "/api/community/expert-appointment",
    method: "post",
    body: options.body,
  })
}

/** 发表评论 */
export function create_1_3(options: create_1_3Options) {
  return apiRequest<ResultData<Schemas.community_ResultLong>>({
    url: "/api/community/comment",
    method: "post",
    query: options.query,
  })
}

/** 发布资讯 */
export function create_2_3(options: create_2_3Options) {
  return apiRequest<ResultData<Schemas.community_ResultLong>>({
    url: "/api/community/article",
    method: "post",
    body: options.body,
  })
}

/** 企业端咨询待回复计数（归属专家 = 本企业用户的未回答问题） */
export function enterpriseConsultationPending(options: enterpriseConsultationPendingOptions) {
  return apiRequest<ResultData<Schemas.community_ResultMapStringLong>>({
    url: "/api/community/stats/enterprise/{enterpriseId}/consultation-pending",
    method: "get",
    pathParams: options.path,
  })
}

/** 内容审核相关待办（文章/评论/未回答问题） */
export function adminPendingCounts_3(options: adminPendingCounts_3Options = {}) {
  return apiRequest<ResultData<Schemas.community_ResultMapStringLong>>({
    url: "/api/community/stats/admin/pending-counts",
    method: "get",
  })
}

/** 问题详情（公开） */
export function detail_9(options: detail_9Options) {
  return apiRequest<ResultData<Schemas.community_ResultQuestion>>({
    url: "/api/community/question/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 删除违规问答（运营方，软删） */
export function adminDelete(options: adminDeleteOptions) {
  return apiRequest<ResultData<Schemas.community_ResultVoid>>({
    url: "/api/community/question/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 获取问题的所有回答（公开） */
export function answers(options: answersOptions) {
  return apiRequest<ResultData<Schemas.community_ResultListAnswer>>({
    url: "/api/community/question/{id}/answers",
    method: "get",
    pathParams: options.path,
  })
}

/** 我的提问列表（需登录） */
export function myQuestions(options: myQuestionsOptions) {
  return apiRequest<ResultData<Schemas.community_ResultPageResultQuestion>>({
    url: "/api/community/question/my",
    method: "get",
    query: options.query,
  })
}

/** 分页查询问答（公开） */
export function list_9(options: list_9Options) {
  return apiRequest<ResultData<Schemas.community_ResultPageResultQuestion>>({
    url: "/api/community/question/list",
    method: "get",
    query: options.query,
  })
}

/** 查询是否已点赞 */
export function status_2(options: status_2Options) {
  return apiRequest<ResultData<Schemas.community_ResultBoolean>>({
    url: "/api/community/like/status",
    method: "get",
    query: options.query,
  })
}

/** 查询点赞数量（公开） */
export function count(options: countOptions) {
  return apiRequest<ResultData<Schemas.community_ResultLong>>({
    url: "/api/community/like/count",
    method: "get",
    query: options.query,
  })
}

/** 是否已关注问题 */
export function status_1(options: status_1Options) {
  return apiRequest<ResultData<Schemas.community_ResultBoolean>>({
    url: "/api/community/follow/question/status",
    method: "get",
    query: options.query,
  })
}

/** 我关注的问题ID列表 */
export function myFollows_2(options: myFollows_2Options = {}) {
  return apiRequest<ResultData<Schemas.community_ResultListQuestionFollow>>({
    url: "/api/community/follow/my",
    method: "get",
  })
}

/** 查询是否已收藏 */
export function status_2_2(options: status_2_2Options) {
  return apiRequest<ResultData<Schemas.community_ResultBoolean>>({
    url: "/api/community/favorite/status",
    method: "get",
    query: options.query,
  })
}

/** 我的收藏列表（分页） */
export function myFavorites(options: myFavoritesOptions) {
  return apiRequest<ResultData<Schemas.community_ResultPageResultUserFavorite>>({
    url: "/api/community/favorite/my",
    method: "get",
    query: options.query,
  })
}

/** 专家详情（公开） */
export function detail_1_3(options: detail_1_3Options) {
  return apiRequest<ResultData<Schemas.community_ResultExpert>>({
    url: "/api/community/expert/{id}",
    method: "get",
    pathParams: options.path,
  })
}

/** 分页查询专家（公开） */
export function list_1_3(options: list_1_3Options) {
  return apiRequest<ResultData<Schemas.community_ResultPageResultExpert>>({
    url: "/api/community/expert/list",
    method: "get",
    query: options.query,
  })
}

/** 我的预约列表 */
export function myList_3(options: myList_3Options = {}) {
  return apiRequest<ResultData<Schemas.community_ResultListExpertAppointment>>({
    url: "/api/community/expert-appointment/my",
    method: "get",
  })
}

/** 运营方：查看所有预约 */
export function adminList_3(options: adminList_3Options) {
  return apiRequest<ResultData<Schemas.community_ResultPageResultExpertAppointment>>({
    url: "/api/community/expert-appointment/admin/list",
    method: "get",
    query: options.query,
  })
}

/** 查看评论列表（公开） */
export function list_2_3(options: list_2_3Options) {
  return apiRequest<ResultData<Schemas.community_ResultListComment>>({
    url: "/api/community/comment/list",
    method: "get",
    query: options.query,
  })
}

/** 我发布的资讯（需登录） */
export function myArticles(options: myArticlesOptions) {
  return apiRequest<ResultData<Schemas.community_ResultPageResultArticle>>({
    url: "/api/community/article/my",
    method: "get",
    query: options.query,
  })
}

/** 分页查询资讯（公开） */
export function list_3_3(options: list_3_3Options) {
  return apiRequest<ResultData<Schemas.community_ResultPageResultArticle>>({
    url: "/api/community/article/list",
    method: "get",
    query: options.query,
  })
}

/** 查询标准解读文章（公开，按 standardId） */
export function interpretations(options: interpretationsOptions) {
  return apiRequest<ResultData<Schemas.community_ResultPageResultArticle>>({
    url: "/api/community/article/by-standard/{standardId}",
    method: "get",
    pathParams: options.path,
    query: options.query,
  })
}

/** 删除评论（本人或运营方） */
export function delete_api_4(options: delete_api_4Options) {
  return apiRequest<ResultData<Schemas.community_ResultVoid>>({
    url: "/api/community/comment/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

/** 删除违规评论（运营方） */
export function adminDelete_1(options: adminDelete_1Options) {
  return apiRequest<ResultData<Schemas.community_ResultVoid>>({
    url: "/api/community/comment/admin/{id}",
    method: "delete",
    pathParams: options.path,
  })
}

export interface updateStatusOptions {
  path: {
    userId: number;
  }
  query?: {
    status: number;
  }
}

export interface auditRealNameOptions {
  path: {
    userId: number;
  }
  query?: {
    passed: boolean;
    rejectReason?: string;
  }
}

export interface updateMemberLevelOptions {
  path: {
    userId: number;
  }
  query?: {
    memberLevel: number;
  }
  headers?: {
    "X-Internal-Secret"?: string;
  }
}

export interface updateNicknameOptions {
  query?: {
    nickname: string;
  }
}

export interface updateAvatarOptions {
  query?: {
    avatarUrl: string;
  }
}

export interface detailOptions {
  path: {
    id: number;
  }
}

export interface updateOptions {
  path: {
    id: number;
  }
  body: Schemas.user_ShippingAddressReqDTO
}

export interface delete_apiOptions {
  path: {
    id: number;
  }
}

export interface setDefaultOptions {
  path: {
    id: number;
  }
}

export interface update_1Options {
  path: {
    id: number;
  }
  body: Schemas.user_SysRole
}

export interface delete_1Options {
  path: {
    id: number;
  }
}

export interface getUserRolesOptions {
  path: {
    userId: number;
  }
}

export interface assignRolesOptions {
  path: {
    userId: number;
  }
  body: Array<string>
}

export interface detail_1Options {
  path: {
    id: number;
  }
}

export interface update_2Options {
  path: {
    id: number;
  }
  body: Schemas.user_InvoiceInfoReqDTO
}

export interface delete_2Options {
  path: {
    id: number;
  }
}

export interface setDefault_1Options {
  path: {
    id: number;
  }
}

export interface getEnterpriseByIdOptions {
  path: {
    enterpriseId: number;
  }
}

export interface updateEnterpriseOptions {
  path: {
    enterpriseId: number;
  }
  body: Schemas.user_EnterpriseRegisterReqDTO
}

export interface upgradeToProviderOptions {
  path: {
    enterpriseId: number;
  }
  query?: {
    certFileUrl: string;
    certNo: string;
    certExpiry: string;
    certScope?: string;
  }
}

export interface enableEnterpriseOptions {
  path: {
    enterpriseId: number;
  }
}

export interface disableEnterpriseOptions {
  path: {
    enterpriseId: number;
  }
}

export interface auditEnterpriseOptions {
  path: {
    enterpriseId: number;
  }
  query?: {
    passed: boolean;
    rejectReason?: string;
  }
}

export interface setUsernameOptions {
  query?: {
    username: string;
  }
}

export interface updateProfileOptions {
  body: Schemas.user_UpdateProfileReqDTO
}

export interface changePhoneOptions {
  body: Schemas.user_ChangePhoneReqDTO
}

export interface changePasswordOptions {
  body: Schemas.user_ChangePasswordReqDTO
}

export interface changeEmailOptions {
  body: Schemas.user_ChangeEmailReqDTO
}

export interface myAddressesOptions {
}

export interface createOptions {
  body: Schemas.user_ShippingAddressReqDTO
}

export interface create_1Options {
  body: Schemas.user_SysRole
}

export interface addRoleOptions {
  path: {
    userId: number;
  }
  query?: {
    roleCode: string;
  }
}

export interface adminAdjustOptions {
  query?: {
    userId: number;
    points: number;
    ruleCode?: string;
    remark?: string;
  }
}

export interface myInvoicesOptions {
}

export interface create_2Options {
  body: Schemas.user_InvoiceInfoReqDTO
}

export interface uploadOptions {
  query?: {
    dir?: string;
  }
  body: {
  file: Blob | File;
}
}

export interface uploadWxAvatarOptions {
  body: {
  file: Blob | File;
}
}

export interface uploadLicenseOptions {
  body: {
  file: Blob | File;
}
}

export interface uploadIdCardOptions {
  body: {
  file: Blob | File;
}
}

export interface uploadCertOptions {
  body: {
  file: Blob | File;
}
}

export interface listCertsOptions {
  path: {
    enterpriseId: number;
  }
}

export interface addCertOptions {
  path: {
    enterpriseId: number;
  }
  body: Schemas.user_EnterpriseCertReqDTO
}

export interface registerEnterpriseOptions {
  body: Schemas.user_EnterpriseRegisterReqDTO
}

export interface ocrBusinessLicenseOptions {
  body: {
  file: Blob | File;
}
}

export interface wechatQrLoginOptions {
  body: Schemas.user_WechatQrLoginReqDTO
}

export interface wechatMiniLoginOptions {
  body: Schemas.user_WechatLoginReqDTO
}

export interface wechatBindPhoneOptions {
  body: Schemas.user_WechatPhoneBindReqDTO
}

export interface bindWechatOptions {
  body: Schemas.user_WechatLoginReqDTO
}

export interface sendSmsCodeOptions {
  body: Schemas.user_SmsCodeReqDTO
}

export interface resetPasswordOptions {
  body: Schemas.user_ResetPasswordReqDTO
}

export interface registerOptions {
  body: Schemas.user_RegisterReqDTO
}

export interface refreshOptions {
  query?: {
    refreshToken: string;
  }
}

export interface logoutOptions {
}

export interface loginOptions {
  body: Schemas.user_LoginReqDTO
}

export interface passwordLoginOptions {
  body: Schemas.user_PasswordLoginReqDTO
}

export interface getRealNameStatusOptions {
}

export interface submitRealNameOptions {
  body: Schemas.user_RealNameAuthReqDTO
}

export interface getUserByIdOptions {
  path: {
    userId: number;
  }
  headers?: {
    "X-Internal-Secret"?: string;
  }
}

export interface pendingRealNameOptions {
  query?: {
    page?: number;
    size?: number;
  }
}

export interface listUsersOptions {
  query?: {
    status?: number;
    keyword?: string;
    page?: number;
    size?: number;
  }
}

export interface getCurrentUserOptions {
}

export interface getCurrentUser_1Options {
}

export interface enterpriseCustomerTrendOptions {
  path: {
    enterpriseId: number;
  }
  query?: {
    days?: number;
  }
}

export interface adminSummaryOptions {
}

export interface adminPendingCountsOptions {
}

export interface adminOnlineOptions {
}

export interface myDefaultOptions {
}

export interface listOptions {
}

export interface userPointsOptions {
  path: {
    userId: number;
  }
}

export interface rulesOptions {
}

export interface myPointsOptions {
}

export interface myHistoryOptions {
  query?: {
    page?: number;
    size?: number;
  }
}

export interface myDefault_1Options {
}

export interface getInstitutionUserIdOptions {
  path: {
    enterpriseId: number;
  }
}

export interface todoOptions {
}

export interface summaryOptions {
}

export interface serviceOverviewOptions {
}

export interface serviceDistributionOptions {
}

export interface orderTrendOptions {
  query?: {
    days?: number;
  }
}

export interface incomeStructureOptions {
}

export interface deliveryTrendOptions {
  query?: {
    days?: number;
  }
}

export interface customerTrendOptions {
  query?: {
    days?: number;
  }
}

export interface pendingListOptions {
  query?: {
    page?: number;
    size?: number;
  }
}

export interface getMyEnterpriseOptions {
}

export interface pageInstitutionsOptions {
  query?: {
    enterpriseType?: number;
    region?: string;
    page?: number;
    size?: number;
  }
}

export interface allListOptions {
  query?: {
    certStatus?: number;
    keyword?: string;
    page?: number;
    size?: number;
  }
}

export interface removeRoleOptions {
  path: {
    userId: number;
  }
  query?: {
    roleCode: string;
  }
}

export interface deleteCertOptions {
  path: {
    enterpriseId: number;
    certId: number;
  }
}

export interface update_3Options {
  path: {
    id: number;
  }
  body: Schemas.admin_Dict
}

export interface delete_api_2Options {
  path: {
    id: number;
  }
}

export interface toggleStatusOptions {
  path: {
    id: number;
  }
  query?: {
    status: number;
  }
}

export interface enableOptions {
  path: {
    userId: number;
  }
}

export interface disableOptions {
  path: {
    userId: number;
  }
}

export interface invalidateOptions {
  path: {
    reportId: number;
  }
}

export interface forceCloseOptions {
  path: {
    orderId: number;
  }
  query?: {
    reason?: string;
  }
}

export interface enable_1Options {
  path: {
    enterpriseId: number;
  }
}

export interface disable_1Options {
  path: {
    enterpriseId: number;
  }
}

export interface auditOptions {
  path: {
    enterpriseId: number;
  }
  query?: {
    passed: boolean;
    rejectReason?: string;
  }
}

export interface updateArticleStatusOptions {
  path: {
    id: number;
  }
  query?: {
    status: number;
  }
}

export interface create_3Options {
  body: Schemas.admin_Dict
}

export interface allTypesOptions {
}

export interface listByTypeOptions {
  path: {
    dictType: string;
  }
}

export interface getUserOptions {
  path: {
    userId: number;
  }
}

export interface listUsers_2Options {
  query?: {
    status?: number;
    keyword?: string;
    page?: number;
    size?: number;
  }
}

export interface auditLogOptions {
  query?: {
    module?: string;
    operatorId?: number;
    page?: number;
    size?: number;
  }
}

export interface getReportOptions {
  path: {
    reportId: number;
  }
}

export interface listReportsOptions {
  query?: {
    status?: number;
    page?: number;
    size?: number;
  }
}

export interface getOrderOptions {
  path: {
    orderId: number;
  }
}

export interface listOrdersOptions {
  query?: {
    status?: number;
    page?: number;
    size?: number;
  }
}

export interface listDemandsOptions {
  query?: {
    page?: number;
    size?: number;
  }
}

export interface getDemandOptions {
  path: {
    demandId: number;
  }
}

export interface deleteDemandOptions {
  path: {
    demandId: number;
  }
}

export interface getByOrderOptions {
  path: {
    orderId: number;
  }
}

export interface list_2Options {
  query?: {
    page?: number;
    size?: number;
  }
}

export interface detail_2Options {
  path: {
    enterpriseId: number;
  }
}

export interface pendingList_2Options {
  query?: {
    page?: number;
    size?: number;
  }
}

export interface allList_2Options {
  query?: {
    certStatus?: number;
    keyword?: string;
    page?: number;
    size?: number;
  }
}

export interface tradeTrendOptions {
  query?: {
    days?: number;
  }
}

export interface workbenchSummaryOptions {
}

export interface serviceDistribution_2Options {
}

export interface workbenchPendingAuditsOptions {
}

export interface onlineStatsOptions {
}

export interface categoryCloudOptions {
  query?: {
    days?: number;
    limit?: number;
  }
}

export interface businessTrendOptions {
  query?: {
    days?: number;
  }
}

export interface overviewOptions {
}

export interface listQuestionsOptions {
  query?: {
    page?: number;
    size?: number;
  }
}

export interface getQuestionOptions {
  path: {
    id: number;
  }
}

export interface deleteQuestionOptions {
  path: {
    id: number;
  }
}

export interface listArticlesOptions {
  query?: {
    page?: number;
    size?: number;
    status?: number;
  }
}

export interface getArticleOptions {
  path: {
    id: number;
  }
}

export interface deleteArticleOptions {
  path: {
    id: number;
  }
}

export interface delete_1_2Options {
  path: {
    evaluationId: number;
  }
}

export interface deleteCommentOptions {
  path: {
    id: number;
  }
}

export interface cancelEnrollmentOptions {
  path: {
    id: number;
  }
}

export interface courseDetailOptions {
  path: {
    id: number;
  }
}

export interface updateCourseOptions {
  path: {
    id: number;
  }
  body: Schemas.base_TrainingCourse
}

export interface deleteCourseOptions {
  path: {
    id: number;
  }
}

export interface detail_3Options {
  path: {
    id: number;
  }
}

export interface update_4Options {
  path: {
    id: number;
  }
  body: Schemas.base_Standard
}

export interface delete_api_3Options {
  path: {
    id: number;
  }
}

export interface detail_1_2Options {
  path: {
    id: number;
  }
}

export interface update_1_2Options {
  path: {
    id: number;
  }
  body: Schemas.base_Policy
}

export interface delete_1_3Options {
  path: {
    id: number;
  }
}

export interface detail_3_2Options {
  path: {
    id: number;
  }
}

export interface update_2_2Options {
  path: {
    id: number;
  }
  body: Schemas.base_MeasurementInstrument
}

export interface delete_2_2Options {
  path: {
    id: number;
  }
}

export interface detail_4Options {
  path: {
    id: number;
  }
}

export interface update_3_2Options {
  path: {
    id: number;
  }
  body: Schemas.base_Knowledge
}

export interface delete_3Options {
  path: {
    id: number;
  }
}

export interface updateServiceOptions {
  path: {
    id: number;
  }
  query?: {
    serviceRange?: string;
    introduction?: string;
    contactPhone?: string;
  }
}

export interface adminUpdateOptions {
  path: {
    id: number;
  }
  query?: {
    serviceRange?: string;
    introduction?: string;
    contactPhone?: string;
    status?: number;
  }
}

export interface detail_6Options {
  path: {
    id: number;
  }
}

export interface update_4_2Options {
  path: {
    id: number;
  }
  body: Schemas.base_InspectionItem
}

export interface delete_4Options {
  path: {
    id: number;
  }
}

export interface audit_2Options {
  path: {
    id: number;
  }
  query?: {
    passed: boolean;
    auditRemark?: string;
  }
}

export interface detail_7Options {
  path: {
    id: number;
  }
}

export interface update_5Options {
  path: {
    id: number;
  }
  body: Schemas.base_DiagnosisQuestionnaire
}

export interface toggleStatus_2Options {
  path: {
    id: number;
  }
  query?: {
    status: number;
  }
}

export interface updateQuestionOptions {
  path: {
    questionId: number;
  }
  body: Schemas.base_DiagnosisQuestion
}

export interface deleteQuestion_2Options {
  path: {
    questionId: number;
  }
}

export interface caseDetailOptions {
  path: {
    id: number;
  }
}

export interface updateCaseOptions {
  path: {
    id: number;
  }
  body: Schemas.base_DiagnosisCase
}

export interface deleteCaseOptions {
  path: {
    id: number;
  }
}

export interface agencyDetailOptions {
  path: {
    id: number;
  }
}

export interface updateAgencyOptions {
  path: {
    id: number;
  }
  body: Schemas.base_DiagnosisAgency
}

export interface deleteAgencyOptions {
  path: {
    id: number;
  }
}

export interface replyOptions {
  path: {
    id: number;
  }
  query?: {
    replyContent: string;
  }
}

export interface closeOptions {
  path: {
    id: number;
  }
}

export interface guideDetailOptions {
  path: {
    id: number;
  }
}

export interface updateGuideOptions {
  path: {
    id: number;
  }
  body: Schemas.base_CertGuide
}

export interface deleteGuideOptions {
  path: {
    id: number;
  }
}

export interface agencyDetail_1Options {
  path: {
    id: number;
  }
}

export interface updateAgency_1Options {
  path: {
    id: number;
  }
  body: Schemas.base_CertificationAgency
}

export interface deleteAgency_1Options {
  path: {
    id: number;
  }
}

export interface createCourseOptions {
  body: Schemas.base_TrainingCourse
}

export interface enrollOptions {
  path: {
    courseId: number;
  }
  body: Schemas.base_TrainingEnrollment
}

export interface create_4Options {
  body: Schemas.base_Standard
}

export interface toggleOptions {
  path: {
    standardId: number;
  }
}

export interface create_1_2Options {
  body: Schemas.base_Policy
}

export interface create_2_2Options {
  body: Schemas.base_MeasurementInstrument
}

export interface create_3_2Options {
  body: Schemas.base_Knowledge
}

export interface create_4_2Options {
  body: Schemas.base_InspectionItem
}

export interface applyOptions {
  body: Schemas.base_InspectionItemApply
}

export interface create_5Options {
  body: Schemas.base_DiagnosisQuestionnaire
}

export interface addQuestionOptions {
  path: {
    questionnaireId: number;
  }
  body: Schemas.base_DiagnosisQuestion
}

export interface submitOptions {
  path: {
    id: number;
  }
  body: Array<{
  [key: string]: Record<string, unknown>;
}>
}

export interface createCaseOptions {
  body: Schemas.base_DiagnosisCase
}

export interface createAgencyOptions {
  body: Schemas.base_DiagnosisAgency
}

export interface submit_1Options {
  body: Schemas.base_ServiceConsultation
}

export interface createGuideOptions {
  body: Schemas.base_CertGuide
}

export interface createAgency_1Options {
  body: Schemas.base_CertificationAgency
}

export interface myEnrollmentsOptions {
}

export interface courseEnrollmentsOptions {
  path: {
    courseId: number;
  }
}

export interface courseListOptions {
  query?: {
    category?: string;
    status?: number;
    page?: number;
    size?: number;
  }
}

export interface list_3Options {
  query?: {
    standardType?: string;
    category?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }
}

export interface statusOptions {
  path: {
    standardId: number;
  }
}

export interface myFollowsOptions {
  query?: {
    page?: number;
    size?: number;
  }
}

export interface list_1Options {
  query?: {
    category?: string;
    region?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }
}

export interface detail_2_2Options {
  path: {
    id: number;
  }
}

export interface list_2_2Options {
  query?: {
    region?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }
}

export interface list_3_2Options {
  query?: {
    category?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }
}

export interface list_4Options {
  query?: {
    category?: string;
    keyword?: string;
    contentType?: number;
    page?: number;
    size?: number;
  }
}

export interface detail_5Options {
  path: {
    id: number;
  }
}

export interface searchOptions {
  query?: {
    keyword?: string;
    type?: number;
    region?: string;
    page?: number;
    size?: number;
  }
}

export interface list_5Options {
  query?: {
    type?: number;
    region?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }
}

export interface list_6Options {
  query?: {
    category?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }
}

export interface byCategoryOptions {
  query?: {
    category?: string;
  }
}

export interface myAppliesOptions {
  query?: {
    status?: number;
    page?: number;
    size?: number;
  }
}

export interface adminListOptions {
  query?: {
    status?: number;
    page?: number;
    size?: number;
  }
}

export interface list_7Options {
  query?: {
    industry?: string;
    page?: number;
    size?: number;
  }
}

export interface caseListOptions {
  query?: {
    industry?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }
}

export interface agencyListOptions {
  query?: {
    region?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }
}

export interface detail_8Options {
  path: {
    id: number;
  }
}

export interface myListOptions {
}

export interface adminList_1Options {
  query?: {
    reqType?: string;
    status?: number;
    page?: number;
    size?: number;
  }
}

export interface guideListOptions {
  query?: {
    certType?: string;
  }
}

export interface agencyList_1Options {
  query?: {
    region?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }
}

export interface invalidate_2Options {
  path: {
    reportId: number;
  }
}

export interface institutionConfirmOptions {
  path: {
    id: number;
  }
  query?: {
    refundVoucherUrl?: string;
  }
}

export interface audit_3Options {
  path: {
    id: number;
  }
  query?: {
    passed: boolean;
    remark?: string;
  }
}

export interface releaseEscrowOptions {
  path: {
    orderId: number;
  }
}

export interface payCallbackOptions {
  path: {
    orderId: number;
  }
  query?: {
    payChannel?: string;
    outTradeNo?: string;
  }
}

export interface uploadOfflinePaymentOptions {
  path: {
    orderId: number;
  }
  query?: {
    voucherUrl: string;
  }
}

export interface confirmReportOptions {
  path: {
    orderId: number;
  }
}

export interface confirmOfflinePaymentOptions {
  path: {
    orderId: number;
  }
}

export interface cancelOrderOptions {
  path: {
    orderId: number;
  }
  query?: {
    reason?: string;
  }
}

export interface amendEntrustOptions {
  path: {
    orderId: number;
  }
  query?: {
    testProject?: string;
    testStandard?: string;
    remark?: string;
  }
}

export interface handleOptions {
  path: {
    applyId: number;
  }
  query?: {
    status: number;
    remark?: string;
  }
}

export interface publishDraftOptions {
  path: {
    demandId: number;
  }
}

export interface updateDraftOptions {
  path: {
    demandId: number;
  }
  body: Schemas.trade_DemandPublishReqDTO
}

export interface closeDemandOptions {
  path: {
    demandId: number;
  }
}

export interface generateOptions {
  path: {
    reportId: number;
  }
}

export interface upload_2Options {
  body: Schemas.trade_Report
}

export interface apply_2Options {
  body: Schemas.trade_RefundApplyReqDTO
}

export interface sampleSupplementOptions {
  path: {
    orderId: number;
  }
  query?: {
    expressNo: string;
    expressCompany?: string;
  }
}

export interface sampleReturnOptions {
  path: {
    orderId: number;
  }
  query?: {
    reason?: string;
  }
}

export interface submitShippingOptions {
  body: Schemas.trade_ShippingReqDTO
}

export interface receiveConfirmOptions {
  body: Schemas.trade_ReceiveReqDTO
}

export interface evaluateOptions {
  body: Schemas.trade_EvaluationReqDTO
}

export interface placeDirectOrderOptions {
  body: Schemas.trade_DirectOrderReqDTO
}

export interface confirmOrderOptions {
  body: Schemas.trade_OrderConfirmReqDTO
}

export interface confirmBidOptions {
  path: {
    bidId: number;
  }
}

export interface addOptions {
  path: {
    orderId: number;
  }
  query?: {
    node: string;
    remark?: string;
    photos?: string;
  }
}

export interface apply_1Options {
  body: Schemas.trade_InvoiceApply
}

export interface publishDemandOptions {
  body: Schemas.trade_DemandPublishReqDTO
}

export interface saveDraftOptions {
  body: Schemas.trade_DemandPublishReqDTO
}

export interface submitBidOptions {
  body: Schemas.trade_BidReqDTO
}

export interface calculateOptions {
  body: Array<Schemas.trade_QuoteItem>
}

export interface list_1_2Options {
  path: {
    bidId: number;
  }
}

export interface saveOptions {
  path: {
    bidId: number;
  }
  body: Array<Schemas.trade_BidFeeItem>
}

export interface enterpriseTodoOptions {
  path: {
    enterpriseId: number;
  }
}

export interface enterpriseSummaryOptions {
  path: {
    enterpriseId: number;
  }
}

export interface enterpriseServiceDistributionOptions {
  path: {
    enterpriseId: number;
  }
}

export interface enterpriseOrderTrendOptions {
  path: {
    enterpriseId: number;
  }
  query?: {
    days?: number;
  }
}

export interface enterpriseIncomeOptions {
  path: {
    enterpriseId: number;
  }
}

export interface enterpriseDeliveryTrendOptions {
  path: {
    enterpriseId: number;
  }
  query?: {
    days?: number;
  }
}

export interface enterpriseBusinessOverviewOptions {
  path: {
    enterpriseId: number;
  }
}

export interface adminTradeTrendOptions {
  query?: {
    days?: number;
  }
}

export interface adminSummary_2Options {
}

export interface adminServiceDistributionOptions {
}

export interface adminPendingCounts_2Options {
}

export interface adminCategoryCloudOptions {
  query?: {
    days?: number;
    limit?: number;
  }
}

export interface adminBusinessTrendOptions {
  query?: {
    days?: number;
  }
}

export interface getByIdOptions {
  path: {
    reportId: number;
  }
}

export interface downloadOptions {
  path: {
    reportId: number;
  }
}

export interface verifyOptions {
  path: {
    reportNo: string;
  }
}

export interface getByOrder_2Options {
  path: {
    orderId: number;
  }
}

export interface adminList_2Options {
  query?: {
    status?: number;
    page?: number;
    size?: number;
  }
}

export interface myList_2Options {
}

export interface adminList_1_2Options {
  query?: {
    status?: number;
    page?: number;
    size?: number;
  }
}

export interface getOrder_2Options {
  path: {
    orderId: number;
  }
}

export interface myOrdersOptions {
  query?: {
    status?: number;
    page?: number;
    size?: number;
  }
}

export interface getEvaluationOptions {
  path: {
    orderId: number;
  }
}

export interface adminListEvaluationsOptions {
  query?: {
    page?: number;
    size?: number;
  }
}

export interface adminListOrdersOptions {
  query?: {
    status?: number;
    page?: number;
    size?: number;
  }
}

export interface list_8Options {
  path: {
    orderId: number;
  }
}

export interface myApplies_2Options {
}

export interface getDemand_2Options {
  path: {
    demandId: number;
  }
}

export interface deleteDemand_2Options {
  path: {
    demandId: number;
  }
}

export interface getBidsOptions {
  path: {
    demandId: number;
  }
}

export interface myDemandsOptions {
  query?: {
    status?: number;
    page?: number;
    size?: number;
  }
}

export interface hallOptions {
  query?: {
    category?: string;
    region?: string;
    page?: number;
    size?: number;
  }
}

export interface deleteEvaluationOptions {
  path: {
    evaluationId: number;
  }
}

export interface acceptOptions {
  path: {
    questionId: number;
    answerId: number;
  }
}

export interface confirmOptions {
  path: {
    id: number;
  }
}

export interface cancelOptions {
  path: {
    id: number;
  }
}

export interface detail_2_3Options {
  path: {
    id: number;
  }
}

export interface update_6Options {
  path: {
    id: number;
  }
  body: Schemas.community_Article
}

export interface delete_1_4Options {
  path: {
    id: number;
  }
}

export interface updateStatus_2Options {
  path: {
    id: number;
  }
  query?: {
    status: number;
  }
}

export interface postOptions {
  body: Schemas.community_Question
}

export interface answerOptions {
  path: {
    id: number;
  }
  body: Schemas.community_Answer
}

export interface toggle_2Options {
  query?: {
    targetType: string;
    targetId: number;
  }
}

export interface toggle_1Options {
  query?: {
    questionId: number;
  }
}

export interface toggle_2_2Options {
  query?: {
    targetType: string;
    targetId: number;
  }
}

export interface create_6Options {
  body: Schemas.community_Expert
}

export interface submit_2Options {
  body: Schemas.community_ExpertAppointment
}

export interface create_1_3Options {
  query?: {
    targetType: string;
    targetId: number;
    content: string;
    parentId?: number;
  }
}

export interface create_2_3Options {
  body: Schemas.community_Article
}

export interface enterpriseConsultationPendingOptions {
  path: {
    enterpriseId: number;
  }
}

export interface adminPendingCounts_3Options {
}

export interface detail_9Options {
  path: {
    id: number;
  }
}

export interface adminDeleteOptions {
  path: {
    id: number;
  }
}

export interface answersOptions {
  path: {
    id: number;
  }
}

export interface myQuestionsOptions {
  query?: {
    page?: number;
    size?: number;
  }
}

export interface list_9Options {
  query?: {
    category?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }
}

export interface status_2Options {
  query?: {
    targetType: string;
    targetId: number;
  }
}

export interface countOptions {
  query?: {
    targetType: string;
    targetId: number;
  }
}

export interface status_1Options {
  query?: {
    questionId: number;
  }
}

export interface myFollows_2Options {
}

export interface status_2_2Options {
  query?: {
    targetType: string;
    targetId: number;
  }
}

export interface myFavoritesOptions {
  query?: {
    targetType?: string;
    page?: number;
    size?: number;
  }
}

export interface detail_1_3Options {
  path: {
    id: number;
  }
}

export interface list_1_3Options {
  query?: {
    expertise?: string;
    page?: number;
    size?: number;
  }
}

export interface myList_3Options {
}

export interface adminList_3Options {
  query?: {
    status?: number;
    page?: number;
    size?: number;
  }
}

export interface list_2_3Options {
  query?: {
    targetType: string;
    targetId: number;
  }
}

export interface myArticlesOptions {
  query?: {
    page?: number;
    size?: number;
  }
}

export interface list_3_3Options {
  query?: {
    category?: string;
    keyword?: string;
    page?: number;
    size?: number;
  }
}

export interface interpretationsOptions {
  path: {
    standardId: number;
  }
  query?: {
    page?: number;
    size?: number;
  }
}

export interface delete_api_4Options {
  path: {
    id: number;
  }
}

export interface adminDelete_1Options {
  path: {
    id: number;
  }
}
