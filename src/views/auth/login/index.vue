<script setup lang="ts">
import { Lock, Phone, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onBeforeUnmount, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { loginByMobile, loginByPassword, sendAuthCode } from '@/api/modules/auth'
import AuthSplitLayout from '@/components-business/AuthSplitLayout/index.vue'
import { LOGIN_TYPE_ENUM, MOBILE_PATTERN } from '@/enum/auth'
import { ACCOUNT_TYPE } from '@/enum/role'
import { useMessageStore } from '@/store/modules/message'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
import type { LoginType, PasswordLoginForm, SmsLoginForm } from '@/types/auth'

type LoginRole = 'personal' | 'enterprise'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const messageStore = useMessageStore()

const roleTabs = [
  { value: 'personal', label: '个人登录' },
  { value: 'enterprise', label: '企业登录' },
] as const

const methodTabs = [
  { value: LOGIN_TYPE_ENUM.password, label: '账号密码登录' },
  { value: LOGIN_TYPE_ENUM.mobile, label: '手机验证码登录' },
] as const

const activeRole = ref<LoginRole>(route.query.subject === 'enterprise' ? 'enterprise' : 'personal')
const activeMethod = ref<LoginType>(LOGIN_TYPE_ENUM.password)
const loading = ref(false)
const smsLoading = ref(false)
const countdown = ref(0)
let timer: number | null = null

const personalPasswordForm = reactive<PasswordLoginForm>({
  account: '',
  password: '',
})

const personalSmsForm = reactive<SmsLoginForm>({
  mobile: '',
  smsCode: '',
})

const enterprisePasswordForm = reactive<PasswordLoginForm>({
  account: '',
  password: '',
})

const enterpriseSmsForm = reactive<SmsLoginForm>({
  mobile: '',
  smsCode: '',
})

function switchRole(role: LoginRole) {
  activeRole.value = role
  activeMethod.value = LOGIN_TYPE_ENUM.password
  resetCountdown()
}

function resetCountdown() {
  if (timer) {
    window.clearInterval(timer)
    timer = null
  }
  countdown.value = 0
}

function startCountdown() {
  resetCountdown()
  countdown.value = 60
  timer = window.setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0) {
      resetCountdown()
    }
  }, 1000)
}

function getSmsTarget() {
  return activeRole.value === 'personal' ? personalSmsForm.mobile : enterpriseSmsForm.mobile
}

async function handleSendCode() {
  const target = getSmsTarget()
  if (!MOBILE_PATTERN.test(target)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  smsLoading.value = true
  try {
    await sendAuthCode({
      channel: 'mobile',
      target,
      scene: 'login_mobile',
    })
    ElMessage.success('验证码已发送，请注意查收')
    startCountdown()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '验证码发送失败')
  } finally {
    smsLoading.value = false
  }
}

async function enterSystem(redirect?: string) {
  if (!userStore.userInfo) return

  permissionStore.mountRoutes(router, userStore.userInfo)

  try {
    await messageStore.refreshStats()
  } catch {
    // Ignore non-critical message stats failure during login.
  }

  const fallbackTarget = userStore.landingPath
  const expectedTarget = redirect || fallbackTarget
  const resolvedTarget = router.resolve(expectedTarget)
  const finalTarget = resolvedTarget.name === 'NotFound' ? fallbackTarget : expectedTarget

  await router.replace(finalTarget)
}

function getRoleMismatchMessage(accountType?: string | null) {
  if (accountType === ACCOUNT_TYPE.operator) {
    return '运营方账号请前往独立的运营方登录页登录'
  }

  if (activeRole.value === 'personal' && accountType !== ACCOUNT_TYPE.personal) {
    return '当前账号不是个人账号，请切换到正确入口登录'
  }

  if (activeRole.value === 'enterprise' && accountType !== ACCOUNT_TYPE.enterprise) {
    return '当前账号不是企业/机构账号，请切换到正确入口登录'
  }

  return ''
}

function resetUnauthorizedSession() {
  userStore.resetUser()
  permissionStore.resetRoutes(router)
  messageStore.resetStats()
}

