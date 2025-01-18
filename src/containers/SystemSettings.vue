<template>
  <div class="system-settings">
    <card-wrapper>
      <menu-item @click="execute(DefaultCommands.DELETE_ALL_DATA)" type="danger">
        <div class="capitalize text-bold">{{ t(TXT_CLEAR_ALL_LOCAL_DATA) }}</div>
      </menu-item>
      <menu-item @click="execute(DefaultCommands.DELETE_ALL_NOTES)" type="danger">
        <div class="capitalize text-bold">{{ t(TXT_DELETE_ALL_NOTES) }}</div>
      </menu-item>
    </card-wrapper>
    <app-description :text="TXT_PURGE_DATA_WARNING" padded />
    <card-wrapper>
      <menu-item @click="execute(DefaultCommands.DELETE_ACCOUNT)" type="danger">
        <div class="capitalize text-bold">{{ t(TXT_REMOVE_ACCOUNT) }}</div>
      </menu-item>
    </card-wrapper>
    <app-description :text="TXT_REMOVE_ACCOUNT_WARNING" padded />
  </div>
</template>

<script lang="ts" setup>
import CardWrapper from 'src/components/CardWrapper.vue';
import MenuItem from './MenuItem.vue';
import AppDescription from 'src/components/AppDescription.vue';

import { useI18n } from 'vue-i18n';
import {
  TXT_CLEAR_ALL_LOCAL_DATA,
  TXT_DELETE_ALL_NOTES,
  TXT_REMOVE_ACCOUNT,
  TXT_PURGE_DATA_WARNING,
  TXT_REMOVE_ACCOUNT_WARNING,
  DefaultCommands,
} from 'orgnote-api';
import { api } from 'src/boot/api';

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});

const { execute } = api.core.useCommands();
</script>

<style lang="scss" scoped>
.system-settings {
  @include flexify(column, flex-start, flex-start, var(--gap-sm));
  width: 100%;
}
</style>
