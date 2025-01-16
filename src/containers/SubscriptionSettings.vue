<template>
  <div class="subscription-settings">
    <card-wrapper background="bg-alt2">
      <menu-item @click="inputRef?.focus()">
        <app-input ref="inputRef" :placeholder="t(TXT_SUBSCRIPTION_KEY)" />
      </menu-item>
      <menu-item type="info">
        <div class="capitalize text-bold">{{ t(TXT_ACTIVATE) }}</div>
      </menu-item>
    </card-wrapper>

    <app-card type="info">
      <template #cardTitle>
        <div class="capitalize">
          {{ t(TXT_WANT_SUBSCRIPTION) }}
        </div>
      </template>
      <app-description>
        <p class="capitalize">{{ t(TXT_SEVERAL_OPTIONS) }}</p>
        <ul>
          <li>
            <a href="https://about.org-note.com" target="_blank" class="link capitalize">{{
              t(TXT_SIGNUP_FOR_BETA)
            }}</a>
            {{ t(TXT_ACTIVE_TESTERS_KEY) }}
          </li>
          <li class="capitalize">
            {{ t(TXT_OPEN_SOURCE_DEVELOPER_WRITE) }}
          </li>
          <li class="capitalize">
            {{ t(TXT_TRY_OWN_SERVER) }}
          </li>
          <li class="capitalize">
            <a :href="PATREON_LINK" target="_blank" class="link">{{ t(TXT_SUBSCRIBE_PATREION) }}</a>
          </li>
        </ul>
      </app-description>
    </app-card>
  </div>
</template>

<script lang="ts" setup>
import AppInput from 'src/components/AppInput.vue';
import MenuItem from './MenuItem.vue';
import { useI18n } from 'vue-i18n';
import {
  TXT_ACTIVATE,
  TXT_SUBSCRIPTION_KEY,
  TXT_WANT_SUBSCRIPTION,
  TXT_SEVERAL_OPTIONS,
  TXT_SIGNUP_FOR_BETA,
  TXT_ACTIVE_TESTERS_KEY,
  TXT_OPEN_SOURCE_DEVELOPER_WRITE,
  TXT_TRY_OWN_SERVER,
  TXT_SUBSCRIBE_PATREION,
} from 'orgnote-api';
import CardWrapper from 'src/components/CardWrapper.vue';
import { ref } from 'vue';
import { PATREON_LINK } from 'src/constants/external-link';
import AppCard from 'src/components/AppCard.vue';

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});

const inputRef = ref<typeof AppInput | undefined>();
</script>

<style lang="scss" scoped>
.subscription-settings {
  @include flexify(column, flex-start, center, var(--gap-lg));
  width: 100%;
}
.reference {
  padding-top: var(--block-padding-md);
}
</style>
