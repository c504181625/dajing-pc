<script setup lang="ts">
import { ArrowDown, ArrowUp, Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { institutionApply, sendSmsCode } from '@/api/modules/auth'
import AuthSimpleLayout from '@/components-business/AuthSimpleLayout/index.vue'
import FormSectionCard from '@/components-business/FormSectionCard/index.vue'
import RegionSelect from '@/components-business/RegionSelect/index.vue'
import UploadCard from '@/components-business/UploadCard/index.vue'
import { MOBILE_PATTERN, UNIFIED_SOCIAL_CODE_PATTERN, USERNAME_PATTERN } from '@/enum/auth'
import { ServiceType } from '@/enum/status'
import type { InstitutionApplyForm, InstitutionQualificationItem } from '@/types/auth'

const router = useRouter()
const loading = ref(false)
const smsLoading = ref(false)
const countdown = ref(0)
let timer: number | null = null

const serviceTypeOptions = [
  { label: '检验检测', value: ServiceType.Inspection },
  { label: '标准化服务', value: ServiceType.Standard },
  { label: '计量', value: ServiceType.Metrology },
  { label: '认证认可', value: ServiceType.Certification },
  { label: '质量诊断', value: ServiceType.Diagnosis },
  { label: '质量培训', value: ServiceType.Training },
]

const sectionAnchors = [
  { id: 'section-intro', label: '入驻说明' },
  { id: 'section-subject', label: '机构主体信息' },
  { id: 'section-contact', label: '联系人与账号' },
  { id: 'section-business', label: '业务信息' },
  { id: 'section-attachment', label: '基础附件' },
  { id: 'section-qualification', label: '资质证书' },
]

function createQualificationItem(): InstitutionQualificationItem {
  return {
    id: `qualification-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    certificateNature: 'CMA',
    certificateLevel: 'national',
    certificateNo: '',
    remark: '',
    certificateFiles: [],
    capabilityFiles: [],
  }
}

const firstQualification = createQualificationItem()

const form = reactive<InstitutionApplyForm>({
  loginAccount: '',
  institutionName: '',
  unifiedSocialCode: '',
  registeredAddress: '',
  legalPerson: '',
  settleContactName: '',
  settleContactMobile: '',
  smsCode: '',
  contactName: '',
  contactMobile: '',
  region: [],
  nationalQualityCenter: false,
  provincialQualityCenter: false,
  serviceTypes: [],
  institutionIntro: '',
  businessScope: '',
  remark: '',
  businessLicense: [],
  qualificationCertificates: [firstQualification],
})

const expandedQualificationIds = ref<string[]>([firstQualification.id])
const canRemoveQualification = computed(() => form.qualificationCertificates.length > 1)

function isQualificationExpanded(id: string) {
  return expandedQualificationIds.value.includes(id)
}

function toggleQualification(id: string) {
  if (isQualificationExpanded(id)) {
    expandedQualificationIds.value = expandedQualificationIds.value.filter((item) => item !== id)
    return
  }
  expandedQualificationIds.value = [...expandedQualificationIds.value, id]
}

function getQualificationSummary(item: InstitutionQualificationItem, index: number) {
  const natureMap = {
    CMA: 'CMA',
    CNAS: 'CNAS',
    other: '其他性质',
  }
  const levelMap = {
    national: '国家中心',
    provincial: '省中心',
    other: '其他资质',
  }
  const serial = item.certificateNo || `待填写编号 ${index + 1}`
  return `${natureMap[item.certificateNature]} / ${levelMap[item.certificateLevel]} / ${serial}`
}

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
  if (!MOBILE_PATTERN.test(form.settleContactMobile)) {
    ElMessage.warning('请输入正确的入驻联系人手机号')
    return
  }

  smsLoading.value = true
  try {
    await sendSmsCode({
      mobile: form.settleContactMobile,
      scene: 'institution_contact_notice',
    })
    ElMessage.success('验证码已发送')
    startCountdown()
  } finally {
    smsLoading.value = false
  }
}

function addQualification() {
  const item = createQualificationItem()
  form.qualificationCertificates.push(item)
  expandedQualificationIds.value = [...expandedQualificationIds.value, item.id]
}

function removeQualification(index: number) {
  if (form.qualificationCertificates.length <= 1) {
    ElMessage.warning('至少保留一组资质证书信息')
    return
  }

  const targetId = form.qualificationCertificates[index]?.id
  form.qualificationCertificates.splice(index, 1)
  expandedQualificationIds.value = expandedQualificationIds.value.filter(
    (item) => item !== targetId,
  )
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

async function handleSubmit() {
  if (!USERNAME_PATTERN.test(form.loginAccount)) {
    ElMessage.warning('登录账户名需为 4-20 位字母、数字或下划线')
    return
  }
  if (!UNIFIED_SOCIAL_CODE_PATTERN.test(form.unifiedSocialCode)) {
    ElMessage.warning('统一社会信用代码格式不正确')
    return
  }
  if (!MOBILE_PATTERN.test(form.settleContactMobile)) {
    ElMessage.warning('请输入正确的入驻联系人手机号')
    return
  }
  if (!form.smsCode) {
    ElMessage.warning('请输入验证码')
    return
  }
  if (!MOBILE_PATTERN.test(form.contactMobile)) {
    ElMessage.warning('请输入正确的处理人手机号')
    return
  }
  if (!form.serviceTypes.length) {
    ElMessage.warning('请至少选择一个业务类型')
    return
  }
  if (!form.businessLicense.length) {
    ElMessage.warning('请上传营业执照或法人证书')
    return
  }

  const invalidQualification = form.qualificationCertificates.find(
    (item) => !item.certificateNo || !item.certificateFiles.length || !item.capabilityFiles.length,
  )
  if (invalidQualification) {
    ElMessage.warning('请完整填写资质证书信息并上传证书附件与能力附表')
    return
  }

  loading.value = true
  try {
    const res = await institutionApply(form)
    ElMessage.success('机构入驻申请已提交')
    router.replace({ path: '/auth-result', query: { id: res.id } })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '提交失败')
  } finally {
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<template>
  <AuthSimpleLayout
    title="质量创新中心平台"
    subtitle="统一身份认证与业务办理入口"
    card-title="机构 / 服务提供方入驻"
    card-description="按主体信息、联系人、业务信息、基础附件和资质证书顺序填写，审核通过后平台将向入驻联系人发放初始密码。"
    max-width="1120px"
  >
    <el-form label-position="top" class="institution-form" @submit.prevent="handleSubmit">
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

      <div id="section-intro">
        <el-alert
          type="info"
          :closable="false"
          show-icon
          title="审核通过后平台将发放初始密码，机构首次登录后需立即修改密码。"
        />
      </div>

      <div class="section-grid">
        <div id="section-subject">
          <FormSectionCard
            title="机构主体信息"
            description="先填写机构主体身份信息，方便平台完成主体核验。"
          >
            <el-row :gutter="18">
              <el-col :span="12">
                <el-form-item label="机构名称">
                  <el-input v-model="form.institutionName" placeholder="请输入机构名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="统一社会信用代码">
                  <el-input
                    v-model="form.unifiedSocialCode"
                    placeholder="请输入 18 位统一社会信用代码"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="法定代表人">
                  <el-input v-model="form.legalPerson" placeholder="请输入法定代表人" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="注册地址">
                  <el-input v-model="form.registeredAddress" placeholder="请输入注册地址" />
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

        <div id="section-contact">
          <FormSectionCard
            title="联系人与登录账号"
            description="完成入驻联系人、登录账户和验证码确认后再继续填写业务信息。"
          >
            <el-row :gutter="18">
              <el-col :span="12">
                <el-form-item label="登录账户名">
                  <el-input v-model="form.loginAccount" placeholder="请输入登录账户名" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="入驻联系人">
                  <el-input v-model="form.settleContactName" placeholder="请输入入驻联系人" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系手机号">
                  <el-input v-model="form.settleContactMobile" placeholder="请输入联系手机号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="业务咨询联系人">
                  <el-input v-model="form.contactName" placeholder="请输入业务咨询联系人" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="处理人手机号">
                  <el-input v-model="form.contactMobile" placeholder="请输入处理人手机号" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="验证码">
                  <div class="sms-row">
                    <el-input v-model="form.smsCode" placeholder="请输入验证码" />
                    <el-button
                      :loading="smsLoading"
                      :disabled="countdown > 0"
                      @click="handleSendCode"
                    >
                      {{ countdown > 0 ? `${countdown}s 后重试` : '获取验证码' }}
                    </el-button>
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </FormSectionCard>
        </div>

        <div id="section-business">
          <FormSectionCard
            title="业务信息"
            description="业务类型优先填写，中心属性放在本区最后，减少前置判断负担。"
          >
            <el-form-item label="业务类型">
              <el-checkbox-group v-model="form.serviceTypes" class="service-type-group">
                <el-checkbox
                  v-for="item in serviceTypeOptions"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="机构简介">
              <el-input
                v-model="form.institutionIntro"
                type="textarea"
                :rows="4"
                maxlength="1000"
                show-word-limit
                placeholder="请输入机构简介"
              />
            </el-form-item>

            <el-form-item label="业务范围">
              <el-input
                v-model="form.businessScope"
                type="textarea"
                :rows="4"
                maxlength="500"
                show-word-limit
                placeholder="请输入业务范围"
              />
            </el-form-item>

            <el-form-item label="备注说明">
              <el-input
                v-model="form.remark"
                type="textarea"
                :rows="4"
                maxlength="500"
                show-word-limit
                placeholder="请输入备注说明"
              />
            </el-form-item>

            <el-row :gutter="18">
              <el-col :span="12">
                <el-form-item label="国家质检中心">
                  <el-radio-group v-model="form.nationalQualityCenter">
                    <el-radio :value="true">是</el-radio>
                    <el-radio :value="false">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="省级质检中心">
                  <el-radio-group v-model="form.provincialQualityCenter">
                    <el-radio :value="true">是</el-radio>
                    <el-radio :value="false">否</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
          </FormSectionCard>
        </div>

        <div id="section-attachment">
          <FormSectionCard
            title="基础附件"
            description="先上传营业执照、法人证书等基础材料，便于平台快速进入审核。"
          >
            <UploadCard
              v-model="form.businessLicense"
              title="营业执照 / 法人证书等基础材料"
              tip="支持 JPG、PNG、PDF，建议上传清晰原件扫描件"
            />
          </FormSectionCard>
        </div>

        <div id="section-qualification">
          <FormSectionCard
            title="资质证书"
            description="首张证书默认展开，其余卡片可折叠，减少纵向浏览压力。"
          >
            <div class="qualification-list">
              <article
                v-for="(item, index) in form.qualificationCertificates"
                :key="item.id"
                class="qualification-card"
                :class="{ collapsed: !isQualificationExpanded(item.id) }"
              >
                <div class="qualification-card__head" @click="toggleQualification(item.id)">
                  <div class="qualification-card__head-main">
                    <div class="qualification-card__title">资质证书 {{ index + 1 }}</div>
                    <div class="qualification-card__summary">
                      {{ getQualificationSummary(item, index) }}
                    </div>
                  </div>
                  <div class="qualification-card__actions">
                    <el-button
                      v-if="canRemoveQualification"
                      type="danger"
                      text
                      :icon="Delete"
                      @click.stop="removeQualification(index)"
                    >
                      删除
                    </el-button>
                    <span class="toggle-trigger">
                      <el-icon class="toggle-icon">
                        <ArrowUp v-if="isQualificationExpanded(item.id)" />
                        <ArrowDown v-else />
                      </el-icon>
                    </span>
                  </div>
                </div>

                <div v-show="isQualificationExpanded(item.id)" class="qualification-card__body">
                  <el-row :gutter="18">
                    <el-col :span="12">
                      <el-form-item label="证书性质">
                        <el-radio-group v-model="item.certificateNature">
                          <el-radio value="CMA">CMA</el-radio>
                          <el-radio value="CNAS">CNAS</el-radio>
                          <el-radio value="other">其他</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="证书资质">
                        <el-radio-group v-model="item.certificateLevel">
                          <el-radio value="national">国家中心</el-radio>
                          <el-radio value="provincial">省中心</el-radio>
                          <el-radio value="other">其他</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </el-col>
                    <el-col :span="24">
                      <el-form-item label="资质证书编号">
                        <el-input v-model="item.certificateNo" placeholder="请输入资质证书编号" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="24">
                      <el-form-item label="备注说明">
                        <el-input
                          v-model="item.remark"
                          type="textarea"
                          :rows="3"
                          maxlength="500"
                          show-word-limit
                          placeholder="请输入备注说明"
                        />
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <div class="qualification-upload-grid">
                    <UploadCard
                      v-model="item.certificateFiles"
                      title="资质证书"
                      tip="请上传小于 2MB 的图片或 PDF"
                      :limit="2"
                    />
                    <UploadCard
                      v-model="item.capabilityFiles"
                      title="能力附表"
                      tip="请上传小于 4MB 的图片或 PDF"
                      :limit="3"
                    />
                  </div>
                </div>
              </article>
            </div>

            <div class="qualification-action">
              <el-button :icon="Plus" plain @click="addQualification">新增资质证书</el-button>
            </div>
          </FormSectionCard>
        </div>
      </div>

      <div class="action-row">
        <el-button class="submit-button" type="primary" :loading="loading" @click="handleSubmit">
          提交机构入驻申请
        </el-button>
        <el-link type="primary" underline="never" @click="router.push('/login?subject=enterprise')"
          >返回登录</el-link
        >
      </div>
    </el-form>
  </AuthSimpleLayout>
</template>

<style scoped lang="scss">
.institution-form {
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
  border-radius: 999px;
  border: 1px solid transparent;
  background: #ffffff;
  color: #3d5b92;
  font-size: 14px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.anchor-nav__item:hover {
  border-color: #bcd2ff;
  color: var(--dj-color-primary);
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
  gap: 12px;
}

.sms-row :deep(.el-button) {
  width: 100%;
  height: 46px;
  border-radius: 14px;
  border-color: rgb(31 94 255 / 16%);
  background: linear-gradient(180deg, #f7faff 0%, #eef4ff 100%);
  color: var(--dj-color-primary);
  font-weight: 600;
}

.sms-row :deep(.el-button.is-disabled) {
  color: #8ba0c5;
  border-color: rgb(148 163 184 / 24%);
  background: #f7f9fc;
}

.sms-row :deep(.el-button:hover) {
  border-color: rgb(31 94 255 / 24%);
  background: linear-gradient(180deg, #fff 0%, #f4f8ff 100%);
  color: #1f5eff;
}

.service-type-group {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px 14px;
}

.qualification-list {
  display: grid;
  gap: 14px;
}

.qualification-card {
  border: 1px solid rgb(31 94 255 / 10%);
  border-radius: 18px;
  background: linear-gradient(180deg, #fff 0%, #f9fbff 100%);
  overflow: hidden;
}

.qualification-card__head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 18px 20px;
  background: linear-gradient(180deg, #f8fbff 0%, #f2f6ff 100%);
  border-bottom: 1px solid rgb(31 94 255 / 8%);
  cursor: pointer;
  text-align: left;
}

.qualification-card.collapsed .qualification-card__head {
  border-bottom-color: transparent;
}

.qualification-card__head-main {
  min-width: 0;
  flex: 1;
}

.qualification-card__title {
  font-size: 17px;
  font-weight: 700;
  color: #1a2945;
}

.qualification-card__summary {
  margin-top: 6px;
  font-size: 13px;
  color: #6b7d9a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qualification-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.toggle-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(36, 87, 214, 0.08);
}

.toggle-icon {
  font-size: 16px;
  color: #2457d6;
}

.qualification-card__body {
  padding: 18px 18px;
  border-top: 1px solid rgb(15 23 42 / 6%);
}

.qualification-upload-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.qualification-action {
  margin-top: 8px;
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

  .sms-row,
  .service-type-group,
  .qualification-upload-grid {
    grid-template-columns: 1fr;
  }

  .qualification-card__head {
    flex-direction: column;
    align-items: flex-start;
  }

  .qualification-card__summary {
    white-space: normal;
  }

  .qualification-card__actions {
    width: 100%;
    justify-content: space-between;
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
