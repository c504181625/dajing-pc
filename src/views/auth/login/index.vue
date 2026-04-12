<script setup lang="ts">
import { Lock, OfficeBuilding, Phone, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onBeforeUnmount, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { loginByCreditCode, loginByMobile, loginByPassword, sendAuthCode } from '@/api/modules/auth'
import AuthSplitLayout from '@/components-business/AuthSplitLayout/index.vue'
import {
  LOGIN_TYPE_DESCRIPTION_MAP,
  LOGIN_TYPE_ENUM,
  LOGIN_TYPE_LABEL_MAP,
  MOBILE_PATTERN,
} from '@/enum/auth'
import { ACCOUNT_TYPE } from '@/enum/role'
import { useMessageStore } from '@/store/modules/message'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
import type { CreditCodeLoginForm, LoginType, PasswordLoginForm, SmsLoginForm } from '@/types/auth'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const messageStore = useMessageStore()

const activeTab = ref<LoginType>(LOGIN_TYPE_ENUM.password)
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

const creditCodeForm = reactive<CreditCodeLoginForm>({
  unifiedSocialCreditCode: '',
  password: '',
  mobile: '',
  code: '',
})

const loginTabs = [
  LOGIN_TYPE_ENUM.password,
  LOGIN_TYPE_ENUM.mobile,
  LOGIN_TYPE_ENUM.creditCode,
] as const

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

async function handleSendCode() {
  if (!MOBILE_PATTERN.test(smsForm.mobile)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  smsLoading.value = true
  try {
    await sendAuthCode({
      channel: 'mobile',
      target: smsForm.mobile,
      scene: 'login_mobile',
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

  const fallbackTarget = userStore.userInfo.homeRoute || userStore.landingPath
  const expectedTarget = redirect || fallbackTarget
  const resolvedTarget = router.resolve(expectedTarget)
  const isNotFoundTarget = resolvedTarget.name === 'NotFound'
  const finalTarget = isNotFoundTarget ? fallbackTarget : expectedTarget

  await router.replace(finalTarget)
}

async function handleLogin() {
  loading.value = true
  try {
    let response

    if (activeTab.value === LOGIN_TYPE_ENUM.password) {
      if (!passwordForm.account || !passwordForm.password) {
        ElMessage.warning('请填写账号和密码')
        return
      }
      response = await loginByPassword(passwordForm)
    } else if (activeTab.value === LOGIN_TYPE_ENUM.mobile) {
      if (!smsForm.mobile || !smsForm.smsCode) {
        ElMessage.warning('请填写手机号和验证码')
        return
      }
      response = await loginByMobile({
        mobile: smsForm.mobile,
        code: smsForm.smsCode,
      })
    } else {
      if (!creditCodeForm.unifiedSocialCreditCode || !creditCodeForm.password) {
        ElMessage.warning('请填写统一社会信用代码和密码')
        return
      }

      response = await loginByCreditCode({
        unifiedSocialCreditCode: creditCodeForm.unifiedSocialCreditCode,
        password: creditCodeForm.password,
      })
    }

    userStore.applyLoginResult(response)

    if (response.needResetPassword) {
      router.replace({
        path: '/first-login-reset-password',
        query: route.query.redirect ? { redirect: String(route.query.redirect) } : undefined,
      })
      return
    }

    permissionStore.resetRoutes(router)
    await enterSystem()

    const accountType = userStore.userInfo?.accountType
    const successText =
      accountType === ACCOUNT_TYPE.operator
        ? '已进入平台运营后台'
        : accountType === ACCOUNT_TYPE.enterprise
          ? '已进入企业后台'
          : '已进入个人后台'

    ElMessage.success(successText)
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
  <AuthSplitLayout
    title="质量创新中心平台"
    subtitle="统一登录后由系统自动识别个人、企业与平台运营身份，并加载对应菜单与权限。"
    :single-column="true"
  >
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
        <!-- <div class="login-brand-eyebrow">Quality Innovation Center</div> -->
        <h2>质量创新中心平台</h2>
      </div>
    </div>

    <div class="login-tabs">
      <button
        v-for="item in loginTabs"
        :key="item"
        type="button"
        class="tab-pill"
        :class="{ active: activeTab === item }"
        @click="activeTab = item"
      >
        {{ LOGIN_TYPE_LABEL_MAP[item] }}
      </button>
    </div>

    <div class="tab-desc">
      {{ LOGIN_TYPE_DESCRIPTION_MAP[activeTab] }}
    </div>

    <el-form label-position="top" class="login-form" @submit.prevent="handleLogin">
      <template v-if="activeTab === LOGIN_TYPE_ENUM.password">
        <el-form-item label="账号 / 用户名 / 手机号">
          <el-input
            v-model="passwordForm.account"
            placeholder="请输入账号、用户名或手机号"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="passwordForm.password"
            type="password"
            show-password
            placeholder="请输入登录密码"
            :prefix-icon="Lock"
            size="large"
          />
        </el-form-item>
      </template>

      <template v-else-if="activeTab === LOGIN_TYPE_ENUM.mobile">
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

      <template v-else>
        <el-form-item label="统一社会信用代码">
          <el-input
            v-model="creditCodeForm.unifiedSocialCreditCode"
            placeholder="请输入统一社会信用代码"
            :prefix-icon="OfficeBuilding"
            size="large"
          />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="creditCodeForm.password"
            type="password"
            show-password
            placeholder="请输入登录密码"
            :prefix-icon="Lock"
            size="large"
          />
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

    <div class="entry-links">
      <el-link type="primary" underline="never" @click="router.push('/register/personal')">
        个人注册
      </el-link>
      <el-link type="primary" underline="never" @click="router.push('/register/enterprise')">
        企业入驻
      </el-link>
      <el-link type="primary" underline="never" @click="router.push('/apply/institution')">
        机构认证
      </el-link>
      <el-link type="primary" underline="never" @click="router.push('/forgot-password')">
        忘记密码
      </el-link>
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
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-width: 0;
  text-align: center;
}

.login-brand-eyebrow {
  margin-bottom: 6px;
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0.08em;
  color: #6a7ca4;
}

.login-brand-copy h2 {
  margin: 0;
  font-size: 28px;
  line-height: 1.18;
  color: #18243d;
}

.login-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}

.tab-pill {
  min-height: 50px;
  padding: 0 12px;
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

.tab-pill.active {
  border-color: rgb(31 94 255 / 20%);
  color: var(--dj-color-text-primary);
  box-shadow: 0 12px 24px rgb(31 94 255 / 10%);
  transform: translateY(-1px);
}

.tab-desc {
  margin-bottom: 18px;
  padding: 10px 12px;
  border-radius: 14px;
  background: #f5f8ff;
  color: var(--dj-color-text-regular);
  font-size: 13px;
  line-height: 1.7;
}

.login-form {
  display: grid;
  gap: 4px;
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

:deep(.el-input__wrapper) {
  min-height: 46px;
  border-radius: 14px;
  box-shadow: 0 0 0 1px rgb(31 94 255 / 10%) inset;
}

.sms-row {
  display: grid;
  width: 100%;
  grid-template-columns: minmax(0, 1fr) 144px;
  gap: 12px;
  align-items: stretch;
}

.sms-row :deep(.el-input) {
  width: 100%;
}

.sms-row :deep(.el-input__wrapper) {
  min-height: 46px;
}

.sms-row__button {
  width: 100%;
  height: 46px;
  margin: 0;
  border-radius: 14px;
  border-color: rgb(31 94 255 / 16%);
  background: linear-gradient(180deg, #f7faff 0%, #eef4ff 100%);
  box-shadow: none;
  color: var(--dj-color-primary);
  font-size: 16px;
  font-weight: 600;
}

.sms-row__button :deep(span) {
  color: inherit;
}

.sms-row__button:hover {
  border-color: rgb(31 94 255 / 24%);
  background: linear-gradient(180deg, #fff 0%, #f4f8ff 100%);
  color: #1f5eff;
}

.sms-row__button:disabled,
.sms-row__button.is-disabled {
  color: #8ba0c5;
  border-color: rgb(148 163 184 / 24%);
  background: linear-gradient(135deg, #c8d7f6 0%, #dce6fb 100%);
  box-shadow: none;
}

.entry-links {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 18px;
}

@media (max-width: 960px) {
  .login-tabs {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .entry-links {
    flex-direction: column;
    align-items: stretch;
  }

  .login-brand-head {
    gap: 12px;
  }

  .login-brand-mark {
    width: 86px;
    height: 64px;
  }

  .login-brand-mark__image {
    width: 64px !important;
    height: 64px !important;
    max-width: 64px !important;
    max-height: 64px !important;
  }

  .login-brand-copy h2 {
    font-size: 20px;
  }

  .sms-row {
    grid-template-columns: 1fr;
  }
}
</style>
