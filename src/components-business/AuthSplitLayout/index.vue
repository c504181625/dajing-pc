<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    cardTitle?: string
    cardDescription?: string
    singleColumn?: boolean
  }>(),
  {
    subtitle: '',
    cardTitle: '',
    cardDescription: '',
    singleColumn: false,
  },
)
</script>

<template>
  <div class="auth-split-layout">
    <div class="auth-split-layout__backdrop" />

    <div
      class="auth-split-layout__container"
      :class="{ 'auth-split-layout__container--single': singleColumn }"
    >
      <aside v-if="!singleColumn" class="auth-split-layout__aside">
        <div class="brand-panel">
          <div class="brand-mark">
            <img src="/logo.png" alt="logo" />
          </div>
          <div class="brand-copy">
            <div class="eyebrow">Quality Innovation Center</div>
            <h1>{{ title }}</h1>
          </div>
        </div>

        <div class="aside-slot">
          <slot name="aside" />
        </div>
      </aside>

      <section class="auth-split-layout__card">
        <div v-if="cardTitle" class="card-head">
          <h2 v-if="cardTitle">{{ cardTitle }}</h2>
        </div>
        <slot />
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-split-layout {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 14% 16%, rgb(45 103 255 / 12%), transparent 24%),
    radial-gradient(circle at 80% 10%, rgb(64 158 255 / 10%), transparent 22%),
    linear-gradient(180deg, #edf4ff 0%, #f6faff 48%, #eef4ff 100%);
}

.auth-split-layout__backdrop {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 58%) 0%, rgb(255 255 255 / 16%) 100%),
    linear-gradient(180deg, rgb(255 255 255 / 0%) 62%, rgb(31 94 255 / 3%) 100%);
}

.auth-split-layout__container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 42px 28px;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(440px, 520px);
  align-items: center;
  gap: 40px;
}

.auth-split-layout__container--single {
  grid-template-columns: minmax(440px, 560px);
  justify-content: center;
}

.auth-split-layout__aside {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.brand-panel {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px 26px;
  border-radius: 28px;
  border: 1px solid rgb(255 255 255 / 72%);
  background: rgb(255 255 255 / 64%);
  box-shadow:
    0 24px 52px rgb(36 72 148 / 10%),
    inset 0 1px 0 rgb(255 255 255 / 72%);
  backdrop-filter: blur(12px);
}

.brand-mark {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 20px;
  background: linear-gradient(180deg, #fff 0%, #f3f8ff 100%);
  box-shadow: 0 14px 28px rgb(31 94 255 / 10%);
}

.brand-mark img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: #5b74ad;
}

.brand-copy h1 {
  margin: 8px 0 10px;
  font-size: clamp(34px, 3.8vw, 44px);
  line-height: 1.08;
  color: #18243d;
}

.aside-slot {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.auth-split-layout__card {
  padding: 30px 30px 28px;
  border-radius: 28px;
  border: 1px solid rgb(255 255 255 / 74%);
  background: rgb(255 255 255 / 82%);
  box-shadow:
    0 28px 60px rgb(37 73 148 / 12%),
    inset 0 1px 0 rgb(255 255 255 / 82%);
  backdrop-filter: blur(14px);
}

.card-head {
  margin-bottom: 22px;
}

.card-head h2 {
  margin: 0;
  font-size: 26px;
  color: #18243d;
}

@media (max-width: 1080px) {
  .auth-split-layout__container {
    grid-template-columns: 1fr;
    gap: 22px;
    padding-top: 24px;
  }
}

@media (max-width: 768px) {
  .auth-split-layout__container {
    padding: 18px 16px 30px;
  }

  .brand-panel,
  .auth-split-layout__card {
    border-radius: 22px;
    padding: 22px 18px;
  }

  .brand-panel {
    align-items: flex-start;
  }

  .brand-copy h1 {
    font-size: 30px;
  }
}
</style>
