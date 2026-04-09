import { AUTH_RESULT_MAP, AUTH_STATUS_ENUM, MOBILE_PATTERN } from '@/enum/auth'
import { PERMISSION_CODE, ROOT_PERMISSION } from '@/enum/permission'
import { ACCOUNT_TYPE, ENTERPRISE_CAPABILITY, PLATFORM_ROLE } from '@/enum/role'
import type {
  AuthLoginResponse,
  AuthResultInfo,
  AuthSubmitResponse,
  CurrentUser,
  EnterpriseCapability,
  EnterpriseRegisterForm,
  FirstLoginResetPasswordForm,
  ForgotPasswordForm,
  InstitutionApplyForm,
  LoginResponse,
  PasswordLoginForm,
  PersonalRegisterForm,
  PlatformRole,
  RegisterCommand,
  SendAuthCodeCommand,
  SmsCodeParams,
  SmsCodeResponse,
  SmsLoginForm,
} from '@/types/auth'
import { getAccessToken } from '@/utils/auth'

import { mockPromise } from '../helper'

const DATA_SCOPE_NOTE = '真实环境由后端返回最终 permissionCodes 和 dataScope，前端只负责显示与交互控制。'

const platformRolePermissions: Record<PlatformRole, string[]> = {
  [PLATFORM_ROLE.superAdmin]: [
    ROOT_PERMISSION,
    PERMISSION_CODE.platformDashboardView,
    PERMISSION_CODE.userManageView,
    PERMISSION_CODE.auditEnterpriseQuery,
    PERMISSION_CODE.auditEnterpriseApprove,
    PERMISSION_CODE.demandManageView,
    PERMISSION_CODE.consultManageView,
    PERMISSION_CODE.orderManageView,
    PERMISSION_CODE.reportManageView,
    PERMISSION_CODE.commentManageView,
    PERMISSION_CODE.messageManageView,
    PERMISSION_CODE.contentManageView,
    PERMISSION_CODE.dictionaryManageView,
    PERMISSION_CODE.roleManageView,
    PERMISSION_CODE.workflowManageView,
    PERMISSION_CODE.operationLogView,
    PERMISSION_CODE.dangerousAction,
  ],
  [PLATFORM_ROLE.platformAdmin]: [
    PERMISSION_CODE.platformDashboardView,
    PERMISSION_CODE.userManageView,
    PERMISSION_CODE.auditEnterpriseQuery,
    PERMISSION_CODE.auditEnterpriseApprove,
    PERMISSION_CODE.demandManageView,
    PERMISSION_CODE.consultManageView,
    PERMISSION_CODE.orderManageView,
    PERMISSION_CODE.reportManageView,
    PERMISSION_CODE.commentManageView,
    PERMISSION_CODE.messageManageView,
    PERMISSION_CODE.contentManageView,
    PERMISSION_CODE.operationLogView,
  ],
  [PLATFORM_ROLE.auditor]: [
    PERMISSION_CODE.platformDashboardView,
    PERMISSION_CODE.auditEnterpriseQuery,
    PERMISSION_CODE.auditEnterpriseApprove,
    PERMISSION_CODE.orderManageView,
    PERMISSION_CODE.reportManageView,
    PERMISSION_CODE.messageManageView,
  ],
}

const enterpriseCommonPermissions = [
  PERMISSION_CODE.enterpriseDashboardView,
  PERMISSION_CODE.enterpriseProfileEdit,
  PERMISSION_CODE.enterpriseDemandView,
  PERMISSION_CODE.enterpriseOrderView,
  PERMISSION_CODE.enterpriseReportView,
  PERMISSION_CODE.enterpriseMessageView,
]

const capabilityPermissions: Record<EnterpriseCapability, string[]> = {
  [ENTERPRISE_CAPABILITY.demander]: [
    PERMISSION_CODE.enterpriseDemandPublish,
    PERMISSION_CODE.enterpriseCommentView,
  ],
  [ENTERPRISE_CAPABILITY.serviceProvider]: [
    PERMISSION_CODE.enterpriseDemandHallView,
    PERMISSION_CODE.enterpriseDemandHandle,
    PERMISSION_CODE.enterpriseConsultView,
    PERMISSION_CODE.enterpriseConsultHandle,
    PERMISSION_CODE.enterpriseServiceView,
    PERMISSION_CODE.enterpriseServiceManage,
    PERMISSION_CODE.enterpriseCommentManage,
  ],
  [ENTERPRISE_CAPABILITY.labProvider]: [
    PERMISSION_CODE.enterpriseOrderReceive,
    PERMISSION_CODE.enterpriseOrderHandle,
    PERMISSION_CODE.enterpriseReportHandle,
    PERMISSION_CODE.enterpriseTestingProgressView,
    PERMISSION_CODE.enterpriseDataReportView,
  ],
}

