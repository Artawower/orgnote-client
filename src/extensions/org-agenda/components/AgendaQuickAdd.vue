<template>
  <card-wrapper border class="quick-add" :class="{ expanded: isExpanded }">
    <app-flex row align-center gap="xs" class="input-row">
      <app-badge
        :label="targetLabel"
        color="accent"
        size="xs"
        class="target-badge"
        @click="openFileCompletion"
      />

      <org-inline-editor
        ref="titleInputRef"
        v-model="titleText"
        :single-line="true"
        class="title-input"
        :placeholder="t(i18nKeys.orgAgendaQuickAddPlaceholder, { target: inboxLabel })"
        @submit="submitTask"
        @escape="onTitleEscape"
        @expand="expand"
        @update:model-value="onTitleInput"
      />

      <agenda-date-popover v-model="selectedDate">
        <template #default="{ toggle }">
          <div class="date-trigger" @click="toggle">
            <action-button
              icon="sym_o_calendar_today"
              size="sm"
              :active="!!selectedDate"
              :auto-width="true"
              :disable-click-handling="true"
              :aria-label="t(i18nKeys.orgAgendaQuickAddDateTooltip)"
            >
              <template v-if="selectedDate" #text>{{ selectedDateLabel }}</template>
            </action-button>
          </div>
        </template>
      </agenda-date-popover>
    </app-flex>

    <app-flex v-if="isExpanded" column gap="sm">
      <org-inline-editor
        ref="bodyInputRef"
        v-model="bodyText"
        :placeholder="t(i18nKeys.orgAgendaQuickAddBodyPlaceholder)"
        class="body-area"
        @submit="submitTask"
        @escape="onBodyEscape"
      />

      <app-flex row align-center justify="between" class="toolbar">
        <app-flex row align-center gap="xs">
          <action-button
            icon="sym_o_inbox"
            size="sm"
            :aria-label="t(i18nKeys.orgAgendaQuickAddTargetTooltip)"
            @click="openFileCompletion"
          />
          <action-button
            icon="sym_o_flag"
            size="sm"
            :disabled="true"
            :aria-label="t(i18nKeys.orgAgendaQuickAddPriorityTooltip)"
          />
          <action-button
            icon="sym_o_label"
            size="sm"
            :disabled="true"
            :aria-label="t(i18nKeys.orgAgendaQuickAddTagTooltip)"
          />
        </app-flex>

        <app-flex row align-center gap="md">
          <span class="hint">{{ t(i18nKeys.orgAgendaQuickAddShortcutHint) }}</span>
          <app-button type="active" size="sm" :disabled="loading" @click="submitTask">
            {{ t(i18nKeys.orgAgendaQuickAddAddButton) }}
          </app-button>
        </app-flex>
      </app-flex>
    </app-flex>
  </card-wrapper>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { addDays, format } from 'date-fns';
import type { DiskFile } from 'orgnote-api';
import CardWrapper from 'src/components/CardWrapper.vue';
import AppButton from 'src/components/AppButton.vue';
import AppFlex from 'src/components/AppFlex.vue';
import AppBadge from 'src/components/AppBadge.vue';
import ActionButton from 'src/components/ActionButton.vue';
import OrgInlineEditor from 'src/components/OrgInlineEditor.vue';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import { api } from 'src/boot/api';
import { createAgendaFilesGetter } from '../utils/agenda-files-completion';
import { parseQuickAddInput } from '../utils/parse-quick-add-input';
import type { CreateTaskInput } from '../mutations/create-task';
import AgendaDatePopover from './AgendaDatePopover.vue';
import { fileBaseName } from 'src/utils/file-path';

interface Props {
  agendaFilesPath: string;
  inboxFilePath: string;
  knownFiles?: string[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), { loading: false, knownFiles: () => [] });

const emit = defineEmits<{
  submit: [payload: CreateTaskInput & { targetFile?: string }];
}>();

const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const titleInputRef = ref<InstanceType<typeof OrgInlineEditor> | null>(null);
const bodyInputRef = ref<InstanceType<typeof OrgInlineEditor> | null>(null);

const titleText = ref('');
const bodyText = ref('');
const isExpanded = ref(false);
const targetFile = ref<string | undefined>();
const isTildeCompletionOpen = ref(false);
const selectedDate = ref<string | undefined>();

const inboxLabel = computed(() => fileBaseName(props.inboxFilePath));

