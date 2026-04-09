<script setup lang="ts">
import { computed, useSlots } from 'vue'

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

const slots = useSlots()
const hasExtra = computed(() => !!slots.extra)
</script>

<template>
  <section class="page-container">
    <div v-if="hasExtra" class="page-toolbar">
      <slot name="extra" />
    </div>

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
