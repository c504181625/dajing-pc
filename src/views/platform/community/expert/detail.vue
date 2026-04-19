<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getCommunityExpertDetail, saveCommunityExpert } from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import SectionCard from '@/components-business/SectionCard/index.vue'
import { ExpertServiceStatus } from '@/enum/content'
import type { ContentExpertForm, ExpertOnlineItem } from '@/types/content'

const route = useRoute()
const router = useRouter()

const detail = ref<ExpertOnlineItem | null>(null)
const saving = ref(false)
const isEditing = ref(false)
const specialtyText = ref('')

const isCreate = computed(() => String(route.params.id) === 'create')

const form = reactive<ContentExpertForm>({
  name: '',
  title: '',
  organization: '',
  specialties: [],
  serviceStatus: ExpertServiceStatus.Online,
  introduction: '',
  consultationPriceText: '',
  onlineTimeText: '',
})

const serviceStatusLabelMap: Record<string, string> = {
  [ExpertServiceStatus.Online]: '在线',
  [ExpertServiceStatus.Busy]: '忙碌',
  [ExpertServiceStatus.Offline]: '离线',
}

const pageTitle = computed(() => {
  if (isCreate.value) return '新增专家'
  return isEditing.value ? '编辑专家' : '专家详情'
})

const specialties = computed(() =>
  specialtyText.value
    .split(/[、,]/)
    .map((item) => item.trim())
    .filter(Boolean),
)

const previewSections = computed(() => [
  {
    title: '咨询安排',
    content: form.consultationPriceText || '当前未配置咨询价格或响应说明。',
  },
  {
    title: '在线时段',
    content: form.onlineTimeText || '当前未配置在线时段。',
  },
  {
    title: '服务方向',
    content: specialties.value.length
      ? `当前重点展示 ${specialties.value.join(' / ')} 等擅长领域。`
      : '当前未配置专家擅长领域。',
  },
])

function syncForm(source: ExpertOnlineItem) {
  form.name = source.name
  form.title = source.title
  form.organization = source.organization
  form.specialties = [...source.specialties]
  form.serviceStatus = source.serviceStatus
  form.introduction = source.introduction
  form.consultationPriceText = source.consultationPriceText || ''
  form.onlineTimeText = source.onlineTimeText || ''
  specialtyText.value = source.specialties.join(' / ')
}

async function loadDetail() {
  if (isCreate.value) {
    detail.value = null
    form.name = ''
    form.title = ''
    form.organization = ''
    form.specialties = []
    form.serviceStatus = ExpertServiceStatus.Online
    form.introduction = ''
    form.consultationPriceText = ''
    form.onlineTimeText = ''
    specialtyText.value = ''
    isEditing.value = true
    return
  }

  detail.value = await getCommunityExpertDetail(String(route.params.id))
  syncForm(detail.value)
  isEditing.value = route.query.mode === 'edit'
}

function handleBackList() {
  router.push('/operator/business/community-home?tab=experts')
}

function openPreview() {
  if (!isCreate.value) {
    router.push(`/operator/business/community/preview/experts/${String(route.params.id)}`)
  }
}

function startEdit() {
  isEditing.value = true
  void router.replace({ path: route.path, query: { mode: 'edit' } })
}

async function cancelEdit() {
  if (isCreate.value) {
    handleBackList()
    return
  }

  if (detail.value) syncForm(detail.value)
  isEditing.value = false
  await router.replace({ path: route.path })
}

async function handleSave() {
  saving.value = true
  try {
    const saved = await saveCommunityExpert({
      id: isCreate.value ? undefined : String(route.params.id),
      name: form.name.trim(),
      title: form.title.trim(),
      organization: form.organization.trim(),
      specialties: specialties.value,
      serviceStatus: form.serviceStatus,
      introduction: form.introduction.trim(),
      consultationPriceText: form.consultationPriceText?.trim(),
      onlineTimeText: form.onlineTimeText?.trim(),
    })
    if (!saved) {
      ElMessage.warning('最新接口仅提供专家新增，暂不支持已有专家信息编辑')
      return
    }

    ElMessage.success(isCreate.value ? '专家已新增' : '专家信息已保存')

    if (isCreate.value) {
      router.push('/operator/business/community-home?tab=experts')
      return
    }

    await loadDetail()
    await router.replace({ path: route.path })
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void loadDetail()
})
</script>