function buildEnterprisePermissions(capabilities: EnterpriseCapability[]) {
  return Array.from(
    new Set([
      ...enterpriseCommonPermissions,
      ...capabilities.flatMap((item) => capabilityPermissions[item] || []),
    ]),
  )
}

function buildPlatformUser(
  key: string,
  name: string,
  platformRole: PlatformRole,
  mobile: string,
  email: string,
): CurrentUser {
  const permissions = platformRolePermissions[platformRole]
  return {
    id: `u-${key}`,
    name,
    mobile,
    email,
    accountType: ACCOUNT_TYPE.platformAdmin,
    platformRole,
    roles: [platformRole],
    permissionCodes: permissions,
    permissions,
    dataScopes: [{ type: 'all', note: DATA_SCOPE_NOTE }],
    deptName: '平台运营中心',
    lastLoginTime: '2026-04-09 09:20:00',
  }
}

function buildPersonalUser(params: {
  key: string
  name: string
  mobile: string
  email: string
}): CurrentUser {
  return {
    id: `u-${params.key}`,
    name: params.name,
    mobile: params.mobile,
    email: params.email,
    accountType: ACCOUNT_TYPE.personal,
    permissionCodes: [],
    permissions: [],
    dataScopes: [{ type: 'self', note: DATA_SCOPE_NOTE }],
    lastLoginTime: '2026-04-09 08:30:00',
  }
}

function buildBusinessUser(params: {
  key: string
  name: string
  mobile: string
  email: string
  accountType: 'enterprise' | 'institution'
  enterpriseId: string
  enterpriseName: string
  capabilities: EnterpriseCapability[]
  deptName?: string
}): CurrentUser {
  const permissions = buildEnterprisePermissions(params.capabilities)
  return {
    id: `u-${params.key}`,
    name: params.name,
    mobile: params.mobile,
    email: params.email,
    accountType: params.accountType,
    enterpriseId: params.enterpriseId,
    enterpriseName: params.enterpriseName,
    enterpriseCapabilities: params.capabilities,
    roles: [...params.capabilities],
    permissionCodes: permissions,
    permissions,
    dataScopes: [
      {
        type: 'enterprise_self',
        enterpriseIds: [params.enterpriseId],
        note: DATA_SCOPE_NOTE,
      },
    ],
    deptName: params.deptName,
    lastLoginTime: '2026-04-09 08:45:00',
  }
}

export const mockUsersByToken: Record<string, CurrentUser> = {
  admin: buildPlatformUser('admin', '平台超级管理员', PLATFORM_ROLE.superAdmin, '13800000001', 'admin@dajing.cn'),
  auditor: buildPlatformUser('auditor', '平台审核员', PLATFORM_ROLE.auditor, '13800000002', 'auditor@dajing.cn'),
  personal: buildPersonalUser({
    key: 'personal',
    name: '个人用户演示账号',
    mobile: '13800000021',
    email: 'personal@dajing.cn',
  }),
  enterprise: buildBusinessUser({
    key: 'enterprise',
    name: '企业管理员',
    mobile: '13800000011',
    email: 'owner@qihang.cn',
    accountType: ACCOUNT_TYPE.enterprise,
    enterpriseId: 'ent-100',
    enterpriseName: '苏州启航电子股份有限公司',
    capabilities: [ENTERPRISE_CAPABILITY.demander],
    deptName: '质量管理部',
  }),
  service: buildBusinessUser({
    key: 'service',
    name: '服务机构管理员',
    mobile: '13800000012',
    email: 'service@hangquality.cn',
    accountType: ACCOUNT_TYPE.enterprise,
    enterpriseId: 'ent-200',
    enterpriseName: '杭州工研质量技术服务有限公司',
    capabilities: [ENTERPRISE_CAPABILITY.serviceProvider],
    deptName: '运营服务部',
  }),
  institution: buildBusinessUser({
    key: 'institution',
    name: '检测机构管理员',
    mobile: '13800000013',
    email: 'lab@smartlab.cn',
    accountType: ACCOUNT_TYPE.institution,
    enterpriseId: 'ent-001',
    enterpriseName: '苏州智造检测有限公司',
    capabilities: [ENTERPRISE_CAPABILITY.labProvider],
    deptName: '检测中心',
  }),
  'mix-service': buildBusinessUser({
    key: 'mix-service',
    name: '复合身份企业管理员',
    mobile: '13800000014',
    email: 'mix@duoquality.cn',
    accountType: ACCOUNT_TYPE.enterprise,
    enterpriseId: 'ent-400',
    enterpriseName: '宁波协同质量科技有限公司',
    capabilities: [ENTERPRISE_CAPABILITY.demander, ENTERPRISE_CAPABILITY.serviceProvider],
    deptName: '综合业务部',
  }),
  'mix-lab': buildBusinessUser({
    key: 'mix-lab',
    name: '复合检测企业管理员',
    mobile: '13800000015',
    email: 'labmix@duolab.cn',
    accountType: ACCOUNT_TYPE.enterprise,
    enterpriseId: 'ent-500',
    enterpriseName: '上海联测质量科技有限公司',
    capabilities: [ENTERPRISE_CAPABILITY.demander, ENTERPRISE_CAPABILITY.labProvider],
    deptName: '检测运营部',
  }),
}

