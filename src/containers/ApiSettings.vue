<template>
  <div class="api-settings">
    <app-description padded>
      <div class="capitalize">{{ t(TXT_AVAILABLE_FOR_SUBSCRIPTION) }}</div>
    </app-description>

    <card-wrapper>
      <menu-item v-for="(token, i) of tokens" type="plain" :key="i">
        {{ token.token }}
        <template #right>
          <div class="actions">
            <action-button
              @click="api.utils.copyToClipboard(token.token)"
              icon="content_copy"
              color="fg-alt"
              fire-icon="done"
              size="sm"
              fire-color="green"
              outline
              border
            ></action-button>
            <action-button color="fg-alt" icon="delete" size="sm" outline border></action-button>
          </div>
        </template>
      </menu-item>
    </card-wrapper>
    <card-wrapper>
      <menu-item @click="addToken" type="info">
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
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import ActionButton from 'src/components/ActionButton.vue';

const { tokens } = storeToRefs(api.core.useSettings());

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});

const addToken = () => {};
</script>

<style lang="scss" scoped>
.api-settings {
  @include flexify(column, flex-start, flex-start, var(--gap-md));
  width: 100%;
}
.actions {
  @include flexify(row, flex-start, center, var(--gap-sm));
  opacity: 0;
}

.menu-item {
  &:hover {
    .actions {
      opacity: 1;
    }
  }
}
</style>
