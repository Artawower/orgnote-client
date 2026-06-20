import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { OrgNode } from 'org-mode-ast';
import type { EditorView } from '@codemirror/view';
import type { OrgPropertyEntry } from 'orgnote-api';
import { I18N } from 'orgnote-api';
import {
  ADD_PROPERTY_EVENT,
  getPropertyEditorState,
  getPropertyScope,
  getPropertyStateKey,
  replacePropertyItems,
  type AddPropertyEventDetail,
} from './property-source';
import {
  formatTags,
  getPreviewItems,
  KNOWN_PROPERTY_KEYS,
  parseTags,
  validatePropertyKey,
  validatePropertyValue,
} from './property-model';
import {
  expandPropertyPanel,
  isPropertyPanelCollapsed,
  togglePropertyPanel,
} from './property-panel-state';
import {
  formatPreviewItem,
  iconByKey,
  removeItem,
  renameItem,
  upsertItem,
  valueComponent,
} from './property-item-helpers';

interface Props {
  readonly node: OrgNode;
  readonly editorView: EditorView;
  readonly rootNodeSrc: string;
  readonly readonly?: boolean;
}

interface EditingState {
  readonly mode: 'add' | 'edit';
  readonly originalKey?: string;
}

interface FocusableControl {
  focus: () => void;
}

type FocusableRefValue = FocusableControl | FocusableControl[] | undefined;

