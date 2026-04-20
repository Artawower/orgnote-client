<template>
  <page-wrapper centered>
    <app-flex column center align-center gap="lg" class="server-step">
      <step-title>{{ t(I18N.ONBOARDING_SERVER_TITLE) }}</step-title>
      <app-description>
        {{ t(I18N.ONBOARDING_SERVER_DESCRIPTION) }}
      </app-description>
      <q-input
        disable
        outlined
        model-value=""
        placeholder="https://orgnote.com"
        class="server-input"
      />
      <app-description type="info">
        {{ t(I18N.ONBOARDING_SERVER_COMING_SOON) }}
      </app-description>
    </app-flex>
  </page-wrapper>
</template>

<script lang="ts" setup>
import PageWrapper from 'src/components/PageWrapper.vue';
import AppFlex from 'src/components/AppFlex.vue';
import StepTitle from 'src/components/onboarding/StepTitle.vue';
import AppDescription from 'src/components/AppDescription.vue';
import { useI18n } from 'vue-i18n';
import { I18N } from 'orgnote-api';

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
</script>

<style lang="scss" scoped>
.server-step {
  text-align: center;
}

.server-input {
  width: 100%;
}
</style>
