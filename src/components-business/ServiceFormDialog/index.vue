<script setup lang="ts">
import { computed, reactive, watch } from 'vue'

import { SERVICE_TYPE_OPTIONS } from '@/constants/dicts'
import { ServiceType } from '@/enum/status'
import type { ServiceForm } from '@/types/business'

const props = withDefaults(
  defineProps<{
    visible: boolean
    title?: string
    form?: Partial<ServiceForm>
  }>(),
  {
    title: '服务信息',
    form: () => ({}),
  },
)

const emit = defineEmits<{
  'update:visible': [value: boolean]
  submit: [value: ServiceForm]
}>()

const localVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

const formState = reactive<ServiceForm>({
  serviceName: '',
  serviceCode: '',
  serviceType: ServiceType.Standard,
  categoryCode: '',
  specification: '',
  targetCustomer: '',
  contactName: '',
  contactPhone: '',
  priceText: '',
  description: '',
})

watch(
  () => props.form,
  (value) => {
    Object.assign(formState, {
      serviceName: '',
      serviceCode: '',
      serviceType: ServiceType.Standard,
      categoryCode: '',
      specification: '',
      targetCustomer: '',
      contactName: '',
      contactPhone: '',
      priceText: '',
      description: '',
      ...value,
    })
  },
  { immediate: true, deep: true },
)

function handleSubmit() {
  emit('submit', { ...formState })
}
</script>

<template>
  <el-dialog v-model="localVisible" :title="title" width="680px">
    <el-form label-width="110px">
      <el-form-item label="服务编码">
        <el-input v-model="formState.serviceCode" />
      </el-form-item>
      <el-form-item label="服务名称">
        <el-input v-model="formState.serviceName" />
      </el-form-item>
      <el-form-item label="服务类型">
        <el-select v-model="formState.serviceType" style="width: 100%">
          <el-option v-for="item in SERVICE_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="类别编码">
        <el-input v-model="formState.categoryCode" />
      </el-form-item>
      <el-form-item label="服务规范">
        <el-input v-model="formState.specification" />
      </el-form-item>
      <el-form-item label="适用客户">
        <el-input v-model="formState.targetCustomer" />
      </el-form-item>
      <el-form-item label="联系人">
        <el-input v-model="formState.contactName" />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="formState.contactPhone" />
      </el-form-item>
      <el-form-item label="价格说明">
        <el-input v-model="formState.priceText" />
      </el-form-item>
      <el-form-item label="服务描述">
        <el-input v-model="formState.description" type="textarea" :rows="4" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="localVisible = false">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>
