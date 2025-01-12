<template>
  <div class="settings-menu">
    <card-wrapper background="var(--bg-alt2)">
      <menu-item icon="sym_o_settings">
        <div class="capitalize">{{ t(SYSTEM) }}</div>
      </menu-item>
    </card-wrapper>
  </div>
</template>

<script lang="ts" setup>
import CardWrapper from 'src/components/CardWrapper.vue';
import MenuItem from './MenuItem.vue';
import { SYSTEM } from 'orgnote-api';
import { useI18n } from 'vue-i18n';

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>

<style lang="scss" scoped>
.card-wrapper {
  width: 100%;
}

.settings-menu {
  width: 420px;
}
</style>
