<template>
  <div class="subscription-settings">
    <card-wrapper>
      <menu-item @click="inputRef?.focus()">
        <app-input ref="inputRef" :placeholder="t(I18N.SUBSCRIPTION_KEY)" />
      </menu-item>
      <menu-item type="info">
        <div class="capitalize text-bold">{{ t(I18N.ACTIVATE) }}</div>
      </menu-item>
    </card-wrapper>

    <app-card type="info">
      <template #cardTitle>
        <div class="capitalize">
          {{ t(I18N.WANT_SUBSCRIPTION) }}
        </div>
      </template>
      <app-description>
        <p class="capitalize">{{ t(I18N.SEVERAL_OPTIONS) }}</p>
        <ul>
          <li>
            <a href="https://about.org-note.com" target="_blank" class="link capitalize">{{
              t(I18N.SIGNUP_FOR_BETA)
            }}</a>
            {{ t(I18N.ACTIVE_TESTERS_KEY) }}
          </li>
          <li class="capitalize">
            {{ t(I18N.OPEN_SOURCE_DEVELOPER_WRITE) }}
          </li>
          <li class="capitalize">
            {{ t(I18N.TRY_OWN_SERVER) }}
          </li>
          <li class="capitalize">
            <a :href="PATREON_LINK" target="_blank" class="link">{{ t(I18N.SUBSCRIBE_PATREON) }}</a>
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
import { I18N } from 'orgnote-api';
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
  padding-top: var(--padding-lg);
}
</style>
