<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'

import PageContainer from '@/components/PageContainer.vue'
import ChangePasswordDialog from '@/components-business/ChangePasswordDialog/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import { PLATFORM_ROLE_LABEL_MAP } from '@/enum/role'
import { useUserStore } from '@/store/modules/user'

const userStore = useUserStore()
const passwordVisible = ref(false)

const form = reactive({
  name: '',
  mobile: '',
  email: '',
  deptName: '',
})

watch(
  () => userStore.userInfo,
  (user) => {
    form.name = user?.name || ''
    form.mobile = user?.mobile || ''
    form.email = user?.email || ''
    form.deptName = user?.deptName || ''
  },
  { immediate: true },
)

const currentRoleLabel = computed(() => {
  const role = userStore.userInfo?.platformRole
  return role ? PLATFORM_ROLE_LABEL_MAP[role] || role : '-'
})

function handleSave() {
  userStore.patchUserInfo({
    name: form.name,
    mobile: form.mobile,
    email: form.email,
    deptName: form.deptName,
  })
  ElMessage.success('运营方信息已保存')
}
</script>

<template>
  <PageContainer title="运营方信息" subtitle="查看并维护当前运营账号资料、平台角色与登录安全信息。">
    <el-row :gutter="16">
      <el-col :span="16">
        <DetailSection title="账号资料">
          <el-form label-width="120px" class="profile-form">
            <el-form-item label="姓名">
              <el-input v-model="form.name" />
            </el-form-item>
            <el-form-item label="手机号">
              <el-input v-model="form.mobile" />
            </el-form-item>
            <el-form-item label="邮箱">
              <el-input v-model="form.email" />
            </el-form-item>
            <el-form-item label="所属部门">
              <el-input v-model="form.deptName" />
            </el-form-item>
          </el-form>
        </DetailSection>
      </el-col>

      <el-col :span="8">
        <div class="side-stack">
          <DetailSection title="角色与权限">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="平台角色">{{ currentRoleLabel }}</el-descriptions-item>
              <el-descriptions-item label="权限数量">
                {{ userStore.userInfo?.permissionCodes?.length || 0 }}
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

    <ChangePasswordDialog v-model:visible="passwordVisible" title="修改运营方密码" />
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