type AuthRecord = {
  tokenKey: string
  username?: string
  mobile?: string
  unifiedSocialCode?: string
  password: string
  needResetPassword?: boolean
}

const authAccounts: AuthRecord[] = [
  {
    tokenKey: 'admin',
    username: 'admin',
    mobile: '13800000001',
    password: '123456',
  },
  {
    tokenKey: 'auditor',
    username: 'auditor',
    mobile: '13800000002',
    password: '123456',
  },
  {
    tokenKey: 'personal',
    username: 'person_demo',
    mobile: '13800000021',
    password: 'Abc12345',
  },
  {
    tokenKey: 'enterprise',
    username: 'qihang_admin',
    mobile: '13800000011',
    unifiedSocialCode: '91320508MA2Q0K7M2C',
    password: 'Init1234',
    needResetPassword: true,
  },
  {
    tokenKey: 'service',
    username: 'service_admin',
    mobile: '13800000012',
    unifiedSocialCode: '91330102MA27T6M993',
    password: 'Init1234',
    needResetPassword: true,
  },
  {
    tokenKey: 'institution',
    username: 'smartlab_admin',
    mobile: '13800000013',
    unifiedSocialCode: '91320594MA1Q2A0X1Y',
    password: 'Init1234',
    needResetPassword: true,
  },
  {
    tokenKey: 'mix-service',
    username: 'mix_service_admin',
    mobile: '13800000014',
    unifiedSocialCode: '91330200MA2MIX4001',
    password: 'Abc12345',
  },
  {
    tokenKey: 'mix-lab',
    username: 'mix_lab_admin',
    mobile: '13800000015',
    unifiedSocialCode: '91310100MA2LAB5001',
    password: 'Abc12345',
  },
]

const authResultMap = new Map<string, AuthResultInfo>([
  ['enterprise-demo-reviewing', { ...AUTH_RESULT_MAP[AUTH_STATUS_ENUM.reviewing], id: 'enterprise-demo-reviewing' }],
  ['institution-demo-password', { ...AUTH_RESULT_MAP[AUTH_STATUS_ENUM.passwordSent], id: 'institution-demo-password' }],
])

function createAuthResult(status: AuthResultInfo['status'], description?: string) {
  const id = `auth-result-${Date.now()}`
  const preset = AUTH_RESULT_MAP[status]
  authResultMap.set(id, {
    ...preset,
    id,
    description: description || preset.description,
  })
  return { id, status } satisfies AuthSubmitResponse
}

function findAccountBy(field: 'username' | 'mobile' | 'unifiedSocialCode', value: string) {
  const target = value.trim().toLowerCase()
  return authAccounts.find((item) => String(item[field] || '').toLowerCase() === target)
}

function buildLoginResponse(account: AuthRecord): AuthLoginResponse {
  const profile = (mockUsersByToken[account.tokenKey] ?? mockUsersByToken.admin)!
  return {
    accessToken: `mock-token-${account.tokenKey}`,
    refreshToken: `refresh-token-${account.tokenKey}`,
    expiresIn: 7200,
    needResetPassword: !!account.needResetPassword,
    accountType: profile.accountType,
    profile,
  }
}

function withLegacyUser(response: AuthLoginResponse): LoginResponse {
  return {
    ...response,
    user: response.profile,
  }
}

function ensurePasswordMatch(source: PasswordLoginForm, account?: AuthRecord) {
  if (!account || account.password !== source.password) {
    throw new Error('账号或密码错误')
  }
  return account
}