const targetLabel = computed(() =>
  targetFile.value ? fileBaseName(targetFile.value) : inboxLabel.value,
);

const toIsoDate = (date: Date): string => format(date, 'yyyy-MM-dd');

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return '';
  const today = toIsoDate(new Date());
  const tomorrow = toIsoDate(addDays(new Date(), 1));
  if (selectedDate.value === today) return t(i18nKeys.orgAgendaQuickAddToday);
  if (selectedDate.value === tomorrow) return t(i18nKeys.orgAgendaQuickAddTomorrow);
  return selectedDate.value;
});

const focusBodyAfterRender = async (): Promise<void> => {
  await nextTick();
  await nextTick();
  bodyInputRef.value?.focus?.();
};

const expand = async (): Promise<void> => {
  isExpanded.value = true;
  await focusBodyAfterRender();
};

const openFileCompletion = async (): Promise<void> => {
  const getter = createAgendaFilesGetter(api, props.agendaFilesPath, inboxLabel.value);
  const result = await api.core.useCompletion().open<DiskFile, string>({
    type: 'choice',
    placeholder: t(i18nKeys.orgAgendaQuickAddTargetPlaceholder),
    itemsGetter: getter,
  });
  if (!result) return;
  targetFile.value = result;
  titleInputRef.value?.focus();
};

const openFileCompletionFromTilde = async (tildeIdx: number): Promise<void> => {
  const originalTitle = titleText.value;
  const fragment = titleText.value.slice(tildeIdx + 1);
  const getter = createAgendaFilesGetter(api, props.agendaFilesPath, inboxLabel.value);
  const result = await api.core.useCompletion().open<DiskFile, string>({
    type: 'choice',
    placeholder: t(i18nKeys.orgAgendaQuickAddTargetPlaceholder),
    itemsGetter: getter,
    searchText: fragment,
  });
  if (!result) {
    titleText.value = originalTitle;
    titleInputRef.value?.focus();
    return;
  }
  titleText.value = titleText.value.slice(0, tildeIdx).trimEnd();
  targetFile.value = result;
  titleInputRef.value?.focus();
};

const onTitleInput = (): void => {
  if (isTildeCompletionOpen.value) return;
  const tildeIdx = titleText.value.indexOf('~');
  if (tildeIdx === -1) return;
  isTildeCompletionOpen.value = true;
  openFileCompletionFromTilde(tildeIdx).finally(() => {
    isTildeCompletionOpen.value = false;
  });
};

const isSubmittable = (): boolean => titleText.value.trim().length > 0;

const collectPayload = (): CreateTaskInput & { targetFile?: string } => {
  const parsed = parseQuickAddInput(titleText.value, props.knownFiles);
  const resolvedTarget = targetFile.value ?? parsed.targetFile;
  const body = bodyText.value.trim() || parsed.body;
  return {
    title: parsed.title,
    ...(body ? { body } : {}),
    ...(selectedDate.value ? { scheduledDate: selectedDate.value } : {}),
    ...(resolvedTarget ? { targetFile: resolvedTarget } : {}),
  };
};

const resetState = (): void => {
  titleText.value = '';
  bodyText.value = '';
  isExpanded.value = false;
  targetFile.value = undefined;
  selectedDate.value = undefined;
};

const submitTask = (): void => {
  if (!isSubmittable()) return;
  emit('submit', collectPayload());
  resetState();
  titleInputRef.value?.focus();
};

const onTitleEscape = (): void => {
  titleInputRef.value?.blur?.();
};

const onBodyEscape = (): void => {
  bodyInputRef.value?.blur?.();
};
</script>

<style lang="scss" scoped>
.quick-add {
  padding: var(--padding-sm) var(--padding-md);
  transition: border-color 0.15s ease;

  &:focus-within {
    border-color: var(--accent);
  }
}

.input-row {
  min-height: var(--btn-action-sm-size);
}

.title-input {
  flex: 1;
}

.target-badge {
  cursor: pointer;
  flex-shrink: 0;
}

.date-trigger {
  display: inline-flex;
  cursor: pointer;
}

.body-area {
  min-height: calc(2 * var(--font-size-md) * 1.5 + var(--padding-xs) * 2);
}

.toolbar {
  padding-top: var(--gap-xs);
  border-top: var(--border-default);
}

.hint {
  font-size: var(--font-size-xs);
  color: var(--fg-muted);
}
</style>
