<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref, watch } from 'vue'

import { changePassword } from '@/api/modules/auth'
import { PASSWORD_STRENGTH_PATTERN } from '@/enum/auth'
import { useUserStore } from '@/store/modules/user'
import type { ChangePasswordForm } from '@/types/auth'

const props = withDefaults(
  defineProps<{
    visible: boolean
    title?: string
  }>(),
  {
    title: '修改密码',
  },
)

const emit = defineEmits<{
  'update:visible': [visible: boolean]
  success: []
}>()

const userStore = useUserStore()
const loading = ref(false)
const form = reactive<ChangePasswordForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

watch(
  () => props.visible,
  (visible) => {
    if (!visible) {
      form.oldPassword = ''
      form.newPassword = ''
      form.confirmPassword = ''
    }
  },
)

function closeDialog() {
  emit('update:visible', false)
}

async function handleSubmit() {
  if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
    ElMessage.warning('请完整填写密码信息')
    return
  }
  if (!PASSWORD_STRENGTH_PATTERN.test(form.newPassword)) {
    ElMessage.warning('新密码需为 8-20 位，且至少包含字母和数字')
    return
  }
  if (form.newPassword !== form.confirmPassword) {
    ElMessage.warning('两次输入的新密码不一致')
    return
  }

  loading.value = true
  try {
    await changePassword(form)
    userStore.completeFirstLoginReset()
    ElMessage.success('密码修改成功')
    emit('success')
    closeDialog()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '密码修改失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    width="460px"
    class="change-password-dialog"
    @close="closeDialog"
  >
    <el-form label-position="top" class="password-form" @submit.prevent="handleSubmit">
      <el-form-item label="当前密码">
        <el-input v-model="form.oldPassword" type="password" show-password placeholder="请输入当前密码" />
      </el-form-item>
      <el-form-item label="新密码">
        <el-input v-model="form.newPassword" type="password" show-password placeholder="请输入新密码" />
      </el-form-item>
      <el-form-item label="确认新密码">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          show-password
          placeholder="请再次输入新密码"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-actions">
        <el-button @click="closeDialog">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">确认修改</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.password-form {
  margin-top: 6px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-input__wrapper) {
  min-height: 44px;
  border-radius: 14px;
}
</style>
