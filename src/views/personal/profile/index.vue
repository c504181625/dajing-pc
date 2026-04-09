<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { reactive, ref, watch } from 'vue'

import PageContainer from '@/components/PageContainer.vue'
import ChangePasswordDialog from '@/components-business/ChangePasswordDialog/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import { ACCOUNT_TYPE_LABEL_MAP } from '@/enum/role'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const passwordVisible = ref(false)

const form = reactive({
  name: '',
  mobile: '',
  email: '',
})

watch(
  () => userStore.userInfo,
  (user) => {
    form.name = user?.name || ''
    form.mobile = user?.mobile || ''
    form.email = user?.email || ''
  },
  { immediate: true },
)

function handleSave() {
  userStore.patchUserInfo({
    name: form.name,
    mobile: form.mobile,
    email: form.email,
  })
  ElMessage.success('个人信息已保存')
}
</script>

<template>
  <PageContainer title="个人信息" subtitle="维护个人账号资料、联系方式和登录安全信息。">
    <el-row :gutter="16">
      <el-col :span="16">
        <DetailSection title="基础信息">
          <el-form label-width="120px" class="profile-form">
            <el-form-item label="用户名称">
              <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="form.mobile" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="form.email" />
            </el-form-item>
          </el-form>
        </DetailSection>
      </el-col>

      <el-col :span="8">
        <div class="side-stack">
          <DetailSection title="账号摘要">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="账号主体">
                {{ ACCOUNT_TYPE_LABEL_MAP[userStore.userInfo?.accountType || 'personal'] }}
              </el-descriptions-item>
              <el-descriptions-item label="登录账号">
                {{ userStore.userInfo?.name || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="最近登录">
                {{ userStore.userInfo?.lastLoginTime || '-' }}
              </el-descriptions-item>
            </el-descriptions>
          </DetailSection>

          <DetailSection title="操作" style="margin-top: 16px">
            <div class="action-list">
              <el-button type="primary" @click="handleSave">保存信息</el-button>
              <el-button @click="passwordVisible = true">修改密码</el-button>
            </div>
          </DetailSection>
        </div>
      </el-col>
    </el-row>

    <ChangePasswordDialog v-model:visible="passwordVisible" title="修改个人密码" />
  </PageContainer>
</template>

<style scoped>
.profile-form {
  max-width: 760px;
}

.side-stack {
  position: sticky;
  top: 0;
}

.action-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
