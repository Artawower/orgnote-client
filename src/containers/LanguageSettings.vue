<template>
  <div class="language-settings">
    <app-description padded>
      {{ t(TXT_PICK_LANGUAGE).toUpperCase() }}
    </app-description>
    <card-wrapper background="bg-alt2">
      <menu-item v-for="(_, key) of messages" :key="key" :selected="key === locale">
        {{ key }}
      </menu-item>
    </card-wrapper>
  </div>
</template>

<script lang="ts" setup>
import CardWrapper from 'src/components/CardWrapper.vue';
import AppDescription from 'src/components/AppDescription.vue';
import MenuItem from './MenuItem.vue';
import { TXT_PICK_LANGUAGE } from 'orgnote-api';
import { useI18n } from 'vue-i18n';

const { t, messages, locale } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>

<style lang="scss" scoped>
.language-settings {
  width: 100%;
}
</style>
