<template>
  <div class="confirmation-modal">
    <h5 v-if="title" class="title capitalize">{{ t(title) }}</h5>
    <div v-if="message" class="message capitalize">{{ t(message) }}</div>
    <div class="actions">
      <app-button @click="resolver(true)" type="danger">{{
        t(confirmText ?? I18N.CONFIRM)
      }}</app-button>
      <app-button @click="resolver(false)" type="info">{{
        t(cancelText ?? I18N.CANCEL)
      }}</app-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { ConfirmationModalParams } from 'orgnote-api';
import { I18N } from 'orgnote-api';
import AppButton from './AppButton.vue';
import { useI18n } from 'vue-i18n';
defineProps<
  {
    resolver: (data?: boolean) => void;
  } & ConfirmationModalParams
>();

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>

<style lang="scss" scoped>
.confirmation-modal {
  @include flexify(column, flex-start, flex-start, var(--gap-lg));
}

.actions {
  @include flexify(row, flex-end, center, var(--gap-md));

  @include tablet-below {
    @include flexify(column, flex-end, center, var(--gap-sm));

    button {
      width: 100%;
    }
  }

  & {
    width: 100%;
  }
}
</style>
