<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getAuthResult } from '@/api/modules/auth'
import AuthPageLayout from '@/components-business/AuthPageLayout/index.vue'
import { AUTH_RESULT_MAP, AUTH_STATUS_ENUM } from '@/enum/auth'
import type { AuthResultInfo, AuthStatus } from '@/types/auth'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const resultInfo = ref<AuthResultInfo>(AUTH_RESULT_MAP[AUTH_STATUS_ENUM.reviewing])

const resultIcon = computed(() => {
  switch (resultInfo.value.status) {
    case AUTH_STATUS_ENUM.approved:
    case AUTH_STATUS_ENUM.passwordSent:
      return 'success'
    case AUTH_STATUS_ENUM.rejected:
      return 'error'
    default:
      return 'warning'
  }
})

async function loadResult() {
  const status = route.query.status as AuthStatus | undefined
  const id = String(route.query.id || '')

  if (id) {
    loading.value = true
    try {
      resultInfo.value = await getAuthResult(id)
    } finally {
      loading.value = false
    }
    return
  }

  if (status && AUTH_RESULT_MAP[status]) {
    resultInfo.value = {
      ...AUTH_RESULT_MAP[status],
      title: String(route.query.title || AUTH_RESULT_MAP[status].title),
      description: String(route.query.description || AUTH_RESULT_MAP[status].description),
    }
    return
  }

  resultInfo.value = AUTH_RESULT_MAP[AUTH_STATUS_ENUM.reviewing]
}

watch(() => route.fullPath, loadResult, { immediate: true })

function goNext() {
  router.replace('/login')
}
</script>

<template>
  <AuthPageLayout
    title="质量创新中心平台"
    subtitle="注册、入驻、密码找回与审核流转结果统一在此展示，后续可无缝对接真实审核状态接口。"
    card-title="认证结果"
    card-description="根据当前申请或账号处理结果，查看后续建议动作。"
  >
    <template #aside>
      <div class="aside-copy">
        <div class="aside-title">结果页统一承接</div>
        <p>适用于个人注册成功、企业待审核、机构入驻、审核驳回、初始密码下发等多个场景。</p>
      </div>
    </template>

    <div v-loading="loading" class="result-panel">
      <el-result :icon="resultIcon" :title="resultInfo.title" :sub-title="resultInfo.description">
        <template #extra>
          <el-button type="primary" @click="goNext">
            {{ resultInfo.nextAction || '返回登录' }}
          </el-button>
        </template>
      </el-result>
    </div>
  </AuthPageLayout>
</template>

<style scoped lang="scss">
.aside-copy {
  padding: 22px;
  border-radius: 20px;
  background: rgb(255 255 255 / 60%);
  border: 1px solid rgb(255 255 255 / 72%);
}

.aside-title {
  font-size: 18px;
  font-weight: 700;
  color: #17233d;
}

.aside-copy p {
  margin: 10px 0 0;
  line-height: 1.8;
  color: #627493;
}

.result-panel {
  min-height: 360px;
  display: grid;
  place-items: center;
}
</style>
