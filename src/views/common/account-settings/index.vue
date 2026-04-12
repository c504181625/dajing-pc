<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import PageContainer from '@/components/PageContainer.vue'
import ChangePasswordDialog from '@/components-business/ChangePasswordDialog/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import { ACCOUNT_TYPE_LABEL_MAP, ENTERPRISE_CAPABILITY_LABEL_MAP } from '@/enum/role'
import { useUserStore } from '@/store/modules/user'

const route = useRoute()
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

const pageTitle = computed(() => String(route.meta.pageTitle || route.meta.title || '账号设置'))
const pageSubtitle = computed(
  () =>
    String(
      route.meta.pageSubtitle ||
        '统一维护账号基础信息、登录联系方式与密码安全设置，减少个人端和企业端重复页面。',
    ),
)

const identityText = computed(() => {
  const user = userStore.userInfo
  if (!user) return '-'
  if (user.accountType !== 'enterprise') {
    return ACCOUNT_TYPE_LABEL_MAP[user.accountType] || user.accountType
  }

  if (!user.enterpriseTags?.length) return ACCOUNT_TYPE_LABEL_MAP[user.accountType]
  return user.enterpriseTags
    .map((item) => ENTERPRISE_CAPABILITY_LABEL_MAP[item] || item)
    .join(' / ')
})

function handleSave() {
  userStore.patchUserInfo({
    name: form.name,
    mobile: form.mobile,
    email: form.email,
  })
  ElMessage.success('账号信息已保存')
}
</script>

<template>
  <PageContainer :title="pageTitle" :subtitle="pageSubtitle">
    <el-row :gutter="18">
      <el-col :span="15">
        <DetailSection title="基础信息">
          <el-form label-width="110px" class="profile-form">
            <el-form-item label="姓名 / 联系人">
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

      <el-col :span="9">
        <div class="side-stack">
          <DetailSection title="账号摘要">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="账号主体">
                {{ ACCOUNT_TYPE_LABEL_MAP[userStore.userInfo?.accountType || 'personal'] }}
              </el-descriptions-item>
              <el-descriptions-item label="当前身份">{{ identityText }}</el-descriptions-item>
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

    <ChangePasswordDialog v-model:visible="passwordVisible" :title="`${pageTitle}密码设置`" />
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
