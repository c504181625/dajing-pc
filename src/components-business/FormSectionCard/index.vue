<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description?: string
  }>(),
  {
    description: '',
  },
)
</script>

<template>
  <section class="form-section-card">
    <header class="form-section-card__head">
      <div class="title-wrap">
        <h3>{{ title }}</h3>
        <p v-if="description">{{ description }}</p>
      </div>
      <div class="extra">
        <slot name="extra" />
      </div>
    </header>

    <div class="form-section-card__body">
      <slot />
    </div>
  </section>
</template>

<style scoped lang="scss">
.form-section-card {
  border: 1px solid rgb(31 94 255 / 10%);
  border-radius: 20px;
  background: linear-gradient(180deg, rgb(255 255 255 / 94%) 0%, rgb(248 251 255 / 92%) 100%);
  box-shadow: 0 16px 34px rgb(31 94 255 / 5%);
  overflow: hidden;
}

.form-section-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 18px 22px 16px;
  border-bottom: 1px solid rgb(15 23 42 / 6%);
}

.title-wrap h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1a2945;
}

.title-wrap p {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: #667896;
}

.form-section-card__body {
  padding: 22px 22px 6px;
}

@media (max-width: 768px) {
  .form-section-card__head {
    padding: 16px 18px 14px;
  }

  .form-section-card__body {
    padding: 18px 18px 4px;
  }
}
</style>
