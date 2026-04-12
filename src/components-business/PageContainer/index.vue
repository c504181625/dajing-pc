<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    subtitle?: string
    compactHeader?: boolean
  }>(),
  {
    title: '',
    subtitle: '',
    compactHeader: false,
  },
)
</script>

<template>
  <section class="page-container">
    <div class="page-content">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.page-container {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.page-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

.page-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
</style>
