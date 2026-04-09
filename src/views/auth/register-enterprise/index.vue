<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { enterpriseRegister, sendSmsCode } from '@/api/modules/auth'
import AuthSimpleLayout from '@/components-business/AuthSimpleLayout/index.vue'
import FormSectionCard from '@/components-business/FormSectionCard/index.vue'
import RegionSelect from '@/components-business/RegionSelect/index.vue'
import UploadCard from '@/components-business/UploadCard/index.vue'
import { MOBILE_PATTERN, UNIFIED_SOCIAL_CODE_PATTERN, USERNAME_PATTERN } from '@/enum/auth'
import type { EnterpriseRegisterForm } from '@/types/auth'

const router = useRouter()
const loading = ref(false)
const smsLoading = ref(false)
const countdown = ref(0)
let timer: number | null = null

const sectionAnchors = [
  { id: 'section-account', label: '账号与联系人' },
  { id: 'section-enterprise', label: '企业主体信息' },
  { id: 'section-intro', label: '企业介绍' },
  { id: 'section-attachment', label: '附件上传' },
]

const form = reactive<EnterpriseRegisterForm>({
  username: '',
  mobile: '',
  smsCode: '',
  enterpriseName: '',
  unifiedSocialCode: '',
  registeredAddress: '',
  contactName: '',
  region: [],
  enterpriseIntro: '',
  businessScope: '',
  remark: '',
  businessLicense: [],
})

function startCountdown() {
  countdown.value = 60
  if (timer) window.clearInterval(timer)
  timer = window.setInterval(() => {
    countdown.value -= 1
    if (countdown.value <= 0 && timer) {
      window.clearInterval(timer)
      timer = null
    }
  }, 1000)
}

async function handleSendCode() {
  if (!MOBILE_PATTERN.test(form.mobile)) {
    ElMessage.warning('请输入正确的注册联系人手机号')
    return
  }

  smsLoading.value = true
  try {
    await sendSmsCode({
      mobile: form.mobile,
      scene: 'enterprise_contact_notice',
    })
    ElMessage.success('验证码已发送')
    startCountdown()
  } finally {
    smsLoading.value = false
  }
}

