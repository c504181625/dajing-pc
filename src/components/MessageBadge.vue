<script setup lang="ts">
defineProps<{
  value: number
}>()
</script>

<template>
  <el-badge :value="value" :max="99">
    <slot />
  </el-badge>
</template>
