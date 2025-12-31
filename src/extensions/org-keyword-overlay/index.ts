import type { Extension, WidgetMeta } from 'orgnote-api';
import { WidgetType } from 'orgnote-api';
import { NodeType, type OrgNode } from 'org-mode-ast';
import { keywordKeymapExtension } from './keyword-keymap';
import { getKeywordName, isSupportedKeyword, getKeywordValue } from './utils';
import { KEYWORD_PLACEHOLDERS, SUPPORTED_KEYWORDS } from './constants';
import { applyCSSVariables, resetCSSVariables } from 'src/utils/css-utils';
import styles from './styles.css?raw';

const WIDGET_PREFIX_ID = 'keyword-overlay-prefix';
const LINE_CLASS_ID = 'keyword-overlay-line';
const SCOPE_ID = 'org-keyword-overlay';
const WIDGET_PRIORITY = 100;

const isKeywordPrefix = (orgNode: OrgNode): boolean => {
  const parent = orgNode.parent;
  if (!parent?.is(NodeType.Keyword)) return false;

  const isFirstChild = parent.children?.first === orgNode;
  if (!isFirstChild) return false;

  const keywordName = getKeywordName(parent);
  return isSupportedKeyword(keywordName);
};

const keywordPrefixWidget: WidgetMeta = {
  id: WIDGET_PREFIX_ID,
  type: WidgetType.Inline,
  nodeType: NodeType.Text,
  decorationType: 'replace',
  satisfied: isKeywordPrefix,
  widgetBuilder: () => ({ destroy: () => {} }),
  ignoreEditing: true,
  priority: WIDGET_PRIORITY,
};

const keywordLineClass: WidgetMeta = {
  id: LINE_CLASS_ID,
  type: WidgetType.LineClass,
  nodeType: NodeType.Keyword,
  class: (orgNode: OrgNode) => {
    const keywordName = getKeywordName(orgNode);
    if (!isSupportedKeyword(keywordName)) return '';

    const value = getKeywordValue(orgNode);
    const isEmpty = value.trim() === '';
    return `keyword-overlay keyword-${keywordName}${isEmpty ? ' keyword-empty' : ''}`;
  },
  priority: WIDGET_PRIORITY,
};

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

const PLACEHOLDER_VARIABLES: Record<string, string> = Object.fromEntries(
  SUPPORTED_KEYWORDS.map((k) => [`keywordPlaceholder${capitalize(k)}`, `"${KEYWORD_PLACEHOLDERS[k]}"`])
);

const PLACEHOLDER_VARIABLE_NAMES = Object.keys(PLACEHOLDER_VARIABLES);

export const orgKeywordOverlayExtension: Extension = {
  onMounted: async (api) => {
    api.utils.applyScopedStyles(SCOPE_ID, styles);
    applyCSSVariables(PLACEHOLDER_VARIABLES);

    const { addWidgets, addExtensions } = api.core.useEditor();
    addWidgets(keywordPrefixWidget, keywordLineClass);
    addExtensions(keywordKeymapExtension);
  },

  onUnmounted: async (api) => {
    api.utils.removeScopedStyles(SCOPE_ID);
    resetCSSVariables(PLACEHOLDER_VARIABLE_NAMES);

    const { removeWidget, removeExtensions } = api.core.useEditor();
    removeWidget(WIDGET_PREFIX_ID);
    removeWidget(LINE_CLASS_ID);
    removeExtensions(keywordKeymapExtension);
  },
};

export { orgKeywordOverlayManifest } from './manifest';
