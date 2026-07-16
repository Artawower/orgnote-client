<template>
  <app-flex
    class="search-input"
    :class="[appearance, { 'no-icon': !icon }]"
    row
    between
    align-center
    gap="sm"
  >
    <app-icon v-if="icon" :name="icon" size="md" color="fg" />
    <app-input
      ref="appInputRef"
      v-model="model"
      :autofocus="autofocus"
      :name="name"
      :type="type"
      :placeholder="placeholder && t(placeholder)"
    />
    <slot name="actions" />
    <action-button
      v-if="clearable && model"
      @click="model = ''"
      icon="sym_o_backspace"
      :size="size"
    />
  </app-flex>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ActionButton from './ActionButton.vue';
import AppFlex from './AppFlex.vue';
import AppIcon from './AppIcon.vue';
import AppInput from './AppInput.vue';
import type { StyleSize } from 'orgnote-api';

type InputAppearance = 'glass' | 'flat' | 'menu';

withDefaults(
  defineProps<{
    name?: string;
    placeholder?: string;
    type?: string;
    clearable?: boolean;
    size?: StyleSize;
    icon?: string;
    appearance?: InputAppearance;
    autofocus?: boolean;
  }>(),
  {
    type: 'text',
    clearable: true,
    size: 'sm',
    appearance: 'flat',
  },
);

const model = defineModel<string>();

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});

const appInputRef = ref<InstanceType<typeof AppInput> | undefined>();

const focus = () => {
  appInputRef.value?.focus?.();
};

defineExpose({
  focus,
});
</script>

<style lang="scss" scoped>
.search-input {
  width: 100%;
  @include glass-btn;

  &.glass {
    height: var(--bar-height);
    padding: 0 var(--padding-md);
    @include glass-surface;
    border-radius: var(--border-radius-xl);

    &.no-icon {
      padding-left: var(--padding-lg);
    }
  }

  &.menu {
    height: var(--search-input-menu-height);
    padding: var(--search-input-menu-padding);
    background: var(--search-input-menu-bg);
    border: var(--search-input-menu-border);
    border-radius: var(--search-input-menu-radius);
    box-shadow: var(--search-input-menu-shadow);
    box-sizing: border-box;
    transition:
      background var(--search-input-menu-transition),
      box-shadow var(--search-input-menu-transition);

    @include hover {
      background: var(--search-input-menu-hover-bg);
    }

    &:focus-within {
      background: var(--search-input-menu-focus-bg);
      box-shadow: var(--search-input-menu-focus-shadow);
    }
  }
}
</style>
