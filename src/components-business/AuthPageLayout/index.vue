<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    cardTitle?: string
    cardDescription?: string
  }>(),
  {
    subtitle: '',
    cardTitle: '',
    cardDescription: '',
  },
)
</script>

<template>
  <div class="auth-layout">
    <div class="auth-layout__backdrop" />

    <div class="auth-layout__container">
      <aside class="auth-layout__aside">
        <div class="brand-card">
          <div class="brand-mark">
            <img src="/logo.png" alt="logo" />
          </div>
          <div class="brand-copy">
            <h1>{{ title }}</h1>
            <p v-if="subtitle">{{ subtitle }}</p>
          </div>
        </div>

        <div class="aside-slot">
          <slot name="aside" />
        </div>
      </aside>

      <section class="auth-layout__card">
        <div v-if="cardTitle || cardDescription" class="card-head">
          <h2 v-if="cardTitle">{{ cardTitle }}</h2>
          <p v-if="cardDescription">{{ cardDescription }}</p>
        </div>
        <slot />
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-layout {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 16% 18%, rgb(41 98 255 / 12%), transparent 26%),
    radial-gradient(circle at 82% 20%, rgb(64 158 255 / 10%), transparent 24%),
    linear-gradient(180deg, #edf4ff 0%, #f8fbff 46%, #eef5ff 100%);
}

.auth-layout__backdrop {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 62%) 0%, rgb(255 255 255 / 14%) 100%),
    linear-gradient(180deg, rgb(255 255 255 / 0%) 68%, rgb(31 94 255 / 4%) 100%);
}

.auth-layout__container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  max-width: 1240px;
  margin: 0 auto;
  padding: 48px 28px;
  display: grid;
  grid-template-columns: minmax(360px, 1fr) minmax(460px, 560px);
  align-items: center;
  gap: 44px;
}

.auth-layout__aside {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.brand-card {
  padding: 28px 30px;
  border-radius: 28px;
  border: 1px solid rgb(255 255 255 / 66%);
  background: rgb(255 255 255 / 64%);
  backdrop-filter: blur(14px);
  box-shadow:
    0 24px 54px rgb(32 72 160 / 10%),
    inset 0 1px 0 rgb(255 255 255 / 72%);
  display: flex;
  align-items: center;
  gap: 20px;
}

.brand-mark {
  width: 76px;
  height: 76px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  background: linear-gradient(180deg, #fff 0%, #f4f8ff 100%);
  box-shadow: 0 16px 32px rgb(31 94 255 / 10%);
  flex-shrink: 0;
}

.brand-mark img {
  width: 54px;
  height: 54px;
  object-fit: contain;
}

.brand-copy .eyebrow {
  font-size: 13px;
  letter-spacing: 0.08em;
  color: #4d6bb3;
}

.brand-copy h1 {
  margin: 8px 0 10px;
  font-size: clamp(34px, 4vw, 46px);
  line-height: 1.08;
  color: #17233d;
}

.brand-copy p {
  margin: 0;
  max-width: 560px;
  font-size: 15px;
  line-height: 1.8;
  color: #5c6f91;
}

.aside-slot {
  min-height: 120px;
}

.auth-layout__card {
  padding: 34px 34px 30px;
  border-radius: 30px;
  border: 1px solid rgb(255 255 255 / 72%);
  background: rgb(255 255 255 / 78%);
  backdrop-filter: blur(16px);
  box-shadow:
    0 26px 62px rgb(40 78 158 / 14%),
    inset 0 1px 0 rgb(255 255 255 / 76%);
}

.card-head {
  margin-bottom: 24px;
}

.card-head h2 {
  margin: 0;
  font-size: 26px;
  color: #17233d;
}

.card-head p {
  margin: 8px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: #617394;
}

@media (max-width: 1080px) {
  .auth-layout__container {
    grid-template-columns: 1fr;
    gap: 24px;
    padding-top: 28px;
  }

  .auth-layout__aside {
    gap: 16px;
  }

  .aside-slot {
    min-height: auto;
  }
}

@media (max-width: 768px) {
  .auth-layout__container {
    padding: 20px 16px 32px;
  }

  .brand-card,
  .auth-layout__card {
    padding: 24px 20px;
    border-radius: 24px;
  }

  .brand-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .brand-copy h1 {
    font-size: 30px;
  }
}
</style>
