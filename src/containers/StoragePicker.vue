<template>
  <app-flex class="storage-picker" column start align-start full-width gap="md">
    <slot name="header" />
    <card-wrapper>
      <menu-item
        @click="fsManager.useFs(fs.name)"
        icon="sym_o_web"
        v-for="fs of fileSystems"
        :key="fs.name"
        :selected="fs.name === currentFsName"
        :active="fs.name === currentFsName"
      >
        {{ fs.name }}
        <template v-if="fs.description" #content>
          <app-description>{{ t(fs.description) }}</app-description>
        </template>
      </menu-item>
    </card-wrapper>

    <app-card v-if="currentFsName && !hideWarning" type="danger">
      <template #cardTitle>
        <div class="capitalize">{{ t(I18N.STORAGE_CHANGE_WARNING) }}</div>
      </template>
      <div class="capitalize">
        {{ t(I18N.STORAGE_CHANGE_WARNING_DESCRIPTION) }}
      </div>
    </app-card>

    <app-description v-if="fsManager.currentFs?.pickFolder">
      <menu-item>
        <overflow-line> {{ t(I18N.VAULT) }}: {{ fileSystem.prettyVault }} </overflow-line>
      </menu-item>
      <menu-item @click="fsManager.currentFs.pickFolder" type="info">{{
        I18N.PICK_FOLDER
      }}</menu-item>
    </app-description>
  </app-flex>
</template>

<script lang="ts" setup>
import CardWrapper from 'src/components/CardWrapper.vue';
import MenuItem from './MenuItem.vue';
import AppCard from 'src/components/AppCard.vue';
import AppDescription from 'src/components/AppDescription.vue';
import OverflowLine from 'src/components/OverflowLine.vue';

import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/api';
import { storeToRefs } from 'pinia';
import { I18N } from 'orgnote-api';
import AppFlex from 'src/components/AppFlex.vue';

withDefaults(defineProps<{ hideWarning?: boolean }>(), { hideWarning: false });

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});

const fsManager = api.core.useFileSystemManager();
const fileSystem = api.core.useFileSystem();
const { fileSystems, currentFsName } = storeToRefs(fsManager);
</script>
