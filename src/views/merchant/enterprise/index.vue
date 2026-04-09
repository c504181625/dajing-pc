<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, reactive, ref } from 'vue'

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
import { ACCOUNT_TYPE, ENTERPRISE_CAPABILITY_LABEL_MAP } from '@/enum/role'
import { useUserStore } from '@/store/modules/user'
import type { AttachmentItem, EnterpriseProfile } from '@/types/business'

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

const isInstitution = computed(() => userStore.userInfo?.accountType === ACCOUNT_TYPE.institution)
const capabilityText = computed(() => {
  const capabilities = userStore.userInfo?.enterpriseCapabilities || []
  if (!capabilities.length) return '-'
  return capabilities.map((item) => ENTERPRISE_CAPABILITY_LABEL_MAP[item] || item).join(' / ')
})

const pageTitle = computed(() => (isInstitution.value ? '机构信息管理' : '企业信息管理'))
const pageSubtitle = computed(() =>
  isInstitution.value
    ? '维护当前机构主体资料、服务范围、资质附件与账号安全信息。'
    : '维护当前企业主体资料、服务范围、资质附件与账号安全信息。',
)
const summaryTitle = computed(() => (isInstitution.value ? '机构摘要' : '企业摘要'))
const attachmentTitle = computed(() => (isInstitution.value ? '资质与附件' : '附件资料'))

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
  ElMessage.success(isInstitution.value ? '机构信息已保存' : '企业信息已保存')
}

async function handleSubmit() {
  submitLoading.value = true
  try {
    await submitEnterpriseProfile()
    ElMessage.success('已提交变更审核')
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
        <DetailSection title="基础信息">
          <el-form label-width="130px" class="profile-form">
            <el-form-item :label="isInstitution ? '机构名称' : '企业名称'">
              <el-input v-model="form.enterpriseName" />
            </el-form-item>
            <el-form-item :label="isInstitution ? '主体类型' : '企业类型'">
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
            <el-form-item label="服务范围">
              <el-checkbox-group v-model="form.serviceTypes">
                <el-checkbox
                  v-for="item in SERVICE_TYPE_OPTIONS"
                  :key="item.value"
                  :label="item.value"
                >
                  {{ item.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item :label="isInstitution ? '机构简介' : '企业简介'">
              <el-input v-model="form.intro" type="textarea" :rows="4" />
            </el-form-item>
          </el-form>
        </DetailSection>
      </el-col>

      <el-col :span="8">
        <div class="side-stack">
          <DetailSection :title="summaryTitle">
            <el-descriptions :column="1" border>
              <el-descriptions-item :label="isInstitution ? '机构名称' : '企业名称'">
                {{ form.enterpriseName || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="业务身份">{{ capabilityText }}</el-descriptions-item>
              <el-descriptions-item label="登录主体">
                {{ isInstitution ? '机构主体' : '企业主体' }}
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

          <DetailSection :title="attachmentTitle" style="margin-top: 16px">
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

          <DetailSection title="操作" style="margin-top: 16px">
            <div class="action-list">
              <PermissionButton permission="enterprise:profile:edit" @click="handleSave">
                保存信息
              </PermissionButton>
              <el-button :loading="submitLoading" @click="handleSubmit">提交变更审核</el-button>
              <el-button @click="passwordVisible = true">修改密码</el-button>
            </div>
          </DetailSection>
        </div>
      </el-col>
    </el-row>

    <AttachmentPreview v-model:visible="previewVisible" :files="previewFiles" />
    <ChangePasswordDialog
      v-model:visible="passwordVisible"
      :title="isInstitution ? '修改机构账号密码' : '修改企业账号密码'"
    />
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