async function handleLogin() {
  loading.value = true
  try {
    const redirect = route.query.redirect ? String(route.query.redirect) : undefined
    let response

    if (activeRole.value === 'personal') {
      if (activeMethod.value === LOGIN_TYPE_ENUM.password) {
        if (!personalPasswordForm.account || !personalPasswordForm.password) {
          ElMessage.warning('请填写用户名/手机号和密码')
          return
        }

        response = await loginByPassword(personalPasswordForm)
      } else {
        if (!personalSmsForm.mobile || !personalSmsForm.smsCode) {
          ElMessage.warning('请填写手机号和验证码')
          return
        }

        if (!MOBILE_PATTERN.test(personalSmsForm.mobile)) {
          ElMessage.warning('请输入正确的手机号')
          return
        }

        response = await loginByMobile({
          mobile: personalSmsForm.mobile,
          code: personalSmsForm.smsCode,
        })
      }
    } else {
      if (activeMethod.value === LOGIN_TYPE_ENUM.password) {
        if (!enterprisePasswordForm.account || !enterprisePasswordForm.password) {
          ElMessage.warning('请填写用户名/手机号/统一社会信用代码和密码')
          return
        }

        response = await loginByPassword(enterprisePasswordForm)
      } else {
        if (!enterpriseSmsForm.mobile || !enterpriseSmsForm.smsCode) {
          ElMessage.warning('请填写手机号和验证码')
          return
        }

        if (!MOBILE_PATTERN.test(enterpriseSmsForm.mobile)) {
          ElMessage.warning('请输入正确的手机号')
          return
        }

        response = await loginByMobile({
          mobile: enterpriseSmsForm.mobile,
          code: enterpriseSmsForm.smsCode,
        })
      }
    }

    userStore.applyLoginResult(response)

    const accountType = userStore.userInfo?.accountType
    const mismatchMessage = getRoleMismatchMessage(accountType)
    if (mismatchMessage) {
      resetUnauthorizedSession()
      ElMessage.error(mismatchMessage)
      if (accountType === ACCOUNT_TYPE.operator) {
        router.replace('/operator-login')
      }
      return
    }

    if (response.needResetPassword) {
      router.replace({
        path: '/first-login-reset-password',
        query: redirect ? { redirect } : undefined,
      })
      return
    }

    permissionStore.resetRoutes(router)
    await enterSystem(redirect)

    ElMessage.success(activeRole.value === 'enterprise' ? '已进入企业/机构后台' : '已进入个人后台')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  resetCountdown()
})
</script>

<template>
  <AuthSplitLayout title="质量创新中心平台" :single-column="true">
    <div class="login-brand-head">
      <div class="login-brand-mark">
        <img
          src="/logo.png"
          alt="质量创新中心平台"
          class="login-brand-mark__image"
          width="88"
          height="88"
        />
      </div>
      <div class="login-brand-copy">
        <h2>质量创新中心平台</h2>
      </div>
    </div>

    <div class="role-tabs">
      <button
        v-for="item in roleTabs"
        :key="item.value"
        type="button"
        class="role-pill"
        :class="{ active: activeRole === item.value }"
        @click="switchRole(item.value)"
      >
        {{ item.label }}
      </button>
    </div>

    <section class="login-panel">
      <div class="method-tabs">
        <button
          v-for="item in methodTabs"
          :key="item.value"
          type="button"
          class="method-pill"
          :class="{ active: activeMethod === item.value }"
          @click="activeMethod = item.value"
        >
          {{ item.label }}
        </button>
      </div>

      <el-form label-position="top" class="login-form" @submit.prevent="handleLogin">
        <template v-if="activeRole === 'personal' && activeMethod === LOGIN_TYPE_ENUM.password">
          <el-form-item label="用户名/手机号">
            <el-input
              v-model="personalPasswordForm.account"
              placeholder="请输入用户名或手机号"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>

          <el-form-item label="密码">
            <el-input
              v-model="personalPasswordForm.password"
              type="password"
              show-password
              placeholder="请输入密码"
              :prefix-icon="Lock"
              size="large"
            />
          </el-form-item>
        </template>

        <template v-else-if="activeRole === 'personal' && activeMethod === LOGIN_TYPE_ENUM.mobile">
          <el-form-item label="手机号">
            <el-input
              v-model="personalSmsForm.mobile"
              placeholder="请输入手机号"
              :prefix-icon="Phone"
              size="large"
            />
          </el-form-item>

          <el-form-item label="验证码">
            <div class="sms-row">
              <el-input
                v-model="personalSmsForm.smsCode"
                placeholder="请输入验证码"
                size="large"
              />
              <el-button
                class="sms-row__button"
                :loading="smsLoading"
                :disabled="countdown > 0"
                @click="handleSendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
        </template>

        <template v-else-if="activeRole === 'enterprise' && activeMethod === LOGIN_TYPE_ENUM.password">
          <el-form-item label="用户名/手机号/统一社会信用代码">
            <el-input
              v-model="enterprisePasswordForm.account"
              placeholder="请输入用户名、手机号或统一社会信用代码"
              :prefix-icon="User"
              size="large"
            />
          </el-form-item>

          <el-form-item label="密码">
            <el-input
              v-model="enterprisePasswordForm.password"
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
              v-model="enterpriseSmsForm.mobile"
              placeholder="请输入手机号"
              :prefix-icon="Phone"
              size="large"
            />
          </el-form-item>

          <el-form-item label="验证码">
            <div class="sms-row">
              <el-input
                v-model="enterpriseSmsForm.smsCode"
                placeholder="请输入验证码"
                size="large"
              />
              <el-button
                class="sms-row__button"
                :loading="smsLoading"
                :disabled="countdown > 0"
                @click="handleSendCode"
              >
                {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
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
    </section>

    <div class="entry-links">
      <template v-if="activeRole === 'personal'">
        <el-link type="primary" underline="never" @click="router.push('/register/personal')">
          个人注册
        </el-link>
        <el-link type="primary" underline="never" @click="router.push('/forgot-password')">
          忘记密码
        </el-link>
      </template>
      <template v-else>
        <el-link type="primary" underline="never" @click="router.push('/register/enterprise')">
          企业注册
        </el-link>
        <el-link type="primary" underline="never" @click="router.push('/forgot-password')">
          忘记密码
        </el-link>
      </template>
    </div>
  </AuthSplitLayout>
</template>

<style scoped lang="scss">
.login-brand-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: fit-content;
  margin: 0 auto 26px;
}

