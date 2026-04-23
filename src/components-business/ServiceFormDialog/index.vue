<script setup lang="ts">
import { Delete, Picture, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, reactive, ref, watch } from 'vue'
import type {
  FormInstance,
  FormRules,
  UploadProps,
  UploadRawFile,
  UploadRequestOptions,
} from 'element-plus'

import { uploadGeneralFile } from '@/api/modules/file'
import { SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { ServiceShelfStatus, ServiceType } from '@/enum/status'
import type { ServiceForm } from '@/types/business'

const props = withDefaults(
  defineProps<{
    visible: boolean
    title?: string
    form?: Partial<ServiceForm>
    previewStatus?: ServiceShelfStatus
  }>(),
  {
    title: '服务信息',
    form: () => ({}),
    previewStatus: ServiceShelfStatus.Disabled,
  },
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [value: ServiceForm, publishAfterSave: boolean]
}>()

const formRef = ref<FormInstance>()
const coverUploading = ref(false)

const localVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

function buildEmptyForm(): ServiceForm {
  return {
    serviceName: '',
    serviceCode: '',
    inspectionItemId: '',
    institutionId: '',
    serviceType: ServiceType.Inspection,
    categoryCode: '',
    categoryName: '',
    specification: '',
    sampleType: '',
    defaultStd: '',
    targetCustomer: '',
    contactName: '',
    contactPhone: '',
    priceText: '',
    price: undefined,
    cycleDays: undefined,
    supportCma: false,
    supportCnas: false,
    supportUrgent: false,
    urgentExtraFee: undefined,
    description: '',
    coverUrl: '',
    sort: 0,
  }
}

function parsePriceFromText(text?: string) {
  const matched = String(text || '').match(/\d+(?:\.\d+)?/)
  const value = matched ? Number(matched[0]) : NaN
  return Number.isFinite(value) ? value : undefined
}

function parseCycleDaysFromText(text?: string) {
  const matched = String(text || '').match(/(\d+)\s*天/)
  const value = matched ? Number(matched[1]) : NaN
  return Number.isFinite(value) ? value : undefined
}

function formatMoney(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '--'
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, '')
}

function buildPriceText(payload: Partial<ServiceForm>) {
  const segments = [
    typeof payload.price === 'number' ? `￥${formatMoney(payload.price)}` : '',
    typeof payload.cycleDays === 'number' ? `${payload.cycleDays}天` : '',
    payload.supportUrgent
      ? typeof payload.urgentExtraFee === 'number' && payload.urgentExtraFee > 0
        ? `加急 +￥${formatMoney(payload.urgentExtraFee)}`
        : '支持加急'
      : '',
  ].filter(Boolean)

  return segments.join(' / ')
}

function normalizeIncomingForm(value?: Partial<ServiceForm>): ServiceForm {
  const form = buildEmptyForm()
  const next = {
    ...form,
    ...value,
  }

  next.inspectionItemId = String(value?.inspectionItemId || value?.serviceCode || '')
  next.serviceCode = String(value?.serviceCode || value?.inspectionItemId || '')
  next.sampleType = String(value?.sampleType || value?.targetCustomer || '')
  next.defaultStd = String(value?.defaultStd || value?.specification || '')
  next.targetCustomer = next.sampleType
  next.specification = next.defaultStd
  next.price =
    typeof value?.price === 'number'
      ? value.price
      : parsePriceFromText(String(value?.priceText || ''))
  next.cycleDays =
    typeof value?.cycleDays === 'number'
      ? value.cycleDays
      : parseCycleDaysFromText(String(value?.priceText || ''))
  next.supportCma = Boolean(value?.supportCma)
  next.supportCnas = Boolean(value?.supportCnas)
  next.supportUrgent = Boolean(value?.supportUrgent)
  next.priceText = buildPriceText(next)

  return next
}

const formState = reactive<ServiceForm>(buildEmptyForm())

watch(
  () => props.form,
  (value) => {
    Object.assign(formState, normalizeIncomingForm(value))
  },
  { immediate: true, deep: true },
)

watch(
  () => [formState.price, formState.cycleDays, formState.supportUrgent, formState.urgentExtraFee],
  () => {
    formState.priceText = buildPriceText(formState)
  },
)

