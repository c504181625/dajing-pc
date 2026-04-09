<script setup lang="ts">
import type { EnterpriseQualification } from '@/types/business'

defineProps<{
  qualifications: EnterpriseQualification[]
}>()
</script>

<template>
  <el-card shadow="never" class="app-card">
    <template #header>
      <span>资质证书</span>
    </template>

    <el-empty v-if="!qualifications.length" description="暂无资质信息" />

    <div v-else class="qualification-list">
      <div v-for="qualification in qualifications" :key="qualification.id" class="qualification-item">
        <div>
          <div class="name">{{ qualification.name }}</div>
          <div class="number">证书编号：{{ qualification.number }}</div>
        </div>
        <div class="meta">
          <el-tag :type="qualification.status === 'valid' ? 'success' : qualification.status === 'expiring' ? 'warning' : 'danger'">
            {{ qualification.status === 'valid' ? '有效' : qualification.status === 'expiring' ? '即将到期' : '已过期' }}
          </el-tag>
          <span>有效期至 {{ qualification.validUntil }}</span>
        </div>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.qualification-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.qualification-item {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border: 1px solid var(--dj-color-border);
  border-radius: 10px;
}

.name {
  font-weight: 600;
}

.number,
.meta span {
  font-size: 13px;
  color: var(--dj-color-text-regular);
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
