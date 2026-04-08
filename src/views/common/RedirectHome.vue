<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  if (!userStore.token) {
    router.replace('/login')
    return
  }

  router.replace(userStore.landingPath)
})
</script>

<template>
  <div />
</template>
