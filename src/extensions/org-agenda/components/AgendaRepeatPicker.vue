<template>
  <app-popover ref="popoverRef" :breakpoint="0" class="repeat-popover">
    <template #default="{ toggle }">
      <app-flex
        row
        between
        align-center
        gap="sm"
        class="repeat-row repeat-trigger"
        role="button"
        tabindex="0"
        @click="toggle"
        @keydown.enter.prevent="toggle"
        @keydown.space.prevent="toggle"
      >
        <app-flex row align-center gap="sm">
          <span class="icon-wrap">
            <app-icon name="sym_o_repeat" size="sm" />
          </span>
          <span>{{ t(i18nKeys.orgAgendaScheduleRepeat) }}</span>
        </app-flex>
        <app-flex row align-center gap="xs">
          <span class="repeat-label">{{ selectedLabel }}</span>
          <app-icon name="sym_o_keyboard_arrow_down" size="sm" />
        </app-flex>
      </app-flex>
    </template>

    <template #content>
      <app-flex column align-stretch gap="xs" class="repeat-menu">
        <app-flex
          v-for="preset in repeatPresets"
          :key="preset.key"
          row
          between
          align-center
          gap="sm"
          class="repeat-row repeat-option"
          :class="{ selected: isSelected(preset) }"
          role="button"
          tabindex="0"
          @click="selectPreset(preset)"
          @keydown.enter.prevent="selectPreset(preset)"
          @keydown.space.prevent="selectPreset(preset)"
        >
          <app-flex row align-center gap="sm">
            <span class="option-dot" />
            <span>{{ t(i18nKeys[preset.labelKey]) }}</span>
          </app-flex>
          <app-icon v-if="isSelected(preset)" name="sym_o_check" size="sm" color="accent" />
        </app-flex>
      </app-flex>
    </template>
  </app-popover>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { OrgRepeater } from 'org-mode-ast';
import AppFlex from 'src/components/AppFlex.vue';
import AppIcon from 'src/components/AppIcon.vue';
import AppPopover from 'src/components/AppPopover.vue';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';

interface RepeatPreset {
  key: string;
  labelKey: keyof typeof i18nKeys;
  repeater?: OrgRepeater;
}

const model = defineModel<OrgRepeater | undefined>();
const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const popoverRef = ref<InstanceType<typeof AppPopover> | null>(null);

const repeatPresets: RepeatPreset[] = [
  { key: 'none', labelKey: 'orgAgendaScheduleRepeatNone' },
  {
    key: 'daily',
    labelKey: 'orgAgendaScheduleRepeatDaily',
    repeater: { type: '+', value: 1, unit: 'd' },
  },
  {
    key: 'weekly',
    labelKey: 'orgAgendaScheduleRepeatWeekly',
    repeater: { type: '+', value: 1, unit: 'w' },
  },
  {
    key: 'monthly',
    labelKey: 'orgAgendaScheduleRepeatMonthly',
    repeater: { type: '+', value: 1, unit: 'm' },
  },
  {
    key: 'yearly',
    labelKey: 'orgAgendaScheduleRepeatYearly',
    repeater: { type: '+', value: 1, unit: 'y' },
  },
];

const matchesRepeater = (
  left: OrgRepeater | undefined,
  right: OrgRepeater | undefined,
): boolean => {
  if (!left || !right) return left === right;
  return left.type === right.type && left.value === right.value && left.unit === right.unit;
};

const isSelected = (preset: RepeatPreset): boolean => matchesRepeater(model.value, preset.repeater);

const selectPreset = (preset: RepeatPreset): void => {
  model.value = preset.repeater;
  popoverRef.value?.close();
};

const selectedLabel = computed(() => {
  const selected = repeatPresets.find(isSelected);
  if (selected) return t(i18nKeys[selected.labelKey]);
  const repeater = model.value;
  if (!repeater) return t(i18nKeys.orgAgendaScheduleRepeatNone);
  return `${repeater.type}${repeater.value}${repeater.unit}`;
});
</script>

<style lang="scss" scoped>
.repeat-popover {
  width: 100%;
}

.repeat-row {
  @include interactive-no-select;
  @include fontify(var(--font-size-sm), normal, var(--fg));

  min-height: var(--menu-item-height-sm);
  padding: var(--padding-sm) var(--padding-md);
  border-radius: var(--menu-item-radius);
  cursor: pointer;

  &:hover,
  &:focus-visible {
    background: var(--bg-hover);
    outline: none;
  }
}

.repeat-trigger {
  width: 100%;
  background: transparent;
}

.icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--btn-action-sm-size);
  height: var(--btn-action-sm-size);
  color: var(--accent);
}

.repeat-label {
  color: var(--fg-muted);
}

.repeat-menu {
  box-sizing: border-box;
  width: calc(var(--date-picker-sheet-width, 320px) - var(--padding-md));
  padding: var(--padding-xs) 0;
  border: var(--border-default);
  border-radius: var(--floating-border-radius);
  background: var(--bg);
  box-shadow: var(--floating-box-shadow);
}

.repeat-option.selected {
  color: var(--accent);
}

.option-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: currentColor;
  opacity: 0.45;
}
</style>
