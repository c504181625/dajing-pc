<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
    bodyClass?: string
  }>(),
  {
    title: '',
    description: '',
    bodyClass: '',
  },
)
</script>

<template>
  <el-card shadow="never" class="app-card section-card">
    <template v-if="title || $slots.header || $slots.extra" #header>
      <div class="section-header">
        <div class="section-copy">
          <slot name="header">
            <div class="section-title">{{ title }}</div>
          </slot>
        </div>
        <div class="section-extra">
          <slot name="extra" />
        </div>
      </div>
    </template>

    <div class="section-body" :class="bodyClass">
      <slot />
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.section-card {
  overflow: visible;
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.section-copy {
  min-width: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--dj-color-text-primary);
}

.section-extra {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
