<template>
  <page-wrapper centered>
    <app-flex column center align-center gap="md" full-width>
      <app-title :level="2" center>
        {{ t(I18N.ONBOARDING_EMACS_TITLE) }}
      </app-title>
      <app-description center>
        {{ t(I18N.ONBOARDING_EMACS_DESCRIPTION) }}
      </app-description>
      <app-description center>
        {{ t(I18N.ONBOARDING_EMACS_CONFIG_CONTENT) }}
      </app-description>
      <app-code :code="installationScript" />
      <card-wrapper>
        <menu-item @click="copyConfig" type="info">
          {{ t(I18N.ONBOARDING_EMACS_COPY_CONFIG) }}
        </menu-item>
      </card-wrapper>
    </app-flex>
  </page-wrapper>
</template>

<script lang="ts" setup>
import PageWrapper from 'src/components/PageWrapper.vue';
import AppFlex from 'src/components/AppFlex.vue';
import AppTitle from 'src/components/AppTitle.vue';
import AppDescription from 'src/components/AppDescription.vue';
import MenuItem from 'src/containers/MenuItem.vue';
import CardWrapper from 'src/components/CardWrapper.vue';
import AppCode from 'src/components/AppCode.vue';
import { useI18n } from 'vue-i18n';
import { I18N } from 'orgnote-api';
import { useInteractiveClipboard } from 'src/composables/use-interactive-clipboard';
import {
  USE_PACKAGE_DEV_ENSTRUCTIONS,
  USE_PACKAGE_MASTER_ENSTRUCTIONS,
} from 'src/constants/install-scripts';

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const { safeCopyToClipboard } = useInteractiveClipboard();

const isDevDeployment = (): boolean =>
  process.env.DEV || process.env.DEPLOYMENT_ENV === 'dev' || process.env.DEPLOYMENT_ENV === 'local';

const installationScript = isDevDeployment()
  ? USE_PACKAGE_DEV_ENSTRUCTIONS
  : USE_PACKAGE_MASTER_ENSTRUCTIONS;

const copyConfig = (): void => {
  safeCopyToClipboard(installationScript);
};
</script>
