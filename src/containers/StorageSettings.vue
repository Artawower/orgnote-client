<template>
  <div class="storage-settings">
    <app-description>
      {{ t(I18N.CHOOSE_FILE_SYSTEM) }}
    </app-description>
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
    <app-card v-if="currentFsName" type="danger">
      <template #cardTitle>
        <div class="capitalize">
          {{ t(I18N.STORAGE_CHANGE_WARNING) }}
        </div>
      </template>
      <div class="capitalize">
        {{ t(I18N.STORAGE_CHANGE_WARNING_DESCRIPTION) }}
      </div>
    </app-card>
    <app-description>
      {{ t(I18N.CHOOSE_VAULT) }}
    </app-description>
    <card-wrapper v-if="currentFsName">
      <menu-item>{{ t(I18N.VAULT) }}: {{ vault }}</menu-item>
      <path-picker-btn folder />
    </card-wrapper>
  </div>
</template>

<script lang="ts" setup>
import CardWrapper from 'src/components/CardWrapper.vue';
import MenuItem from './MenuItem.vue';
import AppCard from 'src/components/AppCard.vue';
import PathPickerBtn from './PathPickerBtn.vue';
import AppDescription from 'src/components/AppDescription.vue';

import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/api';
import { storeToRefs } from 'pinia';
import { I18N } from 'orgnote-api';

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});

const fsManager = api.core.useFileSystemManager();
const { fileSystems, currentFsName } = storeToRefs(fsManager);
const { vault } = storeToRefs(api.core.useFileSystem());
</script>

<style lang="scss" scoped>
.storage-settings {
  @include flexify(column, flex-start, flex-start, var(--gap-md));
  width: 100%;
}

.card-wrapper:nth-child(2) {
  margin-top: var(--margin-md);
}
</style>