<template>
  <PageContainer :title="pageTitle">
    <template #extra>
      <el-button @click="handleBackList">返回列表</el-button>
    </template>

    <div class="detail-stack">
      <SectionCard title="专家资料">
        <el-form label-position="top">
          <div class="edit-grid">
            <el-form-item label="专家姓名">
              <el-input v-model="form.name" :disabled="!isEditing" />
            </el-form-item>
            <el-form-item label="职称">
              <el-input v-model="form.title" :disabled="!isEditing" />
            </el-form-item>
            <el-form-item label="所属机构">
              <el-input v-model="form.organization" :disabled="!isEditing" />
            </el-form-item>
            <el-form-item label="服务状态">
              <el-radio-group v-model="form.serviceStatus" :disabled="!isEditing">
                <el-radio :value="ExpertServiceStatus.Online">在线</el-radio>
                <el-radio :value="ExpertServiceStatus.Busy">忙碌</el-radio>
                <el-radio :value="ExpertServiceStatus.Offline">离线</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="擅长领域" class="edit-grid-span-2">
              <el-input
                v-model="specialtyText"
                :disabled="!isEditing"
                placeholder="多个领域请用 、 / , 分隔"
              />
            </el-form-item>
            <el-form-item label="咨询说明">
              <el-input v-model="form.consultationPriceText" :disabled="!isEditing" />
            </el-form-item>
            <el-form-item label="在线时段">
              <el-input v-model="form.onlineTimeText" :disabled="!isEditing" />
            </el-form-item>
            <el-form-item label="专家简介" class="edit-grid-span-2">
              <el-input
                v-model="form.introduction"
                :disabled="!isEditing"
                type="textarea"
                :rows="5"
              />
            </el-form-item>
          </div>
        </el-form>
      </SectionCard>

      <SectionCard title="操作区">
        <div class="top-layout">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="页面模式">{{ pageTitle }}</el-descriptions-item>
            <el-descriptions-item label="服务状态">
              {{ serviceStatusLabelMap[form.serviceStatus] || form.serviceStatus }}
            </el-descriptions-item>
            <el-descriptions-item label="发布时间">
              {{ detail?.publishTime || '保存后生成' }}
            </el-descriptions-item>
            <el-descriptions-item label="擅长领域数">
              {{ specialties.length }}
            </el-descriptions-item>
          </el-descriptions>

          <div class="action-stack">
            <el-button
              v-if="!isEditing"
              type="primary"
              class="action-button action-button--primary"
              @click="startEdit"
            >
              编辑专家
            </el-button>
            <el-button
              v-if="isEditing"
              type="primary"
              class="action-button action-button--primary"
              :loading="saving"
              @click="handleSave"
            >
              {{ isCreate ? '保存新增' : '保存修改' }}
            </el-button>
            <el-button
              v-if="isEditing"
              class="action-button action-button--soft"
              @click="cancelEdit"
            >
              {{ isCreate ? '取消新增' : '取消编辑' }}
            </el-button>
            <el-button
              v-if="!isCreate"
              class="action-button action-button--soft"
              @click="openPreview"
            >
              预览内容
            </el-button>
            <el-button class="action-button action-button--muted" @click="handleBackList">
              返回列表
            </el-button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="页面预览">
        <div class="expert-preview">
          <section class="expert-hero">
            <div>
              <div class="expert-name">{{ form.name || '专家姓名' }}</div>
              <div class="expert-title">
                {{ form.title || '专家职称' }} / {{ form.organization || '所属机构' }}
              </div>
            </div>
            <el-tag effect="light">
              {{ serviceStatusLabelMap[form.serviceStatus] || form.serviceStatus }}
            </el-tag>
          </section>

          <div class="specialties">
            <el-tag
              v-for="item in specialties.length ? specialties : ['专家擅长']"
              :key="item"
              effect="plain"
            >
              {{ item }}
            </el-tag>
          </div>

          <p class="expert-intro">
            {{ form.introduction || '这里展示专家简介、服务方向与咨询背景。' }}
          </p>

          <div class="expert-grid">
            <SectionCard v-for="item in previewSections" :key="item.title" :title="item.title">
              <p class="expert-copy">{{ item.content }}</p>
            </SectionCard>
          </div>
        </div>
      </SectionCard>
    </div>
  </PageContainer>
</template>

<style scoped lang="scss">
.detail-stack {
  display: grid;
  gap: 16px;
}

.top-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
}

.action-stack {
  display: grid;
  gap: 12px;
  align-content: start;
}

.action-button {
  width: 100%;
  height: 42px;
  margin: 0;
  border-radius: 12px;
}

.action-button--primary {
  background: linear-gradient(180deg, #5ca2ff 0%, #3f8ff5 100%);
  border-color: transparent;
}

.action-button--soft {
  border-color: rgb(84 135 255 / 24%);
  background: linear-gradient(180deg, #f8fbff 0%, #edf4ff 100%);
  color: var(--dj-color-primary);
}

.action-button--muted {
  border-color: rgb(84 135 255 / 18%);
  background: #fff;
  color: var(--dj-color-text-primary);
}

.edit-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.edit-grid-span-2 {
  grid-column: span 2;
}

.expert-preview {
  display: grid;
  gap: 18px;
}

.expert-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 24px;
  border: 1px solid var(--dj-color-border);
  border-radius: 20px;
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
}

.expert-name {
  font-size: 28px;
  font-weight: 700;
}

.expert-title {
  margin-top: 10px;
  color: var(--dj-color-text-regular);
}

.specialties {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.expert-intro {
  margin: 0;
  line-height: 1.9;
  color: var(--dj-color-text-regular);
}

.expert-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.expert-copy {
  margin: 0;
  line-height: 1.85;
  color: var(--dj-color-text-regular);
}

@media (max-width: 900px) {
  .top-layout,
  .edit-grid,
  .expert-grid {
    grid-template-columns: 1fr;
  }

  .edit-grid-span-2 {
    grid-column: span 1;
  }

  .expert-hero {
    flex-direction: column;
  }
}
</style>
