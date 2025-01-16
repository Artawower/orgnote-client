<template>
  <div class="api-settings">
    <app-description padded>
      <div class="capitalize">{{ t(TXT_AVAILABLE_FOR_SUBSCRIPTION) }}</div>
    </app-description>

    <card-wrapper background="bg-alt2"> </card-wrapper>
    <card-wrapper background="bg-alt2">
      <menu-item type="info">
        <div class="capitalize">{{ t(TXT_CREATE_NEW_TOKEN) }}</div>
      </menu-item>
    </card-wrapper>
  </div>
</template>

<script lang="ts" setup>
import { TXT_CREATE_NEW_TOKEN, TXT_AVAILABLE_FOR_SUBSCRIPTION } from 'orgnote-api';
import AppDescription from 'src/components/AppDescription.vue';
import { useI18n } from 'vue-i18n';
import MenuItem from './MenuItem.vue';
import CardWrapper from 'src/components/CardWrapper.vue';

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>

<style lang="scss" scoped>
.api-settings {
  width: 100%;
}
</style>
