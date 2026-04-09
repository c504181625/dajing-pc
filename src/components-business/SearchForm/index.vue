<script setup lang="ts">
import type { DictOption } from '@/types/business'

export interface SearchFieldItem {
  label: string
  prop: string
  component?: 'input' | 'select' | 'daterange'
  placeholder?: string
  options?: DictOption[]
}

const props = defineProps<{
  modelValue: Record<string, unknown>
  fields: SearchFieldItem[]
  inline?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, unknown>]
  search: []
  reset: []
}>()

const formModel = props.modelValue

function updateField(prop: string, value: unknown) {
  formModel[prop] = value
  emit('update:modelValue', formModel)
}

function handleReset() {
  Object.keys(formModel).forEach((key) => {
    formModel[key] = Array.isArray(formModel[key]) ? [] : ''
  })
  emit('update:modelValue', formModel)
  emit('reset')
}
</script>

<template>
  <el-card shadow="never" class="app-card search-card">
    <el-form class="search-form" label-width="88px">
      <el-form-item v-for="field in fields" :key="field.prop" :label="field.label" class="search-item">
        <el-input
          v-if="!field.component || field.component === 'input'"
          :model-value="formModel[field.prop] as string"
          :placeholder="field.placeholder"
          clearable
          class="search-control"
          @update:model-value="updateField(field.prop, $event)"
        />

        <el-select
          v-else-if="field.component === 'select'"
          :model-value="formModel[field.prop] as string"
          :placeholder="field.placeholder"
          clearable
          class="search-control"
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
          :model-value="formModel[field.prop] as string[]"
          class="search-control search-control-date"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          @update:model-value="updateField(field.prop, $event)"
        />
      </el-form-item>

      <el-form-item class="search-actions">
        <el-button type="primary" @click="emit('search')">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <slot name="actions" />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped lang="scss">
.search-card {
  overflow: visible;
}

.search-form {
  display: flex;
  align-items: flex-end;
  gap: 12px 16px;
  flex-wrap: wrap;
}

.search-item {
  margin-bottom: 0;
}

.search-actions {
  margin-bottom: 0;
}

.search-control {
  width: 240px;
}

.search-control-date {
  width: 320px;
}

@media (max-width: 1280px) {
  .search-control,
  .search-control-date {
    width: 220px;
  }
}

@media (max-width: 900px) {
  .search-form {
    align-items: stretch;
  }

  .search-item,
  .search-actions {
    width: 100%;
  }

  .search-control,
  .search-control-date {
    width: 100%;
  }
}
</style>
