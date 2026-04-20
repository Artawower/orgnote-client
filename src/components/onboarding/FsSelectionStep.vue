<template>
  <page-wrapper>
    <app-flex column start align-stretch gap="md">
      <step-title>{{ t(I18N.CHOOSE_FILE_SYSTEM) }}</step-title>
      <storage-settings hide-warning />
    </app-flex>
  </page-wrapper>
</template>

<script lang="ts" setup>
import PageWrapper from 'src/components/PageWrapper.vue';
import AppFlex from 'src/components/AppFlex.vue';
import StepTitle from 'src/components/onboarding/StepTitle.vue';
import StorageSettings from 'src/containers/StorageSettings.vue';
import { useI18n } from 'vue-i18n';
import { I18N } from 'orgnote-api';
import { api } from 'src/boot/api';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const fsManager = api.core.useFileSystemManager();
const { currentFsName } = storeToRefs(fsManager);

const canProceed = computed(() => !!currentFsName.value);

defineExpose({ canProceed });
</script>
