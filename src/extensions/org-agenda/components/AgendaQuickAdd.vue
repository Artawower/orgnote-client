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

      <org-tags
        v-if="parsedTags.length"
        :tags="parsedTags"
        :clickable="false"
        badge-size="xs"
        class="tags-row"
      />

      <app-input
        ref="titleInputRef"
        v-model="titleText"
        class="title-input"
        :placeholder="t(i18nKeys.orgAgendaQuickAddPlaceholder, { target: inboxLabel })"
        @keydown="onTitleKeydown"
        @input="onTitleInput"
      />

      <agenda-date-popover v-model="selectedDate">
        <template #default="{ toggle }">
          <div class="date-trigger" @click="toggle">
            <action-button
              icon="sym_o_calendar_today"
              size="sm"
              :active="!!selectedDate"
              :disable-click-handling="true"
              :aria-label="t(i18nKeys.orgAgendaQuickAddDateTooltip)"
            >
              <template v-if="selectedDate" #text>{{ selectedDateLabel }}</template>
            </action-button>
          </div>
        </template>
      </agenda-date-popover>
    </app-flex>

    <template v-if="isExpanded">
      <app-text-area
        ref="bodyInputRef"
        v-model="bodyText"
        :placeholder="t(i18nKeys.orgAgendaQuickAddBodyPlaceholder)"
        class="body-area"
        @keydown="onBodyKeydown"
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

        <app-flex row align-center gap="xs">
          <span class="hint">{{ t(i18nKeys.orgAgendaQuickAddShortcutHint) }}</span>
          <app-button type="active" :disabled="loading" @click="submitTask">
            {{ t(i18nKeys.orgAgendaQuickAddAddButton) }}
          </app-button>
        </app-flex>
      </app-flex>
    </template>
  </card-wrapper>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { addDays, format } from 'date-fns';
import type { DiskFile } from 'orgnote-api';
import CardWrapper from 'src/components/CardWrapper.vue';
import AppInput from 'src/components/AppInput.vue';
import AppButton from 'src/components/AppButton.vue';
import AppFlex from 'src/components/AppFlex.vue';
import AppBadge from 'src/components/AppBadge.vue';
import OrgTags from 'src/components/org-nodes/OrgTags.vue';
import ActionButton from 'src/components/ActionButton.vue';
import AppTextArea from 'src/containers/AppTextArea.vue';
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

const titleInputRef = ref<InstanceType<typeof AppInput> | null>(null);
const bodyInputRef = ref<InstanceType<typeof AppTextArea> | null>(null);

const titleText = ref('');
const bodyText = ref('');
const isExpanded = ref(false);
const targetFile = ref<string | undefined>();
const selectedDate = ref<string | undefined>();

const inboxLabel = computed(() => fileBaseName(props.inboxFilePath));

const targetLabel = computed(() =>
  targetFile.value ? fileBaseName(targetFile.value) : inboxLabel.value,
);

const parsedTags = computed(() => {
  const parsed = parseQuickAddInput(titleText.value, []);
  return parsed.tags ?? [];
});

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
  bodyInputRef.value?.focus();
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
  const tildeIdx = titleText.value.indexOf('~');
  if (tildeIdx === -1) return;
  void openFileCompletionFromTilde(tildeIdx);
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
    ...(parsed.tags?.length ? { tags: parsed.tags } : {}),
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

const onTitleKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    e.preventDefault();
    (e.target as HTMLElement).blur();
    return;
  }
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    submitTask();
    return;
  }
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    void expand();
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    submitTask();
    return;
  }
  if (e.key === 'Backspace' && titleText.value === '' && targetFile.value) {
    targetFile.value = undefined;
  }
};

const onBodyKeydown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    e.preventDefault();
    (e.target as HTMLElement).blur();
    return;
  }
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault();
    submitTask();
  }
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
  min-height: 32px;
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

.tags-row {
  flex-shrink: 0;
}

.body-area {
  margin-top: var(--gap-xs);
  min-height: calc(2 * var(--font-size-md) * 1.5 + var(--padding-xs) * 2);
}

.toolbar {
  margin-top: var(--gap-sm);
  padding-top: var(--gap-xs);
  border-top: 1px solid var(--border);
}

.hint {
  font-size: var(--font-size-xs);
  color: var(--fg-muted);
}
</style>
