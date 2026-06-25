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
  getPreviewItems,
  KNOWN_PROPERTY_KEYS,
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

interface FocusableControl {
  focus: () => void;
}

type FocusableRefValue = FocusableControl | FocusableControl[] | undefined;
type KeyInputValue = string | string[] | null | undefined;
type TextInputValue = string | undefined;
type TextInputEvent = Event & { target: HTMLTextAreaElement };

const toSingleKey = (value: KeyInputValue): string | undefined => {
  if (typeof value !== 'string') return undefined;
  return value.trim();
};

const toTextValue = (value: TextInputValue): string => value ?? '';
const isTextInputEvent = (event: Event): event is TextInputEvent =>
  event.target instanceof HTMLTextAreaElement;

export const usePropertyDrawer = (props: Props) => {
  const { t } = useI18n({ useScope: 'global', inheritLocale: true });
  const isAdding = ref(false);
  const draftKey = ref('');
  const draftValue = ref('');
  const error = ref('');
  const refreshTick = ref(0);
  const panelStateTick = ref(0);
  const pendingReplaceTimeout = ref<number>();
  const addKeyInputRef = ref<FocusableControl>();
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
    pendingReplaceTimeout.value = replacePropertyItems(
      props.editorView,
      props.node,
      nextItems,
      refreshState,
    );
  };

  const setValue = (key: string, value: TextInputValue): void => {
    if (props.readonly) return;
    const nextValue = toTextValue(value);
    const valueError = validatePropertyValue(nextValue);
    error.value = valueError ? t(valueError) : '';
    if (valueError) return;
    mutateItems(upsertItem(items.value, key, nextValue));
  };

  const setKey = (item: OrgPropertyEntry, value: KeyInputValue): void => {
    if (props.readonly) return;
    const key = toSingleKey(value);
    if (key === undefined) return;
    const keyError = validatePropertyKey(key, items.value, item.key);
    error.value = keyError ? t(keyError) : '';
    if (keyError || key === item.key) return;
    mutateItems(renameItem(items.value, item.key, key));
  };

  const setValueFromEvent = (key: string, event: Event): void => {
    if (!isTextInputEvent(event)) return;
    setValue(key, event.target.value);
  };

  const focusControl = (control: FocusableRefValue): void => {
    const target = Array.isArray(control) ? control[0] : control;
    target?.focus?.();
  };

  const focusValueInput = (): void => {
    void nextTick(() => focusControl(valueInputRef.value));
  };

  const startAdd = (): void => {
    if (props.readonly) return;
    isAdding.value = true;
    draftKey.value = '';
    draftValue.value = '';
    error.value = '';
    expandPropertyPanel(scope.value, stateKey.value);
    refreshPanelState();
    void nextTick(() => focusControl(addKeyInputRef.value));
  };

  const cancelEdit = (): void => {
    isAdding.value = false;
    error.value = '';
  };

  const commitEdit = (): void => {
    if (props.readonly || !isAdding.value) return;
    const keyError = validatePropertyKey(draftKey.value, items.value);
    const valueError = validatePropertyValue(draftValue.value);
    const validationError = keyError ?? valueError;
    error.value = validationError ? t(validationError) : '';
    if (validationError) return;
    mutateItems(upsertItem(items.value, draftKey.value.trim(), draftValue.value));
    cancelEdit();
  };

  const onAddPropertyEvent = (event: Event): void => {
    const detail = (event as CustomEvent<AddPropertyEventDetail>).detail;
    if (detail.scope !== scope.value || detail.key !== stateKey.value) return;
    startAdd();
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
    items,
    knownPropertyKeys: [...KNOWN_PROPERTY_KEYS],
    previewText,
    readonly: props.readonly,
    removeProperty: (key: string) => mutateItems(removeItem(items.value, key)),
    scope,
    setKey,
    setValueFromEvent,
    startAdd,
    togglePanel: () => {
      togglePropertyPanel(scope.value, stateKey.value);
      refreshPanelState();
    },
    valueComponent,
    valueInputRef,
  };
};
