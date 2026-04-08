<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <section class="page-container">
    <header class="page-header">
      <div>
        <h2>{{ title }}</h2>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      <div class="extra">
        <slot name="extra" />
      </div>
    </header>

    <div class="content">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.page-header h2 {
  margin: 0;
  font-size: 22px;
}

.page-header p {
  margin: 8px 0 0;
  color: var(--dj-color-text-regular);
  font-size: 14px;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.extra {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
