<script setup lang="ts">
defineProps<{
  value: number
}>()
</script>

<template>
  <el-badge :value="value" :hidden="value <= 0" :max="99">
    <slot />
  </el-badge>
</template>
