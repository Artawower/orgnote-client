<template>
  <div class="completion-wrapper" :class="{ 'full-screen': config.fullScreen }">
    <div class="header">
      <completion-input :placeholder="placeholder" />
    </div>
    <div class="content">
      <completion-result />
    </div>
    <div class="footer">
      {{ activeCompletion.selectedCandidateIndex + 1 }}/{{ activeCompletion.total }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { CompletionConfig } from 'orgnote-api';
import CompletionInput from './CompletionInput.vue';
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import CompletionResult from './CompletionResult.vue';
defineProps<
  {
    placeholder?: string;
  } & CompletionConfig
>();

const { config } = storeToRefs(api.ui.useModal());
const { activeCompletion } = storeToRefs(api.core.useCompletion());
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
  padding: var(--block-padding-md);
  height: var(--completion-footer-height);
  color: var(--fg-alt);
}

@mixin completion-fullframe {
  max-width: unset;
  width: 100% !important;
  height: 100vh;
  height: 100dvh;
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
</style>
