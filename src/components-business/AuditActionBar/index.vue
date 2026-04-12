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
    class="audit-action-card"
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
        class="action-button action-button--muted"
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
        class="action-button action-button--danger"
        @click="submit(AuditAction.Reject)"
      >
        驳回申请
      </PermissionButton>
      <PermissionButton
        :permission="props.permission"
        :disabled="props.disabled"
        :loading="props.loading"
        class="action-button action-button--primary"
        @click="submit(AuditAction.Approve)"
      >
        审核通过
      </PermissionButton>
    </div>
  </SectionCard>
</template>

<style scoped lang="scss">
.audit-action-card :deep(.el-card__body) {
  background: linear-gradient(180deg, #fcfdff 0%, #f5f8ff 100%);
}

.actions {
  display: grid;
  gap: 12px;
}

.action-button {
  width: 100%;
  height: 42px;
  margin: 0;
  border-radius: 12px;
}

.action-button--muted {
  :deep(.el-button),
  :deep(.el-button:hover),
  :deep(.el-button:focus-visible) {
    border-color: rgb(84 135 255 / 28%);
    background: linear-gradient(180deg, #f8fbff 0%, #edf4ff 100%);
    color: var(--dj-color-primary);
  }
}

.action-button--danger {
  :deep(.el-button),
  :deep(.el-button:hover),
  :deep(.el-button:focus-visible) {
    border-color: rgb(245 108 108 / 28%);
    background: linear-gradient(180deg, #fff7f7 0%, #fff1f0 100%);
    color: var(--el-color-danger);
  }
}

.action-button--primary {
  :deep(.el-button),
  :deep(.el-button:hover),
  :deep(.el-button:focus-visible) {
    background: linear-gradient(180deg, #5ca2ff 0%, #3f8ff5 100%);
    border-color: transparent;
    color: #fff;
  }
}
</style>
