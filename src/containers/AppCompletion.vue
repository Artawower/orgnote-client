<template>
  <container-layout
    class="completion-wrapper"
    :class="{ 'full-screen': config!.fullScreen, 'input-only': isInputOnly }"
    :reverse="shouldReverse"
    header-border
    footer-border
    body-scroll
  >
    <template #header>
      <div class="header">
        <completion-input ref="completionInputRef" :placeholder="placeholder" />
      </div>
    </template>
    <template v-if="!isInputOnly" #body>
      <div class="body">
        <completion-result
          v-if="activeCompletion!.candidates?.length"
          @select="handleResultSelect"
        />
        <app-flex
          v-else
          class="not-found"
          row
          center
          align-center
          :style="{ height: completionItemHeight + 'px' }"
        >
          {{ t(I18N.NOT_FOUND).toUpperCase() }}
        </app-flex>
      </div>
    </template>
    <template v-if="!isInputOnly" #footer>
      <app-flex class="footer" row center align-center>
        {{ (activeCompletion!.selectedCandidateIndex ?? 0) + 1 }}/{{ activeCompletion!.total }}
      </app-flex>
    </template>
  </container-layout>
</template>

<script lang="ts" setup>
import { I18N, type CompletionConfig } from 'orgnote-api';
import CompletionInput from './CompletionInput.vue';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import CompletionResult from './CompletionResult.vue';
import { computed } from 'vue';
import { DEFAULT_COMPLETIO_ITEM_HEIGHT } from 'src/constants/completion-item';
import { useI18n } from 'vue-i18n';
import ContainerLayout from 'src/components/ContainerLayout.vue';
import AppFlex from 'src/components/AppFlex.vue';

defineProps<
  {
    placeholder?: string;
  } & Partial<CompletionConfig>
>();

const { config } = storeToRefs(api.ui.useModal());
const completionStore = api.core.useCompletion();
const { activeCompletion } = storeToRefs(completionStore);

const completionInputRef = ref<InstanceType<typeof CompletionInput> | null>(null);
const handleResultSelect = () => completionInputRef.value?.focusInput?.();

const completionItemHeight = computed(
  () => activeCompletion.value!.itemHeight ?? DEFAULT_COMPLETIO_ITEM_HEIGHT,
);

const { desktopBelow } = api.ui.useScreenDetection();
const shouldReverse = computed(() => desktopBelow.value);

const isInputOnly = computed(() => activeCompletion.value?.type === 'input');

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>

<style lang="scss" scoped>
.completion-wrapper {
  max-width: var(--completion-max-width);
  width: var(--completion-width) !important;

  &.full-screen {
    max-width: unset;
  }
}

.header,
.body {
  padding: var(--completion-padding);
}

.body {
  padding-right: calc(var(--completion-padding) - var(--scroll-bar-width));
}

.footer {
  & {
    padding: var(--padding-lg);
    height: var(--completion-footer-height);
    color: var(--fg-muted);
  }
}

@mixin completion-fullframe {
  max-width: unset;
  width: 100% !important;
  height: 100%;
}

@include desktop-below {
  .completion-wrapper {
    @include completion-fullframe();
    position: relative;

    :deep(.layout-header) {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1;
      margin: 0 var(--completion-header-margin) var(--completion-header-margin);
      border-top: none;
    }

    :deep(.layout-body) {
      padding-bottom: var(--completion-header-offset);
    }

    &.input-only {
      height: auto;

      :deep(.layout-body) {
        display: none;
      }
    }
  }

  .header {
    background: var(--completion-header-bg);
    -webkit-backdrop-filter: var(--completion-header-backdrop-filter);
    backdrop-filter: var(--completion-header-backdrop-filter);
    background-clip: padding-box;
    box-shadow: var(--completion-header-box-shadow);
    border: var(--completion-header-border);
    border-radius: var(--completion-header-border-radius);
  }
}

@include desktop {
  .completion-wrapper {
    height: auto;

    &:not(.full-screen) {
      max-height: var(--completion-max-height, 68vh);
    }
  }
}

.full-screen {
  @include completion-fullframe();
}

.not-found {
  & {
    color: var(--fg-muted);
  }
}
</style>
