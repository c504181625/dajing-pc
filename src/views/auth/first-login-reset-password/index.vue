<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { firstLoginResetPassword } from '@/api/modules/auth'
import AuthSimpleLayout from '@/components-business/AuthSimpleLayout/index.vue'
import { PASSWORD_STRENGTH_PATTERN } from '@/enum/auth'
import { useMessageStore } from '@/store/modules/message'
import { usePermissionStore } from '@/store/modules/permission'
import { useUserStore } from '@/store/modules/user'
import type { FirstLoginResetPasswordForm } from '@/types/auth'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const permissionStore = usePermissionStore()
const messageStore = useMessageStore()

const loading = ref(false)
const form = reactive<FirstLoginResetPasswordForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

async function goToLogin() {
  userStore.logout()
  permissionStore.resetRoutes(router)
  await router.replace('/login')
}

async function enterSystem() {
  if (!userStore.userInfo) return
  permissionStore.mountRoutes(router, userStore.userInfo)
  await messageStore.refreshStats()
  await router.replace(String(route.query.redirect || userStore.landingPath))
}

async function handleSubmit() {
  if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
    ElMessage.warning('请完整填写密码信息')
    return
  }
  if (!PASSWORD_STRENGTH_PATTERN.test(form.newPassword)) {
    ElMessage.warning('新密码需为 8-20 位，至少包含字母和数字')
    return
  }
  if (form.newPassword !== form.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }

  loading.value = true
  try {
    await firstLoginResetPassword(form)
    userStore.completeFirstLoginReset()
    ElMessage.success('密码修改成功')

    if (String(route.query.redirect || '') === '/login') {
      await goToLogin()
      return
    }

    await enterSystem()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '密码修改失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthSimpleLayout
    title="质量创新中心平台"
    card-title="首次登录修改密码"
    card-description="平台初始密码仅用于首次登录，请先完成密码重置，再进入系统。"
    max-width="640px"
  >
    <el-form label-position="top" class="reset-form" @submit.prevent="handleSubmit">
      <el-form-item label="旧密码">
        <el-input
          v-model="form.oldPassword"
          type="password"
          show-password
          placeholder="请输入当前初始密码"
        />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input
          v-model="form.newPassword"
          type="password"
          show-password
          placeholder="请输入新密码"
        />
      </el-form-item>
      <el-form-item label="确认新密码">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          show-password
          placeholder="请再次输入新密码"
        />
      </el-form-item>

      <el-button class="submit-button" type="primary" :loading="loading" @click="handleSubmit">
        确认修改并进入系统
      </el-button>
    </el-form>

    <div class="page-actions">
      <el-button class="back-button" @click="goToLogin">返回登录界面</el-button>
    </div>
  </AuthSimpleLayout>
</template>

<style scoped lang="scss">
.reset-form {
  margin-top: 8px;
}

.submit-button,
.back-button {
  width: 100%;
  height: 46px;
  border-radius: 14px;
}

.page-actions {
  margin-top: 16px;
}

:deep(.el-input__wrapper) {
  min-height: 46px;
  border-radius: 14px;
}
</style>
