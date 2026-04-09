<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    placeholder?: string
  }>(),
  {
    placeholder: '请选择省市区',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const regionOptions = [
  {
    value: '四川省',
    label: '四川省',
    children: [
      {
        value: '成都市',
        label: '成都市',
        children: [
          { value: '高新区', label: '高新区' },
          { value: '锦江区', label: '锦江区' },
          { value: '武侯区', label: '武侯区' },
        ],
      },
      {
        value: '绵阳市',
        label: '绵阳市',
        children: [{ value: '涪城区', label: '涪城区' }],
      },
    ],
  },
  {
    value: '江苏省',
    label: '江苏省',
    children: [
      {
        value: '苏州市',
        label: '苏州市',
        children: [
          { value: '工业园区', label: '工业园区' },
          { value: '高新区', label: '高新区' },
        ],
      },
    ],
  },
  {
    value: '浙江省',
    label: '浙江省',
    children: [
      {
        value: '杭州市',
        label: '杭州市',
        children: [
          { value: '上城区', label: '上城区' },
          { value: '滨江区', label: '滨江区' },
        ],
      },
      {
        value: '宁波市',
        label: '宁波市',
        children: [{ value: '高新区', label: '高新区' }],
      },
    ],
  },
  {
    value: '上海市',
    label: '上海市',
    children: [
      {
        value: '上海市',
        label: '上海市',
        children: [
          { value: '闵行区', label: '闵行区' },
          { value: '浦东新区', label: '浦东新区' },
        ],
      },
    ],
  },
]

const innerValue = computed({
  get: () => props.modelValue || [],
  set: (value: string[]) => emit('update:modelValue', value),
})
</script>

<template>
  <el-cascader
    v-model="innerValue"
    :options="regionOptions"
    :props="{ checkStrictly: false }"
    :placeholder="placeholder"
    clearable
    class="region-select"
  />
</template>

<style scoped>
.region-select {
  width: 100%;
}
</style>
