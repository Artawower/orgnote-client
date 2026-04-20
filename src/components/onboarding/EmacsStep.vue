<template>
  <page-wrapper>
    <app-flex column start align-stretch gap="md">
      <step-title>{{ t(I18N.ONBOARDING_EMACS_TITLE) }}</step-title>
      <app-description>
        {{ t(I18N.ONBOARDING_EMACS_DESCRIPTION) }}
      </app-description>
      <pre class="config-block">{{ configContent }}</pre>
      <app-button type="info" @click="copyConfig">
        {{ t(I18N.ONBOARDING_EMACS_COPY_CONFIG) }}
      </app-button>
    </app-flex>
  </page-wrapper>
</template>

<script lang="ts" setup>
import PageWrapper from 'src/components/PageWrapper.vue';
import AppFlex from 'src/components/AppFlex.vue';
import StepTitle from 'src/components/onboarding/StepTitle.vue';
import AppDescription from 'src/components/AppDescription.vue';
import AppButton from 'src/components/AppButton.vue';
import { useI18n } from 'vue-i18n';
import { I18N } from 'orgnote-api';
import { computed } from 'vue';
import { useInteractiveClipboard } from 'src/composables/use-interactive-clipboard';

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const { safeCopyToClipboard } = useInteractiveClipboard();

const configContent = computed(() => t(I18N.ONBOARDING_EMACS_CONFIG_CONTENT));

const copyConfig = (): void => {
  safeCopyToClipboard(configContent.value);
};
</script>

<style lang="scss" scoped>
.config-block {
  background: var(--bg-elevated);
  border: var(--card-border);
  border-radius: var(--card-radius);
  padding: var(--card-padding);
  font-family: monospace;
  font-size: 0.85rem;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  width: 100%;
  box-sizing: border-box;
}
</style>
