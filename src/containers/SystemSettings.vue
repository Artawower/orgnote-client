<template>
  <div class="system-settings">
    <card-wrapper background="bg-alt2">
      <menu-item color="red">
        <div class="capitalize text-bold">{{ t(CLEAR_ALL_LOCAL_DATA) }}</div>
      </menu-item>
      <menu-item color="red">
        <div class="capitalize text-bold">{{ t(DELETE_ALL_NOTES) }}</div>
      </menu-item>
    </card-wrapper>
    <app-description :text="PURGE_DATA_WARNING" />
    <card-wrapper background="bg-alt2">
      <menu-item color="red">
        <div class="capitalize text-bold">{{ t(REMOVE_ACCOUNT) }}</div>
      </menu-item>
    </card-wrapper>
    <app-description :text="REMOVE_ACCOUNT_WARNING" />
  </div>
</template>

<script lang="ts" setup>
import CardWrapper from 'src/components/CardWrapper.vue';
import MenuItem from './MenuItem.vue';
import AppDescription from 'src/components/AppDescription.vue';

import { useI18n } from 'vue-i18n';
import {
  CLEAR_ALL_LOCAL_DATA,
  DELETE_ALL_NOTES,
  REMOVE_ACCOUNT,
  PURGE_DATA_WARNING,
  REMOVE_ACCOUNT_WARNING,
} from 'orgnote-api';

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>

<style lang="scss" scoped>
.system-settings {
  @include flexify(column, flex-start, flex-start, var(--gap-sm));
  width: 100%;
}
</style>
