<template>
  <page-wrapper padding constrained centered>
    <safe-area class="error-root" fit>
      <container-layout gap="lg" :body-scroll="false">
        <template #header>
          <info-card
            icon="sym_o_error"
            :title="$t(I18N.CRITICAL_ERROR)"
            :description="$t(I18N.ERROR_DESCRIPTION)"
            type="danger"
          />
        </template>

        <app-logs />

        <template #footer>
          <card-wrapper>
            <menu-item type="info" @click="safeCopyToClipboard(errorLogText)">
              {{ $t(I18N.COPY_LOG) }}
            </menu-item>
            <menu-item type="danger" @click="reload">
              {{ $t(I18N.RELOAD) }}
            </menu-item>
          </card-wrapper>
        </template>
      </container-layout>
    </safe-area>
  </page-wrapper>
</template>

<script setup lang="ts">
import PageWrapper from 'src/components/PageWrapper.vue';
import ContainerLayout from 'src/components/ContainerLayout.vue';
import InfoCard from 'src/components/InfoCard.vue';
import AppLogs from 'src/containers/AppLogs.vue';
import { I18N } from 'orgnote-api';
import { useAppLogs } from 'src/composables/useAppLogs';
import MenuItem from 'src/containers/MenuItem.vue';
import CardWrapper from 'src/components/CardWrapper.vue';
import SafeArea from 'src/components/SafeArea.vue';
import { useInteractiveClipboard } from 'src/composables/use-interactive-clipboard';

const { errorLogText } = useAppLogs();
const { safeCopyToClipboard } = useInteractiveClipboard();

const reload = (): void => {
  window.location.assign('/');
};
</script>

<style lang="scss" scoped>
.error-root {
  --safe-area-top: var(--app-top-inset);
}
</style>
