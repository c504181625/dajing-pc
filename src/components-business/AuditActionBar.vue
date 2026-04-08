<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  loading?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  approve: [remark: string]
  reject: [remark: string]
  supplement: [remark: string]
}>()

const remark = ref('')
</script>

<template>
  <el-card shadow="never" class="app-card">
    <template #header>
      <span>审核操作</span>
    </template>

    <el-form label-position="top">
      <el-form-item label="审核意见">
        <el-input
          v-model="remark"
          type="textarea"
          :rows="4"
          maxlength="200"
          show-word-limit
          placeholder="请输入审核意见或补充材料要求"
        />
      </el-form-item>
    </el-form>

    <div class="actions">
      <el-button :loading="props.loading" :disabled="props.disabled" @click="emit('supplement', remark)">
        要求补充材料
      </el-button>
      <el-button
        type="danger"
        plain
        :loading="props.loading"
        :disabled="props.disabled"
        @click="emit('reject', remark)"
      >
        驳回
      </el-button>
      <el-button
        type="primary"
        :loading="props.loading"
        :disabled="props.disabled"
        @click="emit('approve', remark)"
      >
        审核通过
      </el-button>
    </div>
  </el-card>
</template>

<style scoped lang="scss">
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
