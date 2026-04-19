import type { AuthResultInfo, AuthStatus, LoginType } from '@/types/auth'

export const AUTH_STATUS_ENUM = {
  submitted: 'submitted',
  reviewing: 'reviewing',
  approved: 'approved',
  rejected: 'rejected',
  passwordSent: 'password_sent',
} as const

export const LOGIN_TYPE_ENUM = {
  password: 'password',
  mobile: 'mobile',
  creditCode: 'credit-code',
} as const

export const AUTH_STATUS_LABEL_MAP: Record<AuthStatus, string> = {
  [AUTH_STATUS_ENUM.submitted]: '已提交',
  [AUTH_STATUS_ENUM.reviewing]: '审核中',
  [AUTH_STATUS_ENUM.approved]: '审核通过',
  [AUTH_STATUS_ENUM.rejected]: '审核驳回',
  [AUTH_STATUS_ENUM.passwordSent]: '已发送初始密码',
}

export const LOGIN_TYPE_LABEL_MAP: Record<LoginType, string> = {
  [LOGIN_TYPE_ENUM.password]: '账号密码登录',
  [LOGIN_TYPE_ENUM.mobile]: '手机验证码登录',
  [LOGIN_TYPE_ENUM.creditCode]: '统一社会信用代码登录',
}

export const LOGIN_TYPE_DESCRIPTION_MAP: Record<LoginType, string> = {
  [LOGIN_TYPE_ENUM.password]: '适用于个人账号、企业账号、平台运营方',
  [LOGIN_TYPE_ENUM.mobile]: '适用于个人账号 / 已绑定手机号账号',
  [LOGIN_TYPE_ENUM.creditCode]: '适用于企业账号',
}

export const AUTH_RESULT_MAP: Record<AuthStatus, AuthResultInfo> = {
  [AUTH_STATUS_ENUM.submitted]: {
    status: AUTH_STATUS_ENUM.submitted,
    title: '提交成功',
    description: '申请资料已提交，平台将在一个工作日内完成初审，请留意短信或站内消息提醒。',
    nextAction: '返回登录',
  },
  [AUTH_STATUS_ENUM.reviewing]: {
    status: AUTH_STATUS_ENUM.reviewing,
    title: '审核中',
    description: '资料正在审核，平台正在核验主体信息与附件材料，请耐心等待。',
    nextAction: '查看登录页',
  },
  [AUTH_STATUS_ENUM.approved]: {
    status: AUTH_STATUS_ENUM.approved,
    title: '审核通过',
    description: '主体审核已通过，可继续登录系统并开展后续业务操作。',
    nextAction: '去登录',
  },
  [AUTH_STATUS_ENUM.rejected]: {
    status: AUTH_STATUS_ENUM.rejected,
    title: '审核驳回',
    description: '当前申请未通过审核，请根据驳回原因补充或修正资料后重新提交。',
    nextAction: '返回登录',
  },
  [AUTH_STATUS_ENUM.passwordSent]: {
    status: AUTH_STATUS_ENUM.passwordSent,
    title: '初始密码已发放',
    description: '平台已生成初始密码并发送至注册联系人，请使用初始密码登录后尽快修改。',
    nextAction: '去登录',
  },
}

export const USERNAME_PATTERN = /^[\u4e00-\u9fa5A-Za-z0-9_]{2,20}$/
export const MOBILE_PATTERN = /^1[3-9]\d{9}$/
export const UNIFIED_SOCIAL_CODE_PATTERN = /^[0-9A-Z]{18}$/
export const PASSWORD_STRENGTH_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&._-]{8,20}$/