.login-brand-mark {
  width: 120px;
  height: 86px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.login-brand-mark__image {
  display: block;
  width: 88px !important;
  height: 88px !important;
  max-width: 88px !important;
  max-height: 88px !important;
  object-fit: contain;
}

.login-brand-copy {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  text-align: center;
}

.login-brand-copy h2 {
  margin: 0;
  font-size: 28px;
  line-height: 1.18;
  color: #18243d;
}

.role-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
  padding: 6px;
  border-radius: 18px;
  background: linear-gradient(180deg, rgb(245 249 255 / 96%) 0%, rgb(236 244 255 / 92%) 100%);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 78%);
}

.role-pill,
.method-pill {
  min-height: 50px;
  padding: 0 14px;
  border: 1px solid rgb(15 23 42 / 8%);
  border-radius: 16px;
  background: linear-gradient(180deg, #fff 0%, #f8fbff 100%);
  color: var(--dj-color-text-secondary);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.role-pill.active,
.method-pill.active {
  border-color: rgb(31 94 255 / 20%);
  color: var(--dj-color-text-primary);
  box-shadow: 0 12px 24px rgb(31 94 255 / 10%);
  transform: translateY(-1px);
}

.login-panel {
  padding: 24px 18px 12px;
  border: 1px solid rgb(15 23 42 / 7%);
  border-radius: 20px;
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
}

.method-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 22px;
}

.method-pill {
  min-height: 44px;
  border-radius: 14px;
  font-size: 14px;
}

.login-form {
  display: grid;
  gap: 4px;
}

.sms-row {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr) 120px;
  gap: 12px;
  align-items: stretch;
}

.sms-row :deep(.el-input) {
  width: 100%;
}

.sms-row__button {
  width: 120px;
  height: 40px;
  border-radius: 12px;
  justify-self: end;
}

.submit-button {
  width: 100%;
  height: 50px;
  margin-top: 6px;
  border: 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #2f7cf6 0%, #4ea0ff 100%);
  box-shadow: 0 16px 32px rgb(47 124 246 / 22%);
}

.entry-links {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-top: 18px;
  font-size: 14px;
}

.entry-links :deep(.el-link) {
  font-size: 14px;
  font-weight: 500;
}

@media (max-width: 768px) {
  .login-brand-copy h2 {
    font-size: 24px;
  }

  .login-panel {
    padding: 16px 14px 10px;
    border-radius: 18px;
  }

  .role-tabs,
  .method-tabs {
    gap: 8px;
  }

  .role-pill,
  .method-pill {
    min-height: 46px;
    padding: 0 10px;
    border-radius: 14px;
    font-size: 14px;
  }

  .role-tabs {
    margin-bottom: 16px;
    padding: 5px;
  }

  .method-pill {
    min-height: 42px;
  }

  .sms-row {
    grid-template-columns: 1fr;
  }
}
</style>
