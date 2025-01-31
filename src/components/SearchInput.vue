<template>
  <div class="search-input">
    <input :name="name" :type="type" v-model="model" :placeholder="t(placeholder)" />
    <action-button @click="model = ''" icon="sym_o_backspace" :size="size" />
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import ActionButton from './ActionButton.vue';
import type { ViewSize } from 'src/models/view-size';

withDefaults(
  defineProps<{
    name?: string;
    placeholder?: string;
    type?: string;
    clearable?: boolean;
    size?: ViewSize;
  }>(),
  {
    type: 'text',
    clearable: true,
    size: 'sm',
  },
);

const model = defineModel();

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>

<style lang="scss" scoped>
.search-input {
  width: 100%;
  @include flexify(row, space-between, center, var(--gap-sm));
}

input {
  @include reset-input;
  height: 100%;
  flex: 1;
}
</style>
