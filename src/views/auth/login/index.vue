<script setup lang="ts">
import { Lock, OfficeBuilding, Phone, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  enterpriseCodeLogin,
  enterpriseUsernameLogin,
  institutionCodeLogin,
  institutionUsernameLogin,
  loginByPassword,
  personalPasswordLogin,
  personalSmsLogin,
  sendSmsCode,
} from '@/api/modules/auth'
import AuthSplitLayout from '@/components-business/AuthSplitLayout/index.vue'
import { LOGIN_TYPE_ENUM, LOGIN_TYPE_LABEL_MAP, MOBILE_PATTERN } from '@/enum/auth'
import { ACCOUNT_TYPE, ACCOUNT_TYPE_LABEL_MAP } from '@/enum/role'
import { useMessageStore } from '@/store/modules/message'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
import type { LoginType, PasswordLoginForm, SmsLoginForm } from '@/types/auth'

type LoginSubject = 'personal' | 'enterprise' | 'institution' | 'platform_admin'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const messageStore = useMessageStore()

const loading = ref(false)
const smsLoading = ref(false)
const countdown = ref(0)
let timer: number | null = null

const passwordForm = reactive<PasswordLoginForm>({
  account: '',
  password: '',
})

const smsForm = reactive<SmsLoginForm>({
  mobile: '',
  smsCode: '',
})

const accountType = ref<LoginSubject>('platform_admin')
const loginType = ref<LoginType>(LOGIN_TYPE_ENUM.personalPassword)

const subjectOptions = [
  { label: '个人登录', value: 'personal' },
  { label: '企业登录', value: 'enterprise' },
  { label: '机构登录', value: 'institution' },
] satisfies Array<{ label: string; value: Exclude<LoginSubject, 'platform_admin'> }>

const modeOptions = computed(() => {
  switch (accountType.value) {
    case 'personal':
      return [LOGIN_TYPE_ENUM.personalPassword, LOGIN_TYPE_ENUM.personalSms]
    case 'enterprise':
      return [LOGIN_TYPE_ENUM.enterpriseUsernamePassword, LOGIN_TYPE_ENUM.enterpriseCodePassword]
    case 'institution':
      return [LOGIN_TYPE_ENUM.institutionUsernamePassword, LOGIN_TYPE_ENUM.institutionCodePassword]
    default:
      return [LOGIN_TYPE_ENUM.personalPassword]
  }
})

const currentTitle = computed(() => {
  if (accountType.value === 'platform_admin') return '平台运营方登录'
  return ACCOUNT_TYPE_LABEL_MAP[accountType.value]
})

const accountLabel = computed(() => {
  switch (loginType.value) {
    case LOGIN_TYPE_ENUM.enterpriseCodePassword:
    case LOGIN_TYPE_ENUM.institutionCodePassword:
      return '统一社会信用代码'
    case LOGIN_TYPE_ENUM.personalPassword:
      return '账号 / 手机号'
    default:
      return '账号'
  }
})

const accountPlaceholder = computed(() => {
  switch (loginType.value) {
    case LOGIN_TYPE_ENUM.enterpriseUsernamePassword:
      return '请输入企业用户名'
    case LOGIN_TYPE_ENUM.enterpriseCodePassword:
      return '请输入统一社会信用代码'
    case LOGIN_TYPE_ENUM.institutionUsernamePassword:
      return '请输入机构账户名'
    case LOGIN_TYPE_ENUM.institutionCodePassword:
      return '请输入统一社会信用代码'
    default:
      return '请输入账号或手机号'
  }
})

function setDefaultMode(subject: LoginSubject) {
  accountType.value = subject
  switch (subject) {
    case 'personal':
      loginType.value = LOGIN_TYPE_ENUM.personalPassword
      break
    case 'enterprise':
      loginType.value = LOGIN_TYPE_ENUM.enterpriseUsernamePassword
      break
    case 'institution':
      loginType.value = LOGIN_TYPE_ENUM.institutionUsernamePassword
      break
    default:
      loginType.value = LOGIN_TYPE_ENUM.personalPassword
      break
  }
}

function syncFromQuery() {
  const querySubject = String(route.query.subject || '').trim() as LoginSubject
  const allowedSubject: LoginSubject[] = ['personal', 'enterprise', 'institution', 'platform_admin']
  const subject = allowedSubject.includes(querySubject) ? querySubject : 'platform_admin'
  setDefaultMode(subject)

  const queryMode = String(route.query.mode || '').trim() as LoginType
  const currentModes = modeOptions.value as LoginType[]
  if (currentModes.includes(queryMode)) {
    loginType.value = queryMode
  }
}

watch(() => route.query, syncFromQuery, { immediate: true })

function resetForms() {
  passwordForm.account = ''
  passwordForm.password = ''
  smsForm.mobile = ''
  smsForm.smsCode = ''
}

