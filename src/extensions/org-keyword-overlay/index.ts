import type { Extension, WidgetMeta } from 'orgnote-api';
import { WidgetType } from 'orgnote-api';
import { NodeType, type OrgNode } from 'org-mode-ast';
import OrgKeywordEditor from './OrgKeywordEditor.vue';
import { descriptionLineDecorationExtension } from './description-line-decoration';
import { keywordNavigationExtension } from './keyword-navigation';
import { getKeywordName } from './utils';

const TITLE_WIDGET_ID = 'org-keyword-title-editor';
const WIDGET_PRIORITY = 100;

const isKeyword = (name: string): ((orgNode: OrgNode) => boolean) =>
  (orgNode: OrgNode): boolean => getKeywordName(orgNode) === name;

const buildKeywordWidget = (id: string, keywordName: string): WidgetMeta => ({
  id,
  type: WidgetType.Multiline,
  nodeType: NodeType.Keyword,
  satisfied: isKeyword(keywordName),
  component: OrgKeywordEditor,
  ignoreEvent: true,
  suppressEdit: true,
  priority: WIDGET_PRIORITY,
});

const titleWidget = buildKeywordWidget(TITLE_WIDGET_ID, 'title');

export const orgKeywordOverlayExtension: Extension = {
  onMounted: async (api) => {
    const { addExtensions, addWidgets } = api.core.useEditor();
    addWidgets(titleWidget);
    addExtensions(keywordNavigationExtension, descriptionLineDecorationExtension);
  },

  onUnmounted: async (api) => {
    const { removeExtensions, removeWidget } = api.core.useEditor();
    removeWidget(TITLE_WIDGET_ID);
    removeExtensions(keywordNavigationExtension, descriptionLineDecorationExtension);
  },
};

export { orgKeywordOverlayManifest } from './manifest';