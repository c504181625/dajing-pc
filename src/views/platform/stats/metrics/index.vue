<script setup lang="ts">
import { ref } from 'vue'

import { getKeyMetrics } from '@/api/modules/stats'
import PageContainer from '@/components/PageContainer.vue'
import type { KeyMetricItem } from '@/types/business'

const loading = ref(false)
const metrics = ref<KeyMetricItem[]>([])

async function loadData() {
  loading.value = true
  try {
    metrics.value = await getKeyMetrics()
  } finally {
    loading.value = false
  }
}

loadData()
</script>

<template>
  <PageContainer title="关键指标统计" subtitle="一期只展示关键指标卡片，不做复杂大屏。">
    <div class="metric-grid" v-loading="loading">
      <el-card v-for="item in metrics" :key="item.key" shadow="never" class="metric-card app-card">
        <div class="metric-label">{{ item.label }}</div>
        <div class="metric-value">{{ item.value }}<small v-if="item.unit">{{ item.unit }}</small></div>
        <div class="metric-hint">{{ item.hint }}</div>
      </el-card>
    </div>
  </PageContainer>
</template>

<style scoped>
.metric-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.metric-label {
  color: var(--dj-color-text-secondary);
}

.metric-value {
  margin-top: 12px;
  font-size: 30px;
  font-weight: 700;
}

.metric-value small {
  margin-left: 4px;
  font-size: 14px;
  font-weight: 400;
}

.metric-hint {
  margin-top: 8px;
  color: var(--dj-color-text-regular);
  font-size: 13px;
}
</style>
