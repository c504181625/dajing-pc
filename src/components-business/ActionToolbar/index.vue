<template>
  <div class="action-toolbar">
    <div class="action-toolbar-left">
      <slot />
    </div>
    <div class="action-toolbar-right">
      <slot name="right" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.action-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.action-toolbar-left,
.action-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
