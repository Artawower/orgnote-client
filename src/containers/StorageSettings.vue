<template>
  <div class="system-settings">
    <card-wrapper>
      <menu-item
        @click="fsManager.useFs(fs.name)"
        icon="sym_o_web"
        v-for="fs of fileSystems"
        :key="fs.name"
        :selected="fs.name === currentFsName || true"
        :active="fs.name === currentFsName || true"
      >
        {{ fs.name }}
        <template v-if="fs.description" #content>
          <app-description>{{ t(fs.description) }}</app-description>
        </template>
      </menu-item>
    </card-wrapper>
    <app-card type="danger">
      <template #cardTitle>
        <div class="capitalize">
          {{ t(TXT_STORAGE_CHANGE_WARNING) }}
        </div>
      </template>
      <div class="capitalize">
        {{ t(TXT_STORAGE_CHANGE_WARNING_DESCRIPTION) }}
      </div>
    </app-card>
  </div>
</template>

<script lang="ts" setup>
import CardWrapper from 'src/components/CardWrapper.vue';
import MenuItem from './MenuItem.vue';
import AppDescription from 'src/components/AppDescription.vue';
import AppCard from 'src/components/AppCard.vue';

import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/api';
import { storeToRefs } from 'pinia';
import { TXT_STORAGE_CHANGE_WARNING, TXT_STORAGE_CHANGE_WARNING_DESCRIPTION } from 'orgnote-api';

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});

const fsManager = api.core.useFileSystemManager();
const { fileSystems, currentFsName } = storeToRefs(fsManager);
</script>

<style lang="scss" scoped>
.system-settings {
  @include flexify(column, flex-start, flex-start, var(--gap-sm));
  width: 100%;
}

.card-wrapper {
  margin-top: var(--block-margin-md);
}
</style>
