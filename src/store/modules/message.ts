import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { getMessageStats } from '@/api/modules/message'
import type { MessageStats } from '@/types/business'

const defaultStats: MessageStats = {
  total: 0,
  unread: 0,
  system: 0,
  demand: 0,
  consult: 0,
  order: 0,
}

export const useMessageStore = defineStore('message', () => {
  const stats = ref<MessageStats>({ ...defaultStats })
  const loading = ref(false)

  async function refreshStats() {
    loading.value = true
    try {
      stats.value = await getMessageStats()
    } finally {
      loading.value = false
    }
  }

  function resetStats() {
    stats.value = { ...defaultStats }
  }

  return {
    stats,
    loading,
    unreadCount: computed(() => stats.value.unread),
    refreshStats,
    resetStats,
  }
})
