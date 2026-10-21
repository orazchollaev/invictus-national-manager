<script setup lang="ts">
import { useI18n } from "vue-i18n"
import { AppModal } from "@/components/ui"

defineEmits<{ close: [] }>()

const { t } = useI18n()
const version = __APP_VERSION__

/** Third-party work the app ships, with the credit its licence asks for. */
const CREDITS = [
  {
    name: "facesjs",
    author: "Jeremy Scheff",
    license: "Apache-2.0",
    use: "creditFaces",
    url: "https://github.com/zengm-games/facesjs",
  },
] as const
</script>

<template>
  <AppModal :title="t('settings.about')" width="425px" @close="$emit('close')">
    <div class="about">
      <div class="about-logos">
        <img src="/logo.png" alt="invictus dev" class="about-logo" />
        <img src="/logo/shiftfn-logo.webp" alt="shiftfn dev" class="about-logo" />
      </div>

      <h3 class="about-title">
        {{ t("app.name") }} {{ t("app.subtitle") }} {{ t("settings.aboutBy") }} ShiftFn Dev
      </h3>
      <span class="about-version">v{{ version }}</span>

      <div class="about-section">
        <span class="about-section-title">{{ t("settings.openSource") }}</span>
        <ul class="about-credits">
          <li v-for="c in CREDITS" :key="c.name">
            <a :href="c.url" target="_blank" rel="noopener" class="about-credit-name">
              {{ c.name }}
            </a>
            <span class="about-credit-meta">
              {{ t(`settings.${c.use}`) }} · {{ c.author }} · {{ c.license }}
            </span>
          </li>
        </ul>
      </div>

      <p class="about-disclaimer">{{ t("settings.disclaimer") }}</p>
    </div>
  </AppModal>
</template>

<style scoped>
.about {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--sp-2);
  padding: var(--sp-5) var(--sp-3) var(--sp-3);
  text-align: center;
}

.about-logos {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--sp-4);
  margin-bottom: var(--sp-2);
}
.about-logo {
  width: 64px;
  height: 64px;
  border-radius: 12px;
}

.about-title {
  margin: 0;
  font-size: var(--fs-xl);
  font-weight: 700;
}
.about-version {
  font-size: var(--fs-base);
  color: var(--text-muted);
}

.about-section {
  width: 100%;
  margin-top: var(--sp-4);
  padding-top: var(--sp-4);
  border-top: 1px solid var(--border-light);
}
.about-section-title {
  display: block;
  font-size: var(--fs-base);
  font-weight: 600;
  margin-bottom: var(--sp-2);
}
.about-section-title::after {
  content: ":";
}

.about-credits {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--sp-2);
}
.about-credit-name {
  font-size: var(--fs-base);
  font-weight: 600;
  color: var(--accent);
  text-decoration: none;
}
.about-credit-meta {
  display: block;
  font-size: var(--fs-xs);
  color: var(--text-muted);
}

.about-disclaimer {
  margin: var(--sp-4) 0 0;
  font-size: var(--fs-xs);
  line-height: 1.4;
  color: var(--text-muted);
  opacity: 0.7;
}
</style>