export function sendSmsCode(params: SmsCodeParams): Promise<SmsCodeResponse> {
  if (!MOBILE_PATTERN.test(params.mobile)) {
    return Promise.reject(new Error('请输入正确的手机号'))
  }
  return mockPromise({
    success: true,
    expireSeconds: 60,
  }, 260)
}

export function personalRegister(data: PersonalRegisterForm): Promise<AuthSubmitResponse> {
  const tokenKey = `personal-${data.mobile.slice(-4)}`
  mockUsersByToken[tokenKey] = buildPersonalUser({
    key: tokenKey,
    name: data.username,
    mobile: data.mobile,
    email: `${data.username}@mock.cn`,
  })
  authAccounts.push({
    tokenKey,
    username: data.username,
    mobile: data.mobile,
    password: data.password,
  })
  return mockPromise(createAuthResult(AUTH_STATUS_ENUM.approved, '个人账号已创建成功，可直接返回登录页使用账号密码或短信登录。'), 320)
}

export function enterpriseRegister(data: EnterpriseRegisterForm): Promise<AuthSubmitResponse> {
  const tokenKey = `enterprise-${data.mobile.slice(-4)}`
  mockUsersByToken[tokenKey] = buildBusinessUser({
    key: tokenKey,
    name: data.contactName,
    mobile: data.mobile,
    email: `${data.username}@enterprise.mock.cn`,
    accountType: ACCOUNT_TYPE.enterprise,
    enterpriseId: `ent-${Date.now()}`,
    enterpriseName: data.enterpriseName,
    capabilities: [ENTERPRISE_CAPABILITY.demander],
    deptName: '注册联系人',
  })
  authAccounts.push({
    tokenKey,
    username: data.username,
    mobile: data.mobile,
    unifiedSocialCode: data.unifiedSocialCode,
    password: 'Init1234',
    needResetPassword: true,
  })
  return mockPromise(
    createAuthResult(
      AUTH_STATUS_ENUM.submitted,
      '企业注册资料已提交，平台审核通过后将向注册联系人手机号发送初始密码提醒。',
    ),
    380,
  )
}

export function institutionApply(data: InstitutionApplyForm): Promise<AuthSubmitResponse> {
  const tokenKey = `institution-${data.contactMobile.slice(-4)}`
  mockUsersByToken[tokenKey] = buildBusinessUser({
    key: tokenKey,
    name: data.contactName,
    mobile: data.contactMobile,
    email: `${data.loginAccount}@institution.mock.cn`,
    accountType: ACCOUNT_TYPE.institution,
    enterpriseId: `inst-${Date.now()}`,
    enterpriseName: data.institutionName,
    capabilities: [ENTERPRISE_CAPABILITY.labProvider],
    deptName: '机构联系人',
  })
  authAccounts.push({
    tokenKey,
    username: data.loginAccount,
    mobile: data.contactMobile,
    unifiedSocialCode: data.unifiedSocialCode,
    password: 'Init1234',
    needResetPassword: true,
  })
  return mockPromise(
    createAuthResult(
      AUTH_STATUS_ENUM.submitted,
      '机构入驻申请已提交，审核通过后平台将发放初始密码，请关注短信或消息通知。',
    ),
    380,
  )
}

export function personalPasswordLogin(data: PasswordLoginForm): Promise<AuthLoginResponse> {
  const account = findAccountBy('username', data.account) || findAccountBy('mobile', data.account)
  if (!account || mockUsersByToken[account.tokenKey]?.accountType !== ACCOUNT_TYPE.personal) {
    return Promise.reject(new Error('个人账号不存在'))
  }
  return mockPromise(buildLoginResponse(ensurePasswordMatch(data, account)), 260)
}

export function personalSmsLogin(data: SmsLoginForm): Promise<AuthLoginResponse> {
  const account = findAccountBy('mobile', data.mobile)
  if (!account || mockUsersByToken[account.tokenKey]?.accountType !== ACCOUNT_TYPE.personal) {
    return Promise.reject(new Error('个人账号不存在'))
  }
  return mockPromise(buildLoginResponse(account), 260)
}

export function enterpriseUsernameLogin(data: PasswordLoginForm): Promise<AuthLoginResponse> {
  const account = findAccountBy('username', data.account)
  if (!account || mockUsersByToken[account.tokenKey]?.accountType !== ACCOUNT_TYPE.enterprise) {
    return Promise.reject(new Error('企业账号不存在'))
  }
  return mockPromise(buildLoginResponse(ensurePasswordMatch(data, account)), 260)
}

