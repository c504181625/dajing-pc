<script setup lang="ts">
import { Monitor } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { LOGIN_DEMO_ACCOUNTS } from '@/constants/dicts'
import { useUserStore } from '@/store/modules/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loginMode = ref<'password' | 'mobile' | 'email'>('password')
const loading = ref(false)

const passwordForm = reactive({
  account: 'admin',
  password: '123456',
})

const mobileForm = reactive({
  mobile: '13800000003',
  code: '123456',
})

const emailForm = reactive({
  email: 'admin@dajing.cn',
  code: '123456',
})

async function handleLogin() {
  loading.value = true
  try {
    if (loginMode.value === 'password') {
      await userStore.loginWithPassword(passwordForm)
    } else if (loginMode.value === 'mobile') {
      await userStore.loginWithMobile(mobileForm)
    } else {
      await userStore.loginWithEmail(emailForm)
    }

    ElMessage.success('登录成功')
    router.replace((route.query.redirect as string) || userStore.landingPath)
  } finally {
    loading.value = false
  }
}

function useDemoAccount(account: string) {
  passwordForm.account = account
  passwordForm.password = '123456'
  loginMode.value = 'password'
}
</script>

<template>
  <div class="login-page">
    <div class="login-intro">
      <div class="badge">
        <el-icon><Monitor /></el-icon>
        <span>Quality Innovation Center</span>
      </div>
      <h1>质量创新中心平台（一期）</h1>
      <p>一期聚焦企业审核、需求对接、检验检测订单闭环和监管配置，当前骨架已支持平台端与企业端同系统多角色访问。</p>

      <div class="feature-list">
        <div class="feature-item">
          <strong>审核驱动</strong>
          <span>企业入驻审核、报告审核、社区内容审核统一收口</span>
        </div>
        <div class="feature-item">
          <strong>工作台驱动</strong>
          <span>平台端看待办与风险，企业端看订单与报告</span>
        </div>
        <div class="feature-item">
          <strong>权限隔离</strong>
          <span>菜单、按钮、数据范围三层隔离，支持跨企业监管</span>
        </div>
      </div>
    </div>

    <div class="login-panel">
      <el-card shadow="never" class="login-card">
        <template #header>
          <div class="card-title">
            <span>统一登录</span>
            <small>支持账号密码 / 手机验证码 / 邮箱验证码</small>
          </div>
        </template>

        <el-tabs v-model="loginMode" stretch>
          <el-tab-pane label="账号密码" name="password">
            <el-form label-position="top">
              <el-form-item label="账号">
                <el-input v-model="passwordForm.account" placeholder="请输入账号" />
              </el-form-item>
              <el-form-item label="密码">
                <el-input v-model="passwordForm.password" type="password" show-password placeholder="请输入密码" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="手机验证码" name="mobile">
            <el-form label-position="top">
              <el-form-item label="手机号">
                <el-input v-model="mobileForm.mobile" placeholder="请输入手机号" />
              </el-form-item>
              <el-form-item label="验证码">
                <el-input v-model="mobileForm.code" placeholder="请输入验证码" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="邮箱验证" name="email">
            <el-form label-position="top">
              <el-form-item label="邮箱">
                <el-input v-model="emailForm.email" placeholder="请输入邮箱" />
              </el-form-item>
              <el-form-item label="验证码">
                <el-input v-model="emailForm.code" placeholder="请输入验证码" />
              </el-form-item>
            </el-form>
          </el-tab-pane>
        </el-tabs>

        <el-button type="primary" size="large" class="submit-btn" :loading="loading" @click="handleLogin">
          登录系统
        </el-button>

        <div class="demo-accounts">
          <div class="demo-title">演示账号</div>
          <el-space wrap>
            <el-button v-for="item in LOGIN_DEMO_ACCOUNTS" :key="item.account" plain @click="useDemoAccount(item.account)">
              {{ item.label }}
            </el-button>
          </el-space>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  background:
    radial-gradient(circle at top left, rgb(31 94 255 / 20%), transparent 32%),
    linear-gradient(135deg, #f6f8ff 0%, #eef3fb 100%);
}

.login-intro {
  padding: 72px 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgb(31 94 255 / 10%);
  color: var(--dj-color-primary);
}

.login-intro h1 {
  margin: 28px 0 16px;
  font-size: 42px;
  line-height: 1.2;
}

.login-intro p {
  margin: 0;
  max-width: 560px;
  color: var(--dj-color-text-regular);
  line-height: 1.8;
}

.feature-list {
  margin-top: 40px;
  display: grid;
  gap: 16px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 520px;
  padding: 18px 20px;
  background: rgb(255 255 255 / 72%);
  border: 1px solid rgb(31 94 255 / 10%);
  border-radius: 16px;
  backdrop-filter: blur(10px);
}

.feature-item span {
  color: var(--dj-color-text-regular);
}

.login-panel {
  display: grid;
  place-items: center;
  padding: 40px;
}

.login-card {
  width: min(460px, 100%);
  border: none;
  border-radius: 20px;
  box-shadow: 0 18px 40px rgb(15 32 64 / 10%);
}

.card-title {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-title small {
  color: var(--dj-color-text-regular);
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
}

.demo-accounts {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px dashed var(--dj-color-border);
}

.demo-title {
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--dj-color-text-regular);
}
</style>
