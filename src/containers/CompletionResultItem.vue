<template>
  <app-flex
    class="group-title"
    v-if="'groupTitle' in item"
    direction="row"
    justify="center"
    align="center"
  >
    {{ item.groupTitle }}
  </app-flex>
  <app-flex
    v-else
    :key="resolvedTitle"
    class="completion-item"
    :class="{ selected }"
    @click="executeCompletionItem"
    @mouseover="
      (e: MouseEvent) =>
        focusCompletionCandidate(e, (item as IndexedCompletionCandidate).index || index)
    "
    direction="row"
    justify="start"
    align="center"
    gap="md"
  >
    <component v-if="iconComponent" :is="iconComponent" size="sm" />
    <app-icon v-else-if="iconString" :name="iconString" size="sm" />
    <div class="text-medium color-main">
      <div class="line-limit-1">
        {{ resolvedTitle }}
      </div>
    </div>
    <div>
      <span class="text-italic color-secondary line-limit-1">
        {{ resolvedDescription }}
      </span>
    </div>
  </app-flex>
</template>

<script lang="ts" setup>
import { computed, toValue } from 'vue';
import { api } from 'src/boot/api';
import AppIcon from 'src/components/AppIcon.vue';
import type {
  GroupedCompletionCandidate,
  IndexedCompletionCandidate,
} from 'src/models/grouped-completion-candidate';
import AppFlex from 'src/components/AppFlex.vue';
import { useResolvedIcon } from 'src/composables/use-resolved-icon';

const props = defineProps<{
  item: GroupedCompletionCandidate;
  selected?: boolean;
  index: number;
}>();

const emit = defineEmits<{
  select: [];
}>();

const resolvedTitle = computed(() =>
  'groupTitle' in props.item ? undefined : toValue(props.item.title),
);

const { iconString, iconComponent } = useResolvedIcon(
  computed(() => ('groupTitle' in props.item ? undefined : toValue(props.item.icon))),
);

const resolvedDescription = computed(() =>
  'groupTitle' in props.item ? undefined : toValue(props.item.description),
);

const completion = api.core.useCompletion();

let lastCoords = [0, 0];
const applyCandidateToInput = (index: number) => {
  const activeCompletion = completion.activeCompletion;
  if (!activeCompletion) {
    return;
  }

  const candidate = activeCompletion.candidates?.[index];
  if (!candidate) {
    return;
  }

  activeCompletion.selectedCandidateIndex = index;

  if (activeCompletion.type === 'choice') {
    candidate.commandHandler?.(candidate.data);
    emit('select');
    return;
  }

  const candidateTitle = toValue(candidate.title);
  if (typeof candidateTitle === 'string') {
    activeCompletion.searchQuery = candidateTitle;
    emit('select');
  }
};

const focusCompletionCandidate = (e: MouseEvent, index: number) => {
  const coordsChanged = lastCoords[0] !== e.clientX || lastCoords[1] !== e.clientY;

  if (!coordsChanged) {
    return;
  }
  lastCoords = [e.clientX, e.clientY];
  const activeCompletion = completion.activeCompletion;
  if (!activeCompletion) {
    return;
  }
  activeCompletion.selectedCandidateIndex = index;
};

const executeCompletionItem = async (e: MouseEvent) => {
  if ('groupTitle' in props.item) return;
  e.preventDefault();
  e.stopPropagation();
  if (!completion.activeCompletion) return;

  applyCandidateToInput(props.index);
};
</script>

<style lang="scss" scoped>
.completion-item {
  & {
    height: 100%;
    cursor: pointer;
    border-radius: var(--completion-item-radius);
    padding: var(--completion-item-padding);
  }

  &.selected {
    background: color-mix(in srgb, var(--fg), var(--bg) 90%);
  }

  @include hover {
    background: color-mix(in srgb, var(--fg), var(--bg) 90%);
  }

  &:active {
    background: color-mix(in srgb, var(--fg), var(--bg) 90%);
  }
}

.group-title {
  & {
    height: 100%;
    font-weight: bold;
    color: var(--fg-muted);
    background: var(--bg-elevated);
    user-select: none;
  }

  /* &::before,
     &::after {
     content: '';
     flex: 1;
     border-bottom: var(--border-default);
     margin: 0 10px;
     } */
}
</style>