function switchSubject(subject: LoginSubject) {
  setDefaultMode(subject)
  resetForms()
}

function startCountdown() {
  countdown.value = 60
  if (timer) window.clearInterval(timer)
  timer = window.setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && timer) {
      window.clearInterval(timer)
      timer = null
    }
  }, 1000)
}

async function handleSendCode() {
  if (!MOBILE_PATTERN.test(smsForm.mobile)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  smsLoading.value = true
  try {
    await sendSmsCode({
      mobile: smsForm.mobile,
      scene: 'personal_login',
    })
    ElMessage.success('验证码已发送，请注意查收')
    startCountdown()
  } finally {
    smsLoading.value = false
  }
}

async function enterSystem(redirect?: string) {
  if (!userStore.userInfo) return

  permissionStore.mountRoutes(router, userStore.userInfo)

  await messageStore.refreshStats()
  await router.replace(redirect || userStore.landingPath)
}

async function handleLogin() {
  if (loginType.value === LOGIN_TYPE_ENUM.personalSms) {
    if (!smsForm.mobile || !smsForm.smsCode) {
      ElMessage.warning('请先填写手机号和验证码')
      return
    }
  } else if (!passwordForm.account || !passwordForm.password) {
    ElMessage.warning('请先填写账号和密码')
    return
  }

  loading.value = true
  try {
    let response

    if (accountType.value === 'platform_admin') {
      response = await loginByPassword(passwordForm)
    } else {
      switch (loginType.value) {
        case LOGIN_TYPE_ENUM.personalPassword:
          response = await personalPasswordLogin(passwordForm)
          break
        case LOGIN_TYPE_ENUM.personalSms:
          response = await personalSmsLogin(smsForm)
          break
        case LOGIN_TYPE_ENUM.enterpriseUsernamePassword:
          response = await enterpriseUsernameLogin(passwordForm)
          break
        case LOGIN_TYPE_ENUM.enterpriseCodePassword:
          response = await enterpriseCodeLogin(passwordForm)
          break
        case LOGIN_TYPE_ENUM.institutionUsernamePassword:
          response = await institutionUsernameLogin(passwordForm)
          break
        case LOGIN_TYPE_ENUM.institutionCodePassword:
          response = await institutionCodeLogin(passwordForm)
          break
      }
    }

    if (!response) return
    userStore.applyLoginResult(response)

    if (response.needResetPassword) {
      router.replace({
        path: '/first-login-reset-password',
        query: route.query.redirect ? { redirect: String(route.query.redirect) } : undefined,
      })
      return
    }

    if (response.accountType === ACCOUNT_TYPE.personal && String(route.query.showAuthResult) === '1') {
      router.replace({
        path: '/auth-result',
        query: {
          status: 'approved',
          title: '登录成功',
          description:
            '个人账号认证已完成，PC 端业务入口当前为预留状态，请优先使用移动端继续办理。',
        },
      })
      return
    }

    permissionStore.resetRoutes(router)
    await enterSystem(String(route.query.redirect || ''))
    ElMessage.success('登录成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <AuthSplitLayout
    title="质量创新中心平台"
    subtitle="面向个人、企业、检测机构与平台运营方的统一认证入口。企业注册与机构入驻提交后，由平台审核并发放初始密码。"
    card-title="统一登录"
    card-description="支持个人、企业、机构与平台运营方登录，收到初始密码的账号首次登录后需完成密码修改。"
  >
    <template #aside>
      <div class="aside-intro">
        <div class="intro-title">统一身份认证与角色访问入口</div>
      </div>
      <div class="intro-points">
        <div class="intro-point">
          <div class="point-name">企业注册</div>
          <div class="point-desc">提交主体资料后进入待审核，审核通过后平台发送初始密码。</div>
        </div>
        <div class="intro-point">
          <div class="point-name">机构入驻</div>
          <div class="point-desc">一屏完成机构申请，适用于检测机构入驻与后续后台登录。</div>
        </div>
      </div>
    </template>

    <div class="subject-row">
      <button
        v-for="item in subjectOptions"
        :key="item.value"
        type="button"
        class="subject-pill"
        :class="{ active: accountType === item.value }"
        @click="switchSubject(item.value)"
      >
        {{ item.label }}
      </button>
      <button
        type="button"
        class="platform-pill"
        :class="{ active: accountType === 'platform_admin' }"
        @click="switchSubject('platform_admin')"
      >
        平台运营方登录
      </button>
    </div>

    <div v-if="accountType !== 'platform_admin'" class="mode-row">
      <button
        v-for="item in modeOptions"
        :key="item"
        type="button"
        class="mode-pill"
        :class="{ active: loginType === item }"
        @click="loginType = item"
      >
        {{ LOGIN_TYPE_LABEL_MAP[item] }}
      </button>
    </div>

    <el-form label-position="top" class="login-form" @submit.prevent="handleLogin">
      <template v-if="loginType !== LOGIN_TYPE_ENUM.personalSms">
        <el-form-item :label="accountType === 'platform_admin' ? '运营账号' : accountLabel">
          <el-input
            v-model="passwordForm.account"
            :placeholder="
              accountType === 'platform_admin' ? '请输入平台运营账号' : accountPlaceholder
            "
            :prefix-icon="accountType === 'platform_admin' ? OfficeBuilding : User"
            size="large"
          />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="passwordForm.password"
            type="password"
            show-password
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
          />
        </el-form-item>
      </template>

      <template v-else>
        <el-form-item label="手机号">
          <el-input
            v-model="smsForm.mobile"
            placeholder="请输入手机号"
            :prefix-icon="Phone"
            size="large"
          />
        </el-form-item>

        <el-form-item label="验证码">
          <div class="sms-row">
            <el-input v-model="smsForm.smsCode" placeholder="请输入验证码" size="large" />
            <el-button
              class="sms-button"
              size="large"
              :loading="smsLoading"
              :disabled="countdown > 0"
              @click="handleSendCode"
            >
              {{ countdown > 0 ? `${countdown}s 后重发` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>
      </template>

      <el-button
        class="submit-button"
        type="primary"
        size="large"
        :loading="loading"
        @click="handleLogin"
      >
        登录系统
      </el-button>
    </el-form>

    <div class="auth-links">
      <el-link type="primary" underline="never" @click="router.push('/register/personal')"
        >个人注册</el-link
      >
      <el-link type="primary" underline="never" @click="router.push('/register/enterprise')"
        >企业注册</el-link
      >
      <el-link type="primary" underline="never" @click="router.push('/apply/institution')"
        >机构入驻</el-link
      >
      <el-link type="primary" underline="never" @click="router.push('/forgot-password')"
        >忘记密码</el-link
      >
    </div>

    <div class="auth-note">
      <span
        >{{ currentTitle }}通过统一认证通道进入系统；企业与机构使用初始密码登录后需立即改密。</span
      >
    </div>
  </AuthSplitLayout>
</template>

<style scoped lang="scss">
.aside-intro,
.intro-points {
  border-radius: 22px;
  border: 1px solid rgb(255 255 255 / 68%);
  background: rgb(255 255 255 / 58%);
  box-shadow: 0 16px 34px rgb(31 94 255 / 6%);
}

.aside-intro {
  padding: 20px 22px;
}

.intro-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a2843;
}

.aside-intro p {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.8;
  color: #627492;
}

.intro-points {
  padding: 10px 0;
}

.intro-point {
  padding: 12px 22px;
}

.intro-point + .intro-point {
  border-top: 1px solid rgb(15 23 42 / 6%);
}

.point-name {
  font-size: 15px;
  font-weight: 700;
  color: #1b2a45;
}

.point-desc {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.7;
  color: #687b99;
}

.subject-row,
.mode-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.mode-row {
  margin-top: 18px;
  margin-bottom: 22px;
}

.subject-pill,
.platform-pill,
.mode-pill {
  height: 42px;
  padding: 0 18px;
  border-radius: 14px;
  border: 1px solid rgb(31 94 255 / 14%);
  background: rgb(246 249 255 / 84%);
  color: #566889;
  font-size: 14px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.subject-pill:hover,
.platform-pill:hover,
.mode-pill:hover {
  border-color: rgb(31 94 255 / 22%);
  background: rgb(255 255 255 / 94%);
}

.subject-pill.active,
.platform-pill.active,
.mode-pill.active {
  color: var(--dj-color-primary);
  border-color: rgb(31 94 255 / 24%);
  background: #fff;
  box-shadow: 0 10px 24px rgb(31 94 255 / 10%);
}

.platform-pill {
  margin-left: auto;
}

.login-form {
  margin-top: 20px;
}

.sms-row {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 144px;
  gap: 12px;
}

.sms-button,
.submit-button {
  border-radius: 14px;
}

.submit-button {
  width: 100%;
  margin-top: 12px;
  height: 46px;
  font-size: 16px;
}

.auth-links {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

.auth-note {
  margin-top: 18px;
  display: flex;
  gap: 8px;
  align-items: flex-start;
  font-size: 13px;
  line-height: 1.7;
  color: #677998;
}

:deep(.el-input__wrapper) {
  min-height: 46px;
  border-radius: 14px;
  box-shadow: 0 0 0 1px rgb(31 94 255 / 10%) inset;
}

@media (max-width: 768px) {
  .platform-pill {
    margin-left: 0;
  }

  .sms-row {
    grid-template-columns: 1fr;
  }
}
</style>
