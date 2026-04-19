<script setup lang="ts">
import { Lock, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { loginByPassword } from '@/api/modules/auth'
import AuthSplitLayout from '@/components-business/AuthSplitLayout/index.vue'
import { ACCOUNT_TYPE } from '@/enum/role'
import { useMessageStore } from '@/store/modules/message'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
import type { PasswordLoginForm } from '@/types/auth'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const messageStore = useMessageStore()

const loading = ref(false)
const form = reactive<PasswordLoginForm>({
  account: '',
  password: '',
})

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

function resetUnauthorizedSession() {
  userStore.resetUser()
  permissionStore.resetRoutes(router)
  messageStore.resetStats()
}

async function handleLogin() {
  if (!form.account || !form.password) {
    ElMessage.warning('请填写账号和密码')
    return
  }

  loading.value = true
  try {
    const redirect = route.query.redirect ? String(route.query.redirect) : undefined
    const response = await loginByPassword(form)
    userStore.applyLoginResult(response)

    if (userStore.userInfo?.accountType !== ACCOUNT_TYPE.operator) {
      const accountType = userStore.userInfo?.accountType
      resetUnauthorizedSession()
      ElMessage.error(
        accountType === ACCOUNT_TYPE.enterprise || accountType === ACCOUNT_TYPE.personal
          ? '当前账号不是运营方账号，请返回个人/企业登录页'
          : '当前账号无权进入运营后台',
      )
      router.replace('/login')
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
    ElMessage.success('已进入平台运营后台')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败，请稍后重试')
  } finally {
    loading.value = false
  }
}
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
        <h2>质量创新中心平台-运营后台</h2>
      </div>
    </div>

    <section class="login-panel">
      <el-form label-position="top" class="login-form" @submit.prevent="handleLogin">
        <el-form-item label="账号">
          <el-input
            v-model="form.account"
            placeholder="请输入运营账号"
            :prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="请输入密码"
            :prefix-icon="Lock"
            size="large"
          />
        </el-form-item>

        <el-button
          class="submit-button"
          type="primary"
          size="large"
          :loading="loading"
          @click="handleLogin"
        >
          登录运营后台
        </el-button>
      </el-form>
    </section>
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
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
}

.login-brand-copy h2 {
  margin: 0;
  font-size: 28px;
  line-height: 1.18;
  color: #18243d;
}

.login-brand-copy p {
  margin: 8px 0 0;
  font-size: 15px;
  color: var(--dj-color-text-secondary);
}

.login-panel {
  padding: 24px 18px 12px;
  border: 1px solid rgb(15 23 42 / 7%);
  border-radius: 20px;
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
}

.operator-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 16px;
  margin-bottom: 22px;
  border: 1px solid rgb(31 94 255 / 18%);
  border-radius: 999px;
  background: rgb(31 94 255 / 8%);
  color: var(--dj-color-primary);
  font-size: 14px;
  font-weight: 600;
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

.entry-links {
  display: flex;
  justify-content: center;
  margin-top: 18px;
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
    padding: 18px 14px 10px;
    border-radius: 18px;
  }
}
</style>
