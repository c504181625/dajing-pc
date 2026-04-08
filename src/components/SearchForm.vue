<script setup lang="ts">
import { computed } from 'vue'

import type { DictOption } from '@/types/business'

type SearchField = {
  label: string
  prop: string
  component?: 'input' | 'select' | 'daterange'
  placeholder?: string
  options?: DictOption[]
}

const props = defineProps<{
  modelValue: Record<string, unknown>
  fields: SearchField[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  search: []
  reset: []
}>()

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function updateField(prop: string, value: unknown) {
  model.value = {
    ...model.value,
    [prop]: value,
  }
}

function handleReset() {
  const resetValue = Object.keys(model.value).reduce<Record<string, unknown>>((result, key) => {
    result[key] = key.toLowerCase().includes('time') ? [] : ''
    return result
  }, {})

  model.value = resetValue
  emit('reset')
}
</script>

<template>
  <el-card shadow="never" class="app-card">
    <el-form inline label-width="88px">
      <el-form-item v-for="field in fields" :key="field.prop" :label="field.label">
        <el-input
          v-if="!field.component || field.component === 'input'"
          :model-value="model[field.prop] as string"
          :placeholder="field.placeholder"
          clearable
          style="width: 240px"
          @update:model-value="updateField(field.prop, $event)"
        />

        <el-select
          v-else-if="field.component === 'select'"
          :model-value="model[field.prop] as string"
          :placeholder="field.placeholder"
          clearable
          style="width: 220px"
          @update:model-value="updateField(field.prop, $event)"
        >
          <el-option
            v-for="option in field.options"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>

        <el-date-picker
          v-else
          :model-value="model[field.prop] as string[]"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @update:model-value="updateField(field.prop, $event)"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="emit('search')">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <slot name="actions" />
      </el-form-item>
    </el-form>
  </el-card>
</template>