export function enterpriseCodeLogin(data: PasswordLoginForm): Promise<AuthLoginResponse> {
  const account = findAccountBy('unifiedSocialCode', data.account)
  if (!account || mockUsersByToken[account.tokenKey]?.accountType !== ACCOUNT_TYPE.enterprise) {
    return Promise.reject(new Error('企业账号不存在'))
  }
  return mockPromise(buildLoginResponse(ensurePasswordMatch(data, account)), 260)
}

export function institutionUsernameLogin(data: PasswordLoginForm): Promise<AuthLoginResponse> {
  const account = findAccountBy('username', data.account)
  if (!account || mockUsersByToken[account.tokenKey]?.accountType !== ACCOUNT_TYPE.institution) {
    return Promise.reject(new Error('机构账号不存在'))
  }
  return mockPromise(buildLoginResponse(ensurePasswordMatch(data, account)), 260)
}

export function institutionCodeLogin(data: PasswordLoginForm): Promise<AuthLoginResponse> {
  const account = findAccountBy('unifiedSocialCode', data.account)
  if (!account || mockUsersByToken[account.tokenKey]?.accountType !== ACCOUNT_TYPE.institution) {
    return Promise.reject(new Error('机构账号不存在'))
  }
  return mockPromise(buildLoginResponse(ensurePasswordMatch(data, account)), 260)
}

export function getAuthResult(id: string): Promise<AuthResultInfo> {
  return mockPromise(authResultMap.get(id) || { ...AUTH_RESULT_MAP[AUTH_STATUS_ENUM.reviewing], id }, 180)
}

export function forgotPassword(data: ForgotPasswordForm): Promise<AuthSubmitResponse> {
  const account =
    findAccountBy('username', data.account) ||
    findAccountBy('mobile', data.mobile) ||
    findAccountBy('mobile', data.account)

  if (!account) {
    return Promise.reject(new Error('未找到匹配的账号信息'))
  }

  account.password = data.newPassword
  account.needResetPassword = false

  return mockPromise(
    createAuthResult(
      AUTH_STATUS_ENUM.passwordSent,
      '新密码已设置成功，后续可直接返回登录页使用新密码登录系统。',
    ),
    280,
  )
}

export function firstLoginResetPassword(data: FirstLoginResetPasswordForm): Promise<boolean> {
  const tokenKey = getAccessToken().replace('mock-token-', '')
  const matchedAccount = authAccounts.find((item) => item.tokenKey === tokenKey)

  if (!matchedAccount || matchedAccount.password !== data.oldPassword) {
    return Promise.reject(new Error('旧密码不正确'))
  }

  matchedAccount.password = data.newPassword
  matchedAccount.needResetPassword = false
  return mockPromise(true, 260)
}

export function changePassword(data: FirstLoginResetPasswordForm): Promise<boolean> {
  return firstLoginResetPassword(data)
}

export function getCurrentAuthUser(token?: string): Promise<CurrentUser> {
  const key = String(token || '').replace('mock-token-', '') || 'admin'
  return mockPromise((mockUsersByToken[key] || mockUsersByToken.admin)!, 120)
}

export function mockSendAuthCode(payload: SendAuthCodeCommand): Promise<boolean> {
  if (payload.channel === 'mobile') {
    return sendSmsCode({
      mobile: payload.target,
      scene: payload.scene === 'forgot_password' ? 'forgot_password' : 'personal_login',
    }).then(() => true)
  }
  return mockPromise(true, 220)
}

export function mockRegister(payload: RegisterCommand): Promise<boolean> {
  return enterpriseRegister({
    username: payload.mobile,
    mobile: payload.mobile,
    smsCode: payload.code,
    enterpriseName: payload.companyName,
    unifiedSocialCode: payload.creditCode,
    registeredAddress: payload.principalPhone,
    contactName: payload.contactName,
    region: ['四川省', '成都市', '高新区'],
    enterpriseIntro: `${payload.companyName} 企业注册申请`,
    businessScope: payload.role === 'provider' ? '基础服务' : '需求发布',
    remark: payload.inviteCode,
    businessLicense: [],
  }).then(() => true)
}

export function mockLogin(source: string): Promise<LoginResponse> {
  const normalized = source.trim().toLowerCase()
  const account =
    findAccountBy('username', normalized) ||
    findAccountBy('mobile', normalized) ||
    findAccountBy('unifiedSocialCode', normalized) ||
    authAccounts[0]!

  return mockPromise(withLegacyUser(buildLoginResponse(account)), 260)
}

export function mockGetCurrentUser(token: string): Promise<CurrentUser> {
  return getCurrentAuthUser(token)
}
