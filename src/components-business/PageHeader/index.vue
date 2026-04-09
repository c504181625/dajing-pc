<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
    compact?: boolean
  }>(),
  {
    description: '',
    compact: false,
  },
)
</script>

<template>
  <header class="page-header" :class="{ compact }">
    <div class="page-copy">
      <h2 class="title">{{ title }}</h2>
      <p v-if="description" class="description">{{ description }}</p>
    </div>
    <div class="extra">
      <slot name="extra" />
    </div>
  </header>
</template>

<style scoped lang="scss">
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-header.compact {
  align-items: center;
}

.page-copy {
  min-width: 0;
}

.title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.3;
  color: var(--dj-color-text-primary);
}

.compact .title {
  font-size: 20px;
}

.description {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.6;
  color: var(--dj-color-text-regular);
}

.extra {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
