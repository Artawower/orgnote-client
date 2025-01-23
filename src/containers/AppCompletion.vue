<template>
  <div class="completion-wrapper" :class="{ 'full-screen': config.fullScreen }">
    <div class="header">
      <completion-input :placeholder="placeholder" />
    </div>
    <div class="content">
      <completion-result v-if="activeCompletion.candidates?.length" />
      <div v-else class="not-found" :style="{ height: completionItemHeight + 'px' }">
        {{ t(TXT_NOT_FOUND).toUpperCase() }}
      </div>
    </div>
    <div class="footer">
      {{ activeCompletion.selectedCandidateIndex + 1 }}/{{ activeCompletion.total }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { TXT_NOT_FOUND, type CompletionConfig } from 'orgnote-api';
import CompletionInput from './CompletionInput.vue';
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import CompletionResult from './CompletionResult.vue';
import { computed } from 'vue';
import { DEFAULT_COMPLETIO_ITEM_HEIGHT } from 'src/constants/completion-item';
import { useI18n } from 'vue-i18n';
defineProps<
  {
    placeholder?: string;
  } & Partial<CompletionConfig>
>();

const { config } = storeToRefs(api.ui.useModal());
const { activeCompletion } = storeToRefs(api.core.useCompletion());
const completionItemHeight = computed(
  () => activeCompletion.value.itemHeight ?? DEFAULT_COMPLETIO_ITEM_HEIGHT,
);

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>

<style lang="scss" scoped>
.completion-wrapper {
  @include flexify(column, flex-start, stretch, 0);
  max-width: var(--completion-max-width);
  width: var(--completion-width) !important;
  padding-bottom: var(--device-padding-bottom);

  &.full-screen {
    max-width: unset;
  }
}

.header {
  border-bottom: var(--border-default);
  padding: var(--completion-padding);
}

.content {
  flex: 1;
  overflow-y: overlay;
  padding: var(--completion-padding);
  padding-right: calc(var(--completion-padding) - var(--scroll-bar-width));
}

.footer {
  @include flexify(row, center, center);
  border-top: var(--border-default);
  padding: var(--padding-lg);
  height: var(--completion-footer-height);
  color: var(--fg-alt);
}

@mixin completion-fullframe {
  max-width: unset;
  width: 100% !important;
  height: 100%;
}

@include desktop-below {
  .completion-wrapper {
    @include completion-fullframe();
  }

  .header {
    border-top: var(--border-default);
    border-bottom: none;
    order: 2;
  }

  .content {
    order: 1;
  }

  .footer {
    order: 0;
    border-top: none;
  }
}

@include tablet-above {
  .completion-wrapper {
    &:not(.full-screen) {
      max-height: var(--completion-max-height, 68vh);
    }
  }
}

.full-screen {
  @include completion-fullframe();
}

.not-found {
  @include flexify(row, center, center);
  color: var(--fg-alt);
}
</style>
