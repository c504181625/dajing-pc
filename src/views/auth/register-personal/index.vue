<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { personalPasswordLogin, personalRegister, sendSmsCode } from '@/api/modules/auth'
import AuthSimpleLayout from '@/components-business/AuthSimpleLayout/index.vue'
import RegionSelect from '@/components-business/RegionSelect/index.vue'
import { MOBILE_PATTERN, PASSWORD_STRENGTH_PATTERN, USERNAME_PATTERN } from '@/enum/auth'
import { useMessageStore } from '@/store/modules/message'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
import type { PersonalRegisterForm } from '@/types/auth'

const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const messageStore = useMessageStore()

const loading = ref(false)
const smsLoading = ref(false)
const countdown = ref(0)
let timer: number | null = null

const form = reactive<PersonalRegisterForm>({
  username: '',
  mobile: '',
  smsCode: '',
  password: '',
  confirmPassword: '',
  region: [],
  addressDetail: '',
  agreement: false,
})

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
  if (!MOBILE_PATTERN.test(form.mobile)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  smsLoading.value = true
  try {
    await sendSmsCode({
      mobile: form.mobile,
      scene: 'personal_register',
    })
    ElMessage.success('验证码已发送')
    startCountdown()
  } finally {
    smsLoading.value = false
  }
}

async function handleSubmit() {
  if (!USERNAME_PATTERN.test(form.username)) {
    ElMessage.warning('用户名需为 4-20 位字母、数字或下划线')
    return
  }

  if (!MOBILE_PATTERN.test(form.mobile)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  if (!PASSWORD_STRENGTH_PATTERN.test(form.password)) {
    ElMessage.warning('密码需为 8-20 位，至少包含字母和数字')
    return
  }

  if (form.password !== form.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  if (!form.agreement) {
    ElMessage.warning('请先勾选并同意用户协议')
    return
  }

  loading.value = true
  try {
    await personalRegister(form)
    const loginRes = await personalPasswordLogin({
      account: form.username,
      password: form.password,
    })

    userStore.applyLoginResult(loginRes)
    permissionStore.resetRoutes(router)

    if (userStore.userInfo) {
      permissionStore.mountRoutes(router, userStore.userInfo)
    }

    await messageStore.refreshStats()
    ElMessage.success('个人注册成功，已自动登录')
    await router.replace(userStore.landingPath)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '注册失败')
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <AuthSimpleLayout
    title="质量创新中心平台"
    subtitle="统一身份认证与业务办理入口"
    card-title="个人注册"
    card-description="完成手机号验证和密码设置后即可直接进入系统，无需审核。"
    max-width="700px"
  >
    <el-form label-position="top" class="auth-form" @submit.prevent="handleSubmit">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="请输入用户名" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号">
            <el-input v-model="form.mobile" placeholder="请输入手机号" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="验证码">
        <div class="sms-row">
          <el-input v-model="form.smsCode" placeholder="请输入验证码" />
          <el-button :loading="smsLoading" :disabled="countdown > 0" @click="handleSendCode">
            {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
          </el-button>
        </div>
      </el-form-item>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="确认密码">
            <el-input
              v-model="form.confirmPassword"
              type="password"
              show-password
              placeholder="请再次输入密码"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="所在地区">
            <RegionSelect v-model="form.region" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="详细地址">
            <el-input v-model="form.addressDetail" placeholder="请输入详细地址" />
          </el-form-item>
        </el-col>
      </el-row>

      <div class="agreement-row">
        <el-checkbox v-model="form.agreement">我已阅读并同意《用户服务协议》与《隐私政策》</el-checkbox>
      </div>

      <el-button class="submit-button" type="primary" :loading="loading" @click="handleSubmit">
        提交注册
      </el-button>

      <div class="footer-link">
        已有账号？
        <el-link type="primary" underline="never" @click="router.push('/login?subject=personal')">
          返回登录
        </el-link>
      </div>
    </el-form>
  </AuthSimpleLayout>
</template>

<style scoped lang="scss">
.auth-form {
  margin-top: 6px;
}

.sms-row {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 144px;
  gap: 12px;
}

.sms-row :deep(.el-button) {
  width: 100%;
  height: 46px;
  border-radius: 14px;
  border-color: rgb(31 94 255 / 16%);
  background: linear-gradient(180deg, #f7faff 0%, #eef4ff 100%);
  color: var(--dj-color-primary);
  font-weight: 600;
}

.sms-row :deep(.el-button:hover) {
  border-color: rgb(31 94 255 / 24%);
  background: linear-gradient(180deg, #fff 0%, #f4f8ff 100%);
  color: #1f5eff;
}

.sms-row :deep(.el-button.is-disabled) {
  color: #8ba0c5;
  border-color: rgb(148 163 184 / 24%);
  background: #f7f9fc;
}

.agreement-row {
  margin: 2px 0 18px;
}

.submit-button {
  width: 100%;
  height: 46px;
  border-radius: 14px;
}

.footer-link {
  margin-top: 14px;
  text-align: right;
  font-size: 14px;
  color: #6c7d98;
}

:deep(.el-input__wrapper) {
  min-height: 46px;
  border-radius: 14px;
  box-shadow: 0 0 0 1px rgb(31 94 255 / 10%) inset;
}

@media (max-width: 768px) {
  .sms-row {
    grid-template-columns: 1fr;
  }
}
</style>
