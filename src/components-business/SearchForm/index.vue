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
const initialModel = Object.fromEntries(
  Object.entries(props.modelValue).map(([key, value]) => [
    key,
    Array.isArray(value) ? [...value] : value,
  ]),
)

function updateField(prop: string, value: unknown) {
  formModel[prop] = value
  emit('update:modelValue', formModel)
}

function handleReset() {
  Object.keys(formModel).forEach((key) => {
    const initialValue = initialModel[key]
    formModel[key] = Array.isArray(initialValue) ? [...initialValue] : initialValue
  })
  emit('update:modelValue', formModel)
  emit('reset')
}
</script>

<template>
  <el-card shadow="never" class="app-card search-card">
    <el-form class="search-form" label-position="left">
      <el-form-item v-for="field in fields" :key="field.prop" class="search-item">
        <template #label>
          <span class="search-label">{{ field.label }}：</span>
        </template>

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
  gap: 10px 12px;
  flex-wrap: wrap;
}

.search-item,
.search-actions {
  margin-bottom: 0;
}

.search-item {
  flex: 0 1 auto;
}

.search-item :deep(.el-form-item__label) {
  padding-right: 6px;
  justify-content: flex-start;
  color: var(--dj-color-text-regular);
  line-height: 32px;
}

.search-item :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.search-label {
  text-align: left;
  white-space: nowrap;
}

.search-actions {
  margin-left: auto;
}

.search-actions :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: nowrap;
}

.search-control {
  width: 176px;
}

.search-control-date {
  width: 236px;
}

@media (max-width: 1280px) {
  .search-control,
  .search-control-date {
    width: 168px;
  }
}

@media (max-width: 900px) {
  .search-form {
    align-items: stretch;
  }

  .search-item,
  .search-actions {
    width: 100%;
    margin-left: 0;
  }

  .search-item :deep(.el-form-item__content),
  .search-actions :deep(.el-form-item__content) {
    flex-wrap: wrap;
  }

  .search-control,
  .search-control-date {
    width: 100%;
  }
}
</style>
