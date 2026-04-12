<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

import {
  getEnterpriseProfile,
  submitEnterpriseProfile,
  updateEnterpriseProfile,
} from '@/api/modules/enterprise'
import PageContainer from '@/components/PageContainer.vue'
import AttachmentPreview from '@/components-business/AttachmentPreview/index.vue'
import ChangePasswordDialog from '@/components-business/ChangePasswordDialog/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import PermissionButton from '@/components-business/PermissionButton/index.vue'
import { SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { ENTERPRISE_CAPABILITY, ENTERPRISE_CAPABILITY_LABEL_MAP } from '@/enum/role'
import { useUserStore } from '@/store/modules/user'
import type { AttachmentItem, EnterpriseProfile } from '@/types/business'

const route = useRoute()
const userStore = useUserStore()
const loading = ref(false)
const submitLoading = ref(false)
const previewVisible = ref(false)
const passwordVisible = ref(false)
const previewFiles = ref<AttachmentItem[]>([])
const form = reactive<EnterpriseProfile>({
  enterpriseId: '',
  enterpriseName: '',
  enterpriseType: '',
  socialCreditCode: '',
  legalPerson: '',
  contactName: '',
  contactPhone: '',
  email: '',
  address: '',
  intro: '',
  serviceTypes: [],
  qualificationFiles: [],
})

const enterpriseTags = computed(
  () => userStore.userInfo?.enterpriseTags || userStore.userInfo?.enterpriseCapabilities || [],
)
const isProvider = computed(() => enterpriseTags.value.includes(ENTERPRISE_CAPABILITY.serviceProvider))
const pageMode = computed(() => String(route.meta.pageMode || 'profile'))
const pageTitle = computed(() => String(route.meta.pageTitle || route.meta.title || '企业资料'))
const pageSubtitle = computed(
  () =>
    String(
      route.meta.pageSubtitle ||
        (isProvider.value
          ? '统一维护企业主体、服务范围、资质附件与认证进度，不拆分独立后台。'
          : '统一维护企业主体资料、联系人信息与基础经营信息。'),
    ),
)
const capabilityText = computed(() => {
  if (!enterpriseTags.value.length) return '-'
  return enterpriseTags.value.map((item) => ENTERPRISE_CAPABILITY_LABEL_MAP[item] || item).join(' / ')
})

const showProfileForm = computed(() => pageMode.value !== 'qualification')
const showServiceScope = computed(() => pageMode.value !== 'qualification' || isProvider.value)
const showAttachmentSection = computed(() => pageMode.value !== 'service-capability')
const actionPrimaryText = computed(() => {
  if (pageMode.value === 'qualification') return '提交认证'
  if (pageMode.value === 'service-capability') return '保存能力配置'
  return '保存信息'
})
const actionSecondaryText = computed(() => {
  if (pageMode.value === 'qualification') return '查看审核进度'
  if (pageMode.value === 'service-capability') return '提交变更审核'
  return '提交变更审核'
})

async function loadData() {
  loading.value = true
  try {
    const res = await getEnterpriseProfile()
    Object.assign(form, res)
  } finally {
    loading.value = false
  }
}

function openPreview(files: AttachmentItem[]) {
  previewFiles.value = files
  previewVisible.value = true
}

async function handleSave() {
  await updateEnterpriseProfile({ ...form })
  userStore.patchUserInfo({
    enterpriseName: form.enterpriseName,
    mobile: form.contactPhone || userStore.userInfo?.mobile,
    email: form.email,
  })
  ElMessage.success(`${actionPrimaryText.value}成功`)
}

async function handleSubmit() {
  submitLoading.value = true
  try {
    await submitEnterpriseProfile()
    ElMessage.success(`${actionSecondaryText.value}成功`)
  } finally {
    submitLoading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer :title="pageTitle" :subtitle="pageSubtitle">
    <el-row :gutter="16" v-loading="loading">
      <el-col :span="16">
        <DetailSection v-if="showProfileForm" title="基础信息">
          <el-form label-width="130px" class="profile-form">
            <el-form-item label="企业名称">
              <el-input v-model="form.enterpriseName" />
            </el-form-item>
            <el-form-item label="主体类型">
              <el-input v-model="form.enterpriseType" />
            </el-form-item>
            <el-form-item label="统一社会信用代码">
              <el-input v-model="form.socialCreditCode" disabled />
            </el-form-item>
            <el-form-item label="法定代表人">
              <el-input v-model="form.legalPerson" />
            </el-form-item>
            <el-form-item label="联系人">
              <el-input v-model="form.contactName" />
            </el-form-item>
            <el-form-item label="联系电话">
              <el-input v-model="form.contactPhone" />
            </el-form-item>
            <el-form-item label="联系邮箱">
              <el-input v-model="form.email" />
            </el-form-item>
            <el-form-item label="联系地址">
              <el-input v-model="form.address" />
            </el-form-item>
            <el-form-item v-if="showServiceScope" label="服务范围">
              <el-checkbox-group v-model="form.serviceTypes">
                <el-checkbox
                  v-for="item in SERVICE_TYPE_OPTIONS"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="主体简介">
              <el-input v-model="form.intro" type="textarea" :rows="4" />
            </el-form-item>
          </el-form>
        </DetailSection>

        <DetailSection v-if="showAttachmentSection" title="资质与附件" style="margin-top: 16px">
          <div class="attachment-actions">
            <el-button v-if="form.businessLicense" @click="openPreview([form.businessLicense])">
              查看营业执照
            </el-button>
            <el-button
              v-if="form.qualificationFiles?.length"
              @click="openPreview(form.qualificationFiles || [])"
            >
              查看资质附件
            </el-button>
          </div>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="营业执照">
              {{ form.businessLicense?.name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="资质附件数量">
              {{ form.qualificationFiles?.length || 0 }}
            </el-descriptions-item>
          </el-descriptions>
        </DetailSection>
      </el-col>

      <el-col :span="8">
        <div class="side-stack">
          <DetailSection title="主体摘要">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="企业名称">
                {{ form.enterpriseName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="企业身份标签">
                {{ capabilityText }}
              </el-descriptions-item>
              <el-descriptions-item label="最近登录">
                {{ userStore.userInfo?.lastLoginTime || '-' }}
              </el-descriptions-item>
            </el-descriptions>
          </DetailSection>

          <DetailSection title="当前登录信息" style="margin-top: 16px">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="当前账号">
                {{ userStore.userInfo?.name || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="登录手机号">
                {{ userStore.userInfo?.mobile || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="登录邮箱">
                {{ userStore.userInfo?.email || '-' }}
              </el-descriptions-item>
            </el-descriptions>
          </DetailSection>

          <DetailSection title="操作" style="margin-top: 16px">
            <div class="action-list">
              <PermissionButton permission="enterprise:profile:edit" @click="handleSave">
                {{ actionPrimaryText }}
              </PermissionButton>
              <el-button :loading="submitLoading" @click="handleSubmit">
                {{ actionSecondaryText }}
              </el-button>
              <el-button @click="passwordVisible = true">修改密码</el-button>
            </div>
          </DetailSection>
        </div>
      </el-col>
    </el-row>

    <AttachmentPreview v-model:visible="previewVisible" :files="previewFiles" />
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

.attachment-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.action-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
</style>
