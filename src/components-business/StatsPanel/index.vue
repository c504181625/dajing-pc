<script setup lang="ts">
import SectionCard from '@/components-business/SectionCard/index.vue'

export interface StatsPanelItem {
  title?: string
  value?: string | number
  hint?: string
}

defineProps<{
  items: StatsPanelItem[]
}>()
</script>

<template>
  <div class="stats-grid">
    <SectionCard v-for="item in items" :key="item.title">
      <div class="stat-card">
        <div class="stat-title">{{ item.title || '--' }}</div>
        <div class="stat-value">{{ item.value ?? 0 }}</div>
        <div v-if="item.hint" class="stat-hint">{{ item.hint }}</div>
      </div>
    </SectionCard>
  </div>
</template>

<style scoped lang="scss">
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.stat-card {
  display: flex;
  min-height: 100px;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
}

.stat-title {
  font-size: 14px;
  color: var(--dj-color-text-regular);
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
  color: var(--dj-color-text-primary);
}

.stat-hint {
  font-size: 13px;
  line-height: 1.7;
  color: var(--dj-color-text-secondary);
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    min-height: auto;
  }
}
</style>