const rules: FormRules<ServiceForm> = {
  serviceName: [{ required: true, message: '请输入服务名称', trigger: 'blur' }],
  categoryCode: [{ required: true, message: '请输入服务分类', trigger: 'blur' }],
  sampleType: [{ required: true, message: '请输入样品类型', trigger: 'blur' }],
  price: [{ required: true, message: '请输入参考价格', trigger: 'change' }],
  cycleDays: [{ required: true, message: '请输入检测周期', trigger: 'change' }],
}

const previewStatusLabel = computed(() =>
  props.previewStatus === ServiceShelfStatus.Enabled
    ? '已上架'
    : props.previewStatus === ServiceShelfStatus.Reviewing
      ? '审核中'
      : '未上架',
)

const previewPrice = computed(() =>
  typeof formState.price === 'number' ? `￥${formatMoney(formState.price)}` : '￥--',
)

const previewCycleLabel = computed(() =>
  typeof formState.cycleDays === 'number' ? `${formState.cycleDays} 天` : '-- 天',
)

const previewHighlights = computed(() =>
  [
    formState.supportCma ? '支持 CMA' : '',
    formState.supportCnas ? '支持 CNAS' : '',
    formState.supportUrgent ? '支持加急' : '',
  ].filter(Boolean),
)

const previewMetrics = computed(() => [
  { label: '已选购', value: '--' },
  { label: '浏览量', value: '--' },
  {
    label: '最近更新',
    value: typeof formState.sort === 'number' ? `排序 ${formState.sort}` : '近期',
  },
])

const previewRequirements = computed(() => [
  { label: '样品类型', value: formState.sampleType || '按沟通确认' },
  { label: '默认标准', value: formState.defaultStd || '按项目适配' },
  { label: '检测周期', value: previewCycleLabel.value },
])

function beforeCoverUpload(file: UploadRawFile) {
  const isImage = /^image\/(png|jpe?g|webp)$/i.test(file.type)
  if (!isImage) {
    ElMessage.error('封面仅支持 JPG、PNG、WebP 图片')
    return false
  }

  const isLt5Mb = file.size / 1024 / 1024 <= 5
  if (!isLt5Mb) {
    ElMessage.error('封面图片不能超过 5MB')
    return false
  }

  return true
}

const uploadCover: UploadProps['httpRequest'] = async (options: UploadRequestOptions) => {
  coverUploading.value = true
  try {
    const uploaded = await uploadGeneralFile(options.file as File, 'service')
    formState.coverUrl = uploaded.url
    ElMessage.success('封面图已上传')
    options.onSuccess?.(uploaded)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '封面图上传失败')
    options.onError?.(error as any)
  } finally {
    coverUploading.value = false
  }
}

function removeCover() {
  formState.coverUrl = ''
}

function buildSubmitPayload(): ServiceForm {
  const inspectionItemId = String(formState.inspectionItemId || formState.serviceCode || '').trim()
  const institutionId = String(formState.institutionId || '').trim()
  const sampleType = formState.sampleType || formState.targetCustomer || ''
  const defaultStd = formState.defaultStd || formState.specification || ''

  return {
    ...formState,
    inspectionItemId: inspectionItemId || undefined,
    serviceCode: inspectionItemId || undefined,
    institutionId: institutionId || undefined,
    sampleType,
    defaultStd,
    targetCustomer: sampleType,
    specification: defaultStd,
    priceText: buildPriceText(formState),
    supportCma: Boolean(formState.supportCma),
    supportCnas: Boolean(formState.supportCnas),
    supportUrgent: Boolean(formState.supportUrgent),
  }
}

async function handleSubmit(publishAfterSave: boolean) {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  emit('submit', buildSubmitPayload(), publishAfterSave)
}
</script>

