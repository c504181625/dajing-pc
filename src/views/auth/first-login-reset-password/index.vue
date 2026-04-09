<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { firstLoginResetPassword } from '@/api/modules/auth'
import AuthPageLayout from '@/components-business/AuthPageLayout/index.vue'
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
    await enterSystem()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '密码修改失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthPageLayout
    title="质量创新中心平台"
    subtitle="平台发放的初始密码仅用于首次登录，首次登录后需立即完成密码重置。"
    card-title="首次登录修改密码"
    card-description="请设置新的安全密码，完成后再进入系统首页。"
  >
    <template #aside>
      <div class="aside-copy">
        <div class="aside-title">安全要求</div>
        <p>新密码需包含字母与数字，长度 8-20 位。密码修改成功后，将以新密码作为后续登录凭证。</p>
      </div>
    </template>

    <el-form label-position="top" class="reset-form" @submit.prevent="handleSubmit">
      <el-form-item label="旧密码">
        <el-input v-model="form.oldPassword" type="password" show-password placeholder="请输入当前初始密码" />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="form.newPassword" type="password" show-password placeholder="请输入新密码" />
      </el-form-item>
      <el-form-item label="确认新密码">
        <el-input v-model="form.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
      </el-form-item>

      <el-button class="submit-button" type="primary" :loading="loading" @click="handleSubmit">
        确认修改并进入系统
      </el-button>
    </el-form>
  </AuthPageLayout>
</template>

<style scoped lang="scss">
.aside-copy {
  padding: 22px;
  border-radius: 20px;
  background: rgb(255 255 255 / 60%);
  border: 1px solid rgb(255 255 255 / 72%);
}

.aside-title {
  font-size: 18px;
  font-weight: 700;
  color: #17233d;
}

.aside-copy p {
  margin: 10px 0 0;
  line-height: 1.8;
  color: #627493;
}

.reset-form {
  margin-top: 8px;
}

.submit-button {
  width: 100%;
  height: 46px;
  border-radius: 14px;
}

:deep(.el-input__wrapper) {
  min-height: 46px;
  border-radius: 14px;
}
</style>
