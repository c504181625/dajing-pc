import { ElMessage, ElMessageBox } from 'element-plus'
import type { Ref } from 'vue'

interface ConfirmDeleteOptions<T> {
  id: string
  listRef: Ref<T[]>
  totalRef?: Ref<number>
  entityName?: string
  itemLabel?: string
  onDelete?: () => Promise<unknown>
  successText?: string
}

export async function confirmDeleteRow<T extends { id: string }>(
  options: ConfirmDeleteOptions<T>,
) {
  const {
    id,
    listRef,
    totalRef,
    entityName,
    itemLabel = '记录',
    onDelete,
    successText = '删除成功',
  } = options

  const targetName = entityName ? `“${entityName}”` : '当前记录'
  await ElMessageBox.confirm(`确认删除${targetName}吗？`, `删除${itemLabel}`, {
    type: 'warning',
    confirmButtonText: '确认删除',
    cancelButtonText: '取消',
  })

  if (onDelete) {
    await onDelete()
  }

  listRef.value = listRef.value.filter((item) => item.id !== id)
  if (totalRef) {
    totalRef.value = Math.max(0, totalRef.value - 1)
  }

  ElMessage.success(successText)
}