<template>
  <el-dialog
    v-model="localVisible"
    :title="title"
    width="1280px"
    top="4vh"
    class="service-form-dialog"
    destroy-on-close
  >
    <div class="dialog-layout">
      <div class="dialog-layout__form">
        <el-form
          ref="formRef"
          :model="formState"
          :rules="rules"
          label-position="top"
          class="service-form"
        >
          <section class="form-section">
            <div class="form-section__title">基础信息</div>
            <div class="form-grid form-grid--double">
              <el-form-item label="服务名称" prop="serviceName">
                <el-input
                  v-model="formState.serviceName"
                  placeholder="例如：电子元器件可靠性检测"
                />
              </el-form-item>
              <el-form-item label="服务类型">
                <el-select v-model="formState.serviceType" style="width: 100%">
                  <el-option
                    v-for="item in SERVICE_TYPE_OPTIONS"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
              <el-form-item label="服务分类" prop="categoryCode">
                <el-input
                  v-model="formState.categoryCode"
                  placeholder="例如：环境检测 / 力学性能"
                />
              </el-form-item>
              <el-form-item label="样品类型" prop="sampleType">
                <el-input
                  v-model="formState.sampleType"
                  placeholder="例如：电子元器件 / 金属材料"
                />
              </el-form-item>
              <el-form-item label="默认标准">
                <el-input v-model="formState.defaultStd" placeholder="例如：GB/T 2423.1-2008" />
              </el-form-item>
            </div>
          </section>

          <section class="form-section">
            <div class="form-section__title">价格与交付</div>
            <div class="form-grid form-grid--triple">
              <el-form-item label="参考价格" prop="price">
                <el-input-number
                  v-model="formState.price"
                  :min="0.01"
                  :precision="2"
                  :step="100"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="检测周期（天）" prop="cycleDays">
                <el-input-number
                  v-model="formState.cycleDays"
                  :min="1"
                  :step="1"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
              <el-form-item label="排序值">
                <el-input-number
                  v-model="formState.sort"
                  :min="0"
                  :step="1"
                  controls-position="right"
                  style="width: 100%"
                />
              </el-form-item>
            </div>

            <div class="capability-panel">
              <div class="capability-switches">
                <el-switch v-model="formState.supportCma" active-text="支持 CMA 报告" />
                <el-switch v-model="formState.supportCnas" active-text="支持 CNAS 报告" />
                <el-switch v-model="formState.supportUrgent" active-text="支持加急" />
              </div>
              <el-form-item v-if="formState.supportUrgent" label="加急附加费">
                <el-input-number
                  v-model="formState.urgentExtraFee"
                  :min="0"
                  :precision="2"
                  :step="100"
                  controls-position="right"
                  style="width: 220px"
                />
              </el-form-item>
            </div>
          </section>

          <section class="form-section">
            <div class="form-section__title">封面与介绍</div>
            <div class="cover-editor">
              <div class="cover-uploader">
                <div v-if="formState.coverUrl" class="cover-uploader__preview">
                  <img :src="formState.coverUrl" alt="服务封面" />
                </div>
                <div v-else class="cover-uploader__empty">
                  <el-icon><Picture /></el-icon>
                  <span>上传封面图</span>
                </div>

                <div class="cover-uploader__actions">
                  <el-upload
                    :show-file-list="false"
                    :before-upload="beforeCoverUpload"
                    :http-request="uploadCover"
                    accept=".png,.jpg,.jpeg,.webp"
                  >
                    <el-button type="primary" :loading="coverUploading">
                      <el-icon><Plus /></el-icon>
                      {{ formState.coverUrl ? '更换封面' : '上传封面' }}
                    </el-button>
                  </el-upload>
                  <el-button v-if="formState.coverUrl" @click="removeCover">
                    <el-icon><Delete /></el-icon>
                    移除
                  </el-button>
                </div>
              </div>

              <div class="cover-meta">
                <el-form-item label="封面图 URL">
                  <el-input
                    v-model="formState.coverUrl"
                    placeholder="也可以直接粘贴已上传的图片 URL"
                  />
                </el-form-item>
                <el-form-item label="服务简介">
                  <el-input
                    v-model="formState.description"
                    type="textarea"
                    :rows="6"
                    placeholder="介绍服务能力、交付内容、适用场景和审核背书。"
                  />
                </el-form-item>
              </div>
            </div>
          </section>
        </el-form>
      </div>

      <aside class="dialog-layout__preview">
        <div class="preview-panel">
          <div class="preview-panel__header">
            <div>
              <div class="preview-panel__eyebrow">上架效果预览</div>
              <div class="preview-panel__title">PC 服务详情页</div>
            </div>
            <div class="preview-status">{{ previewStatusLabel }}</div>
          </div>

          <div class="preview-shell">
            <div class="preview-hero">
              <div class="preview-hero__media">
                <img v-if="formState.coverUrl" :src="formState.coverUrl" alt="服务封面预览" />
                <div v-else class="preview-hero__empty">
                  <el-icon><Picture /></el-icon>
                  <span>暂无服务图片</span>
                </div>
              </div>
              <!-- <div class="preview-hero__thumbs">
                <button type="button" class="thumb is-active">
                  <img v-if="formState.coverUrl" :src="formState.coverUrl" alt="" />
                  <el-icon v-else><Picture /></el-icon>
                </button>
                <button type="button" class="thumb">
                  <el-icon><Picture /></el-icon>
                </button>
                <button type="button" class="thumb">
                  <el-icon><Picture /></el-icon>
                </button>
              </div> -->
            </div>

            <div class="preview-content">
              <div class="preview-summary">
                <div class="preview-summary__main">
                  <h3>{{ formState.serviceName || '服务详情' }}</h3>
                  <p class="preview-summary__sub">
                    {{ formState.categoryCode || '未分类' }} · 检测周期 {{ previewCycleLabel }}
                  </p>
                  <div class="preview-tags">
                    <span class="preview-tag preview-tag--primary">平台保障服务</span>
                    <span v-for="item in previewHighlights" :key="item" class="preview-tag">
                      {{ item }}
                    </span>
                  </div>
                </div>
                <div class="preview-summary__price">
                  <div class="preview-summary__label">参考价格</div>
                  <div class="preview-summary__value">{{ previewPrice }}</div>
                </div>
              </div>

              <div class="preview-metrics">
                <div v-for="item in previewMetrics" :key="item.label" class="preview-metric">
                  <strong>{{ item.value }}</strong>
                  <span>{{ item.label }}</span>
                </div>
              </div>

              <div class="preview-card">
                <div class="preview-card__title">服务简介</div>
                <p>
                  {{
                    formState.description ||
                    '该服务已通过平台审核，支持标准化委托流程。提交需求后，机构将根据样品情况反馈执行计划与交付时间。'
                  }}
                </p>
              </div>

              <div class="preview-card">
                <div class="preview-card__title">服务要求</div>
                <div class="preview-requirements">
                  <div
                    v-for="item in previewRequirements"
                    :key="item.label"
                    class="preview-requirement"
                  >
                    <span>{{ item.label }}</span>
                    <strong>{{ item.value }}</strong>
                  </div>
                </div>
              </div>

              <div class="preview-actions">
                <button type="button" class="preview-actions__secondary">咨询机构</button>
                <button type="button" class="preview-actions__primary">立即下单</button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="localVisible = false">取消</el-button>
        <el-button @click="handleSubmit(false)">仅保存</el-button>
        <el-button type="primary" @click="handleSubmit(true)">保存并上架</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.dialog-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(360px, 0.85fr);
  gap: 24px;
  min-height: 72vh;
}

