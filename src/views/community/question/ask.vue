<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getContentCategories, saveCommunityQuestion } from '@/api/modules/content'
import PageContainer from '@/components/PageContainer.vue'
import ActionPanel from '@/components-business/ActionPanel/index.vue'
import DetailSection from '@/components-business/DetailSection/index.vue'
import { QuestionSolveStatus } from '@/enum/content'
import type { ContentCategoryItem, ContentQuestionForm } from '@/types/content'

const route = useRoute()
const router = useRouter()

const categories = ref<ContentCategoryItem[]>([])
const saving = ref(false)

const form = reactive<ContentQuestionForm>({
  title: '',
  summary: route.query.expert ? `希望向专家“${String(route.query.expert)}”进一步咨询：` : '',
  categoryCode: '',
  solveStatus: QuestionSolveStatus.Open,
  featured: false,
})

const questionCategoryOptions = computed(() =>
  categories.value.filter((item) => item.bizType === 'question'),
)

async function loadCategories() {
  categories.value = await getContentCategories()
  const firstCategory = questionCategoryOptions.value[0]
  if (!form.categoryCode && firstCategory) {
    form.categoryCode = firstCategory.code
  }
}

async function handleSubmit() {
  if (!form.title.trim() || !form.summary.trim() || !form.categoryCode) {
    ElMessage.warning('请完整填写问题标题、分类和问题描述')
    return
  }

  saving.value = true
  try {
    await saveCommunityQuestion(form)
    ElMessage.success('提问已提交')
    router.push('/community/qa')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  void loadCategories()
})
</script>

<template>
  <PageContainer>
    <el-row :gutter="16">
      <el-col :span="16">
        <DetailSection title="发布问题" description="前台用户可以从社区问答或专家页直接发起问题。">
          <el-form label-position="top">
            <el-form-item label="问题标题">
              <el-input
                v-model="form.title"
                maxlength="80"
                show-word-limit
                placeholder="请输入你想咨询的问题标题"
              />
            </el-form-item>
            <el-form-item label="问题分类">
              <el-select v-model="form.categoryCode" style="width: 100%" placeholder="请选择问题分类">
                <el-option
                  v-for="item in questionCategoryOptions"
                  :key="item.code"
                  :label="item.name"
                  :value="item.code"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="问题描述">
              <el-input
                v-model="form.summary"
                type="textarea"
                :rows="8"
                maxlength="1000"
                show-word-limit
                placeholder="请描述问题背景、诉求和你希望获得的帮助"
              />
            </el-form-item>
          </el-form>
        </DetailSection>
      </el-col>

      <el-col :span="8">
        <ActionPanel>
          <el-button
            type="primary"
            :loading="saving"
            class="action-panel-button action-panel-button--primary"
            @click="handleSubmit"
          >
            提交问题
          </el-button>
          <el-button
            class="action-panel-button action-panel-button--soft"
            @click="router.push('/community/qa')"
          >
            返回问答
          </el-button>
        </ActionPanel>
      </el-col>
    </el-row>
  </PageContainer>
</template>
