<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    cardTitle?: string
    cardDescription?: string
    maxWidth?: string
  }>(),
  {
    subtitle: '',
    cardTitle: '',
    cardDescription: '',
    maxWidth: '760px',
  },
)
</script>

<template>
  <div class="auth-simple-layout">
    <div class="auth-simple-layout__backdrop" />

    <div class="auth-simple-layout__container">
      <div class="brand-strip">
        <div class="brand-strip__logo">
          <img src="/logo.png" alt="logo" />
        </div>
        <div class="brand-strip__copy">
          <!-- <div class="eyebrow">Quality Innovation Center</div> -->
          <h1>{{ title }}</h1>
          <!-- <p v-if="subtitle">{{ subtitle }}</p> -->
        </div>
      </div>

      <section class="form-card" :style="{ maxWidth }">
        <div v-if="cardTitle" class="form-card__head">
          <h2 v-if="cardTitle">{{ cardTitle }}</h2>
        </div>
        <slot />
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-simple-layout {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 0%, rgb(64 158 255 / 10%), transparent 28%),
    linear-gradient(180deg, #eef5ff 0%, #f8fbff 40%, #eef5ff 100%);
}

.auth-simple-layout__backdrop {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgb(255 255 255 / 46%) 0%,
    rgb(255 255 255 / 0%) 48%,
    rgb(31 94 255 / 3%) 100%
  );
}

.auth-simple-layout__container {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 28px 20px 42px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-strip {
  width: 100%;
  max-width: 900px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 22px;
  padding: 0 6px;
}

.brand-strip__logo {
  width: 60px;
  height: 60px;
  display: grid;
  place-items: center;
  border-radius: 18px;
  background: rgb(255 255 255 / 82%);
  box-shadow: 0 14px 30px rgb(31 94 255 / 8%);
  flex-shrink: 0;
}

.brand-strip__logo img {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  color: #5d74a9;
}

.brand-strip__copy h1 {
  margin: 6px 0 8px;
  font-size: clamp(30px, 3vw, 38px);
  color: #18243d;
  line-height: 1.12;
}

.brand-strip__copy p {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: #60718e;
}

.form-card {
  width: 100%;
  padding: 30px 30px 28px;
  border-radius: 24px;
  border: 1px solid rgb(255 255 255 / 72%);
  background: rgb(255 255 255 / 86%);
  box-shadow:
    0 24px 54px rgb(37 73 148 / 10%),
    inset 0 1px 0 rgb(255 255 255 / 82%);
  backdrop-filter: blur(12px);
}

.form-card__head {
  margin-bottom: 22px;
  text-align: center;
}

.form-card__head h2 {
  margin: 0;
  font-size: 26px;
  color: #18243d;
}

@media (max-width: 768px) {
  .auth-simple-layout__container {
    padding: 18px 14px 30px;
  }

  .brand-strip {
    margin-bottom: 16px;
    padding: 0;
    justify-content: flex-start;
  }

  .form-card {
    padding: 22px 18px;
    border-radius: 20px;
  }
}
</style>
