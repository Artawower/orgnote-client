<template>
  <context-menu :group="AGENDA_TASK_CONTEXT_MENU_GROUP" :data="task">
    <menu-item :capitalize="false" :lines="1" class="task-row">
      <app-flex row align-center gap="sm" class="task-content" @click.stop>
        <app-checkbox :model-value="isChecked" :class="priorityClass" @change="onCheckboxChange" />
        <org-inline-editor
          v-model="localTitle"
          :single-line="true"
          :readonly="false"
          class="title-editor"
          @submit="onTitleSubmit"
          @blur="onTitleSubmit"
        />
      </app-flex>

      <template #right>
        <app-flex row align-center gap="xs" class="task-meta" @click.stop>
          <action-button
            icon="sym_o_flag"
            size="md"
            :active="!!task.priority"
            :class="priorityClass"
            :aria-label="t(i18nKeys.orgAgendaQuickAddPriorityTooltip)"
            @click="onPriorityClick"
          />
          <org-tags
            v-if="task.tags?.length"
            :tags="task.tags"
            badge-size="xs"
            :clickable="true"
            :wrap="false"
            :max-visible="2"
            :search-on-click="false"
            @tag-click="onTagClick"
          />
          <agenda-date-button v-model="localDate" class="date-picker" />
          <action-button
            icon="sym_o_expand_more"
            size="md"
            :aria-label="t(i18nKeys.orgAgendaQuickAddBodyPlaceholder)"
            @click="$emit('edit-expand')"
          />
          <command-action-button
            :command="AGENDA_POMODORO_START_COMMAND"
            :data="task"
            size="md"
          />
          <action-button
            icon="sym_o_open_in_new"
            size="md"
            :aria-label="t(i18nKeys.orgAgendaOpenNote)"
            @click="$emit('open-note')"
          />
        </app-flex>
      </template>
    </menu-item>
  </context-menu>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { isNullable } from 'orgnote-api/utils';
import MenuItem from 'src/containers/MenuItem.vue';
import ContextMenu from 'src/components/ContextMenu.vue';
import { AGENDA_TASK_CONTEXT_MENU_GROUP } from '../constants';
import AppFlex from 'src/components/AppFlex.vue';
import AppCheckbox from 'src/components/AppCheckbox.vue';
import AgendaDateButton from './AgendaDateButton.vue';
import OrgTags from 'src/components/org-nodes/OrgTags.vue';
import OrgInlineEditor from 'src/components/OrgInlineEditor.vue';
import ActionButton from 'src/components/ActionButton.vue';
import CommandActionButton from 'src/containers/CommandActionButton.vue';
import { AGENDA_POMODORO_START_COMMAND } from '../constants';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import { api } from 'src/boot/api';
import { openOrgPriorityCompletion } from 'src/utils/org-priority-completion';
import { openOrgTagCompletion } from 'src/utils/org-tag-completion';
import {
  extractPriorityFromTitle,
  removePriorityFromTitle,
} from 'src/utils/org-editor/org-title-parser';
import { buildTaskEditorTitle } from 'src/utils/org-editor/build-task-title';

import type { AgendaTaskView } from '../composables/use-agenda-tasks';
import { getActiveDate, hasRepeater, isCompletedOn } from '../utils/agenda-filters';

const props = defineProps<{ task: AgendaTaskView }>();
const emit = defineEmits<{
  toggle: [];
  'open-note': [];
  'edit-title': [newTitle: string];
  'edit-priority': [priority: string | undefined];
  'edit-tags': [tags: string[]];
  'edit-scheduled': [date: string | undefined];
  'edit-expand': [];
}>();

const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const localTitle = ref(buildTaskEditorTitle(props.task.text, props.task.priority));
const localDate = ref<string | undefined>(getActiveDate(props.task) ?? undefined);

watch(
  () => props.task.scheduled,
  () => {
    localDate.value = getActiveDate(props.task) ?? undefined;
  },
);

watch(localDate, (date) => emit('edit-scheduled', date ?? undefined));

watch(
  () => [props.task.text, props.task.priority] as const,
  ([text, priority]) => {
    localTitle.value = buildTaskEditorTitle(text, priority);
  },
);

const priorityClass = computed(() =>
  props.task.priority ? `priority-${props.task.priority.toLowerCase()}` : '',
);

const isChecked = computed(
  () =>
    props.task.state === 'done' ||
    (hasRepeater(props.task) && isCompletedOn(props.task, props.task.viewDate)),
);

const onCheckboxChange = (): void => emit('toggle');

const onTitleSubmit = (): void => {
  const trimmed = localTitle.value.trim();
  const cleanTitle = removePriorityFromTitle(trimmed);
  const extractedPriority = extractPriorityFromTitle(trimmed)?.letter;

  if (cleanTitle && cleanTitle !== props.task.text) emit('edit-title', cleanTitle);
  if (extractedPriority !== props.task.priority) emit('edit-priority', extractedPriority);
};

const onPriorityClick = async (): Promise<void> => {
  const result = await openOrgPriorityCompletion(api, t);
  if (isNullable(result)) return;
  emit('edit-priority', result || undefined);
};

const onTagClick = async (tag: string): Promise<void> => {
  const newTag = await openOrgTagCompletion(api, t, tag);
  if (isNullable(newTag)) return;
  const updatedTags = (props.task.tags ?? []).map((t) => (t === tag ? newTag : t));
  emit('edit-tags', newTag ? updatedTags : updatedTags.filter((t) => t !== tag));
};
</script>

<style lang="scss" scoped>
@include org-priority-colors(--checkbox-color);

.task-content {
  flex: 1;
  min-width: 0;
}

.title-editor {
  flex: 1;
  min-width: 0;

  :deep(.cm-line) {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  :deep(.cm-content) {
    text-decoration: v-bind("isChecked ? 'line-through' : 'none'");
    color: v-bind("isChecked ? 'var(--fg-muted)' : 'inherit'");
  }
}

.task-meta {
  @include fontify(var(--font-size-xs), normal, var(--fg-muted));

  :deep(.date-picker) {
    font-size: initial;
    color: initial;
  }
}
</style>
