<template>
  <div class="description capitalize" :class="[type ?? '', { padded }]">
    <slot>
      <template v-if="text">{{ title ? t(text).toUpperCase() : t(text) }} </template>
    </slot>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
defineProps<{ text?: string; title?: boolean; type?: 'warning' | 'error'; padded?: boolean }>();

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>

<style lang="scss" scoped>
.description {
  color: var(--fg-alt);
  font-size: var(--font-size-sm);
  width: 100%;
  padding: 0;
  margin: 0;

  &.padded {
    padding: var(--block-padding-sm) 0;
  }
}

.warning {
  color: var(--yellow);
}

.error {
  color: var(--red);
}
</style>
