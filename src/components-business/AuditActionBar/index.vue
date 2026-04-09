<script setup lang="ts">
import { ref } from 'vue'

import { PERMISSION_CODE } from '@/enum/permission'
import { AuditAction } from '@/enum/status'

import PermissionButton from '../PermissionButton/index.vue'
import SectionCard from '../SectionCard/index.vue'

const props = withDefaults(
  defineProps<{
    loading?: boolean
    disabled?: boolean
    permission?: string | string[]
  }>(),
  {
    loading: false,
    disabled: false,
    permission: PERMISSION_CODE.auditEnterpriseApprove,
  },
)

const emit = defineEmits<{
  submit: [payload: { action: AuditAction; remark: string }]
}>()

const remark = ref('')

function submit(action: AuditAction) {
  emit('submit', {
    action,
    remark: remark.value.trim(),
  })
}
</script>

<template>
  <SectionCard
    title="审核操作"
    description="支持通过、驳回和要求补充材料。驳回时请填写明确原因，便于企业补正。"
  >
    <el-form label-position="top">
      <el-form-item label="审核意见">
        <el-input
          v-model="remark"
          type="textarea"
          :rows="5"
          maxlength="200"
          show-word-limit
          placeholder="请输入审核意见、补充材料要求或驳回原因"
        />
      </el-form-item>
    </el-form>

    <div class="actions">
      <PermissionButton
        :permission="props.permission"
        plain
        :disabled="props.disabled"
        :loading="props.loading"
        @click="submit(AuditAction.Supplement)"
      >
        补充材料
      </PermissionButton>
      <PermissionButton
        :permission="props.permission"
        type="danger"
        plain
        :disabled="props.disabled"
        :loading="props.loading"
        @click="submit(AuditAction.Reject)"
      >
        驳回申请
      </PermissionButton>
      <PermissionButton
        :permission="props.permission"
        :disabled="props.disabled"
        :loading="props.loading"
        @click="submit(AuditAction.Approve)"
      >
        审核通过
      </PermissionButton>
    </div>
  </SectionCard>
</template>

<style scoped lang="scss">
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