async function handleSubmit() {
  if (!USERNAME_PATTERN.test(form.username)) {
    ElMessage.warning('用户名需为 4-20 位字母、数字或下划线')
    return
  }
  if (!MOBILE_PATTERN.test(form.mobile)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  if (!form.smsCode) {
    ElMessage.warning('请输入验证码')
    return
  }
  if (!UNIFIED_SOCIAL_CODE_PATTERN.test(form.unifiedSocialCode)) {
    ElMessage.warning('统一社会信用代码格式不正确')
    return
  }
  if (!form.businessLicense.length) {
    ElMessage.warning('请上传营业执照')
    return
  }

  loading.value = true
  try {
    const res = await enterpriseRegister(form)
    ElMessage.success('企业注册资料已提交')
    router.replace({ path: '/auth-result', query: { id: res.id } })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '提交失败')
  } finally {
    loading.value = false
  }
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <AuthSimpleLayout
    title="质量创新中心平台"
    subtitle="统一身份认证与业务办理入口"
    card-title="企业注册"
    card-description="企业注册阶段不设置密码，请按分区完整提交账号信息、企业主体信息、企业介绍与营业执照。"
    max-width="1120px"
  >
    <el-form label-position="top" class="enterprise-form" @submit.prevent="handleSubmit">
      <div class="anchor-nav">
        <button
          v-for="item in sectionAnchors"
          :key="item.id"
          type="button"
          class="anchor-nav__item"
          @click="scrollToSection(item.id)"
        >
          {{ item.label }}
        </button>
      </div>

      <div class="section-grid">
        <div id="section-account">
          <FormSectionCard title="账号与联系人信息" description="用于平台审核通知与后续登录联系。">
            <el-row :gutter="18">
              <el-col :span="12">
                <el-form-item label="用户名">
                  <el-input v-model="form.username" placeholder="请输入用户名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="企业联系人">
                  <el-input v-model="form.contactName" placeholder="请输入企业联系人" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="手机号">
                  <el-input v-model="form.mobile" placeholder="请输入注册联系人手机号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="验证码">
                  <div class="sms-row">
                    <el-input v-model="form.smsCode" placeholder="请输入验证码" />
                    <el-button :loading="smsLoading" :disabled="countdown > 0" @click="handleSendCode">
                      {{ countdown > 0 ? `${countdown}s 后重试` : '获取验证码' }}
                    </el-button>
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="行政区划">
                  <RegionSelect v-model="form.region" />
                </el-form-item>
              </el-col>
            </el-row>
          </FormSectionCard>
        </div>

        <div id="section-enterprise">
          <FormSectionCard title="企业主体信息" description="用于核验企业主体身份与注册信息。">
            <el-row :gutter="18">
              <el-col :span="12">
                <el-form-item label="企业名称">
                  <el-input v-model="form.enterpriseName" placeholder="请输入企业名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="统一社会信用代码">
                  <el-input v-model="form.unifiedSocialCode" placeholder="请输入统一社会信用代码" />
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item label="注册地址">
                  <el-input v-model="form.registeredAddress" placeholder="请输入注册地址" />
                </el-form-item>
              </el-col>
            </el-row>
          </FormSectionCard>
        </div>

        <div id="section-intro">
          <FormSectionCard title="企业介绍" description="用于平台了解企业概况、业务能力与备注信息。">
            <el-form-item label="企业简介">
              <el-input v-model="form.enterpriseIntro" type="textarea" :rows="4" placeholder="请输入企业简介" />
            </el-form-item>
            <el-form-item label="企业业务范围">
              <el-input v-model="form.businessScope" type="textarea" :rows="4" placeholder="请输入企业业务范围" />
            </el-form-item>
            <el-form-item label="备注">
              <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="选填" />
            </el-form-item>
          </FormSectionCard>
        </div>

        <div id="section-attachment">
          <FormSectionCard title="附件上传" description="支持图片或 PDF，审核通过后平台将向联系人手机号发送初始密码提醒。">
            <UploadCard
              v-model="form.businessLicense"
              title="营业执照"
              tip="支持 JPG、PNG、PDF，最多上传 1 个文件"
            />
          </FormSectionCard>
        </div>
      </div>

      <el-alert
        class="tips-alert"
        type="info"
        :closable="false"
        show-icon
        title="企业注册阶段不设置密码，审核通过后平台将生成初始密码并发送至注册联系人手机号。"
      />

      <div class="action-row">
        <el-button class="submit-button" type="primary" :loading="loading" @click="handleSubmit">
          提交企业注册
        </el-button>
        <el-link type="primary" underline="never" @click="router.push('/login?subject=enterprise')">返回登录</el-link>
      </div>
    </el-form>
  </AuthSimpleLayout>
</template>

<style scoped lang="scss">
.enterprise-form {
  display: grid;
  gap: 18px;
}

.anchor-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px;
  border: 1px solid #dbe8ff;
  border-radius: 16px;
  background: linear-gradient(180deg, #f8fbff 0%, #f1f6ff 100%);
}

.anchor-nav__item {
  height: 36px;
  padding: 0 18px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: #ffffff;
  color: #3d5b92;
  font-size: 14px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.anchor-nav__item:hover {
  border-color: #bcd2ff;
  color: #2457d6;
  box-shadow: 0 8px 18px rgba(36, 87, 214, 0.08);
}

.section-grid {
  display: grid;
  gap: 18px;
}

.sms-row {
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 136px;
  align-items: stretch;
  gap: 12px;
}

.sms-row :deep(.el-input) {
  width: 100%;
}

.sms-row :deep(.el-input__wrapper) {
  width: 100%;
  min-height: 46px;
}

.sms-row :deep(.el-button) {
  width: 100%;
  height: 46px;
  margin: 0;
  justify-self: stretch;
  align-self: stretch;
  border-radius: 14px;
  border-color: rgb(31 94 255 / 16%);
  background: linear-gradient(180deg, #f7faff 0%, #eef4ff 100%);
  color: var(--dj-color-primary);
  font-weight: 600;
}

.sms-row :deep(.el-button:hover) {
  border-color: rgb(31 94 255 / 24%);
  background: linear-gradient(180deg, #fff 0%, #f4f8ff 100%);
  color: #1f5eff;
}

.sms-row :deep(.el-button.is-disabled) {
  color: #8ba0c5;
  border-color: rgb(148 163 184 / 24%);
  background: #f7f9fc;
}

.tips-alert {
  margin-top: 2px;
}

.action-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.submit-button {
  min-width: 220px;
  height: 46px;
  border-radius: 14px;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  border-radius: 14px;
}

:deep(.el-input__wrapper) {
  min-height: 46px;
  box-shadow: 0 0 0 1px rgb(31 94 255 / 10%) inset;
}

@media (max-width: 768px) {
  .anchor-nav {
    gap: 8px;
  }

  .anchor-nav__item {
    width: 100%;
  }

  .sms-row {
    grid-template-columns: 1fr;
  }

  .action-row {
    flex-direction: column;
    align-items: stretch;
  }

  .submit-button {
    width: 100%;
  }
}
</style>
