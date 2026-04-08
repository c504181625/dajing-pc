<script setup lang="ts">
import { computed } from 'vue'

import { usePermission } from '@/hooks/usePermission'

const props = withDefaults(
  defineProps<{
    permission: string | string[]
    type?: '' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
    text?: boolean
    plain?: boolean
    size?: 'large' | 'default' | 'small'
    disabled?: boolean
  }>(),
  {
    type: 'primary',
    text: false,
    plain: false,
    size: 'default',
    disabled: false,
  },
)

const emit = defineEmits<{
  click: []
}>()

const { hasPermission } = usePermission()
const visible = computed(() => hasPermission(props.permission))
</script>

<template>
  <el-button
    v-if="visible"
    :type="type"
    :text="text"
    :plain="plain"
    :size="size"
    :disabled="disabled"
    @click="emit('click')"
  >
    <slot />
  </el-button>
</template>