.dialog-layout__form,
.dialog-layout__preview {
  min-width: 0;
}

.service-form {
  display: grid;
  gap: 18px;
}

.form-section {
  padding: 20px;
  border: 1px solid #dbe6f4;
  border-radius: 22px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.form-section__title {
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 700;
  color: #1f2a44;
}

.form-grid {
  display: grid;
  gap: 16px;
}

.form-grid--double {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-grid--triple {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.capability-panel {
  display: grid;
  gap: 14px;
  margin-top: 4px;
  padding: 16px;
  border-radius: 18px;
  background: #f3f7fd;
}

.capability-switches {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}

.cover-editor {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 18px;
}

.cover-uploader {
  display: grid;
  gap: 12px;
}

.cover-uploader__preview,
.cover-uploader__empty {
  width: 100%;
  aspect-ratio: 4 / 3;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #d9e6f7;
  background: linear-gradient(180deg, #eef4ff 0%, #f8fbff 100%);
}

.cover-uploader__preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-uploader__empty {
  display: grid;
  place-items: center;
  gap: 10px;
  color: #8da0bd;
  font-size: 14px;
}

.cover-uploader__empty .el-icon {
  font-size: 34px;
}

.cover-uploader__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.preview-panel {
  height: 100%;
  padding: 22px;
  border-radius: 28px;
  background:
    radial-gradient(circle at top right, rgba(38, 101, 255, 0.14), transparent 28%),
    linear-gradient(180deg, #eef4ff 0%, #f8fbff 100%);
  border: 1px solid rgba(31, 94, 255, 0.12);
}

.preview-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.preview-panel__eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #5f7cb1;
}

.preview-panel__title {
  margin-top: 6px;
  font-size: 20px;
  font-weight: 700;
  color: #15233e;
}

.preview-status {
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(38, 101, 255, 0.1);
  color: #2665ff;
  font-size: 13px;
  font-weight: 600;
}

.preview-shell {
  display: grid;
  gap: 16px;
}

.preview-hero {
  display: grid;
  gap: 12px;
}

.preview-hero__media {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border-radius: 24px;
  background: #edf2fb;
  border: 1px solid #dce7f8;
}

.preview-hero__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-hero__empty {
  height: 100%;
  display: grid;
  place-items: center;
  gap: 10px;
  color: #8c9fbc;
}

.preview-hero__empty .el-icon {
  font-size: 36px;
}

.preview-hero__thumbs {
  display: flex;
  gap: 10px;
}

.thumb {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  border: 1px solid #d8e3f5;
  background: #fff;
  color: #96a7c1;
  overflow: hidden;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb.is-active {
  border-color: #2665ff;
  box-shadow: 0 0 0 3px rgba(38, 101, 255, 0.12);
}

.preview-content {
  display: grid;
  gap: 14px;
}

.preview-summary {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16px;
  padding: 20px;
  border-radius: 24px;
  background: #fff;
  border: 1px solid #dce6f5;
}

.preview-summary__main h3 {
  margin: 0;
  font-size: 28px;
  line-height: 1.2;
  color: #16233c;
}

.preview-summary__sub {
  margin: 10px 0 0;
  color: #60779e;
  font-size: 14px;
}

.preview-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.preview-tag {
  padding: 6px 10px;
  border-radius: 999px;
  background: #edf2fb;
  color: #47648f;
  font-size: 12px;
  font-weight: 600;
}

.preview-tag--primary {
  background: rgba(38, 101, 255, 0.1);
  color: #2665ff;
}

.preview-summary__price {
  min-width: 150px;
  padding: 14px 16px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f9fbff 0%, #eff5ff 100%);
  text-align: right;
}

.preview-summary__label {
  color: #7386a3;
  font-size: 12px;
}

.preview-summary__value {
  margin-top: 8px;
  color: #ff7a00;
  font-size: 30px;
  font-weight: 700;
}

.preview-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.preview-metric {
  padding: 18px 14px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid #dce6f5;
  text-align: center;
}

.preview-metric strong {
  display: block;
  color: #15233e;
  font-size: 20px;
}

.preview-metric span {
  display: block;
  margin-top: 8px;
  color: #7788a4;
  font-size: 13px;
}

.preview-card {
  padding: 18px 20px;
  border-radius: 22px;
  background: #fff;
  border: 1px solid #dce6f5;
}

.preview-card__title {
  margin-bottom: 12px;
  font-size: 18px;
  font-weight: 700;
  color: #16233c;
}

.preview-card p {
  margin: 0;
  color: #4c607f;
  line-height: 1.8;
}

.preview-requirements {
  display: grid;
  gap: 10px;
}

.preview-requirement {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #f8fbff;
}

.preview-requirement span {
  color: #7186a6;
  font-size: 13px;
}

.preview-requirement strong {
  color: #16233c;
  font-size: 14px;
}

.preview-actions {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 12px;
}

.preview-actions button {
  height: 48px;
  border-radius: 16px;
  border: 0;
  font-size: 15px;
  font-weight: 600;
}

.preview-actions__secondary {
  background: #ffffff;
  border: 1px solid #cad7ea !important;
  color: #273a59;
}

.preview-actions__primary {
  background: linear-gradient(135deg, #2665ff 0%, #3d7dff 100%);
  color: #fff;
  box-shadow: 0 14px 28px rgba(38, 101, 255, 0.18);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 1200px) {
  .dialog-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .dialog-layout__preview {
    order: -1;
  }
}

@media (max-width: 768px) {
  .form-grid--double,
  .form-grid--triple,
  .cover-editor,
  .preview-summary,
  .preview-metrics,
  .preview-actions {
    grid-template-columns: minmax(0, 1fr);
  }

  .capability-switches {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