export const usePropertyDrawer = (props: Props) => {
  const { t } = useI18n({ useScope: 'global', inheritLocale: true });
  const editing = ref<EditingState>();
  const draftKey = ref('');
  const draftValue = ref('');
  const error = ref('');
  const refreshTick = ref(0);
  const panelStateTick = ref(0);
  const pendingReplaceTimeout = ref<number>();
  const addKeyInputRef = ref<FocusableControl>();
  const keyInputRef = ref<FocusableControl>();
  const valueInputRef = ref<FocusableControl>();
  const stateKey = computed(() => getPropertyStateKey(props.node));
  const scope = computed(() => getPropertyScope(props.node));
  const anchor = computed(() => props.node.start);

  const state = computed(() =>
    getPropertyEditorState(
      props.editorView,
      scope.value,
      anchor.value,
      `${stateKey.value}:${refreshTick.value}`,
      props.node,
    ),
  );
  const items = computed(() => state.value.items);
  const isEmpty = computed(() => items.value.length === 0);
  const canCollapse = computed(() => !isEmpty.value);
  const isAdding = computed(() => editing.value?.mode === 'add');

  const isCollapsed = computed(() => {
    if (panelStateTick.value < 0) return false;
    return isPropertyPanelCollapsed(scope.value, stateKey.value, isEmpty.value);
  });

  const collapseIcon = computed(() =>
    isCollapsed.value ? 'sym_o_expand_more' : 'sym_o_expand_less',
  );

  const previewText = computed(() => {
    const previewItems = getPreviewItems(items.value);
    const preview = previewItems.map(formatPreviewItem).join(' · ');
    const hiddenCount = Math.max(0, items.value.length - previewItems.length);
    return [t(I18N.PROPERTIES), preview, hiddenCount ? `+${hiddenCount}` : '']
      .filter(Boolean)
      .join(' · ');
  });

  const refreshState = (): void => {
    refreshTick.value += 1;
  };

  const refreshPanelState = (): void => {
    panelStateTick.value += 1;
  };

  const clearPendingReplace = (): void => {
    if (pendingReplaceTimeout.value === undefined) return;
    window.clearTimeout(pendingReplaceTimeout.value);
    pendingReplaceTimeout.value = undefined;
  };

  const mutateItems = (nextItems: readonly OrgPropertyEntry[]): void => {
    clearPendingReplace();
    pendingReplaceTimeout.value = replacePropertyItems(props.editorView, props.node, nextItems);
    refreshState();
  };

  const setValue = (key: string, value: string): void => {
    if (props.readonly) return;
    const valueError = validatePropertyValue(value);
    if (valueError) {
      error.value = t(valueError);
      return;
    }
    mutateItems(upsertItem(items.value, key, value));
  };

  const focusValueInput = (): void => {
    void nextTick(() => focusControl(valueInputRef.value));
  };

  const focusControl = (control: FocusableRefValue): void => {
    const target = Array.isArray(control) ? control[0] : control;
    target?.focus?.();
  };

  const startAdd = (): void => {
    if (props.readonly) return;
    editing.value = { mode: 'add' };
    draftKey.value = '';
    draftValue.value = '';
    error.value = '';
    expandPropertyPanel(scope.value, stateKey.value);
    refreshPanelState();
    void nextTick(() => focusControl(addKeyInputRef.value));
  };

  const cancelEdit = (): void => {
    editing.value = undefined;
    error.value = '';
  };

  const commitValidEdit = (current: EditingState, key: string, value: string): void => {
    const renamedItems = renameItem(items.value, current.originalKey, key);
    mutateItems(upsertItem(renamedItems, key, value));
    cancelEdit();
  };

  const commitEdit = (): void => {
    if (props.readonly) return;
    const current = editing.value;
    if (!current) return;
    const keyError = validatePropertyKey(draftKey.value, items.value, current.originalKey);
    const valueError = validatePropertyValue(draftValue.value);
    const validationError = keyError ?? valueError;
    error.value = validationError ? t(validationError) : '';
    if (validationError) return;
    commitValidEdit(current, draftKey.value.trim(), draftValue.value);
  };

  const onAddPropertyEvent = (event: Event): void => {
    const detail = (event as CustomEvent<AddPropertyEventDetail>).detail;
    if (detail.scope !== scope.value || detail.key !== stateKey.value) return;
    startAdd();
  };

  const removeTag = (item: OrgPropertyEntry, tag: string): void => {
    const tags = parseTags(item.value).filter((value) => value !== tag);
    setValue(item.key, formatTags(tags));
  };

  const addTag = (item: OrgPropertyEntry, tag: string): void => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    setValue(item.key, formatTags([...parseTags(item.value), trimmed]));
  };

  const startTextEdit = (item: OrgPropertyEntry, focusTarget: 'key' | 'value' = 'value'): void => {
    if (props.readonly) return;
    editing.value = { mode: 'edit', originalKey: item.key };
    draftKey.value = item.key;
    draftValue.value = item.value;
    error.value = '';
    const ref = focusTarget === 'key' ? keyInputRef.value : valueInputRef.value;
    void nextTick(() => focusControl(ref));
  };

  watch(() => props.rootNodeSrc, refreshState);
  onMounted(() => {
    window.addEventListener(ADD_PROPERTY_EVENT, onAddPropertyEvent);
    if (isEmpty.value && !props.readonly) startAdd();
  });
  onBeforeUnmount(() => {
    clearPendingReplace();
    window.removeEventListener(ADD_PROPERTY_EVENT, onAddPropertyEvent);
  });

  const expandPanel = (): void => {
    expandPropertyPanel(scope.value, stateKey.value);
    refreshPanelState();
  };

  return {
    addKeyInputRef,
    addTag,
    canCollapse,
    cancelEdit,
    collapseIcon,
    commitEdit,
    draftKey,
    draftValue,
    error,
    expandPanel,
    focusValueInput,
    iconByKey,
    isAdding,
    isCollapsed,
    isEditingKey: (key: string) => editing.value?.originalKey === key,
    items,
    keyInputRef,
    knownPropertyKeys: [...KNOWN_PROPERTY_KEYS],
    previewText,
    readonly: props.readonly,
    removeProperty: (key: string) => mutateItems(removeItem(items.value, key)),
    removeTag,
    scope,
    setValue,
    startAdd,
    startTextEdit,
    togglePanel: () => {
      togglePropertyPanel(scope.value, stateKey.value);
      refreshPanelState();
    },
    valueComponent,
    valueInputRef,
  };
};
