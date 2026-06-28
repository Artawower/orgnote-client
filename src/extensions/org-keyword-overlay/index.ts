import type { Extension, WidgetMeta } from 'orgnote-api';
import { WidgetType } from 'orgnote-api';
import { NodeType, type OrgNode } from 'org-mode-ast';
import OrgKeywordEditor from './OrgKeywordEditor.vue';
import { getKeywordName } from './utils';

const TITLE_WIDGET_ID = 'org-keyword-title-editor';
const DESCRIPTION_WIDGET_ID = 'org-keyword-description-editor';

const WIDGET_PRIORITY = 100;

const isKeyword = (name: string): ((orgNode: OrgNode) => boolean) =>
  (orgNode: OrgNode): boolean => getKeywordName(orgNode) === name;

const buildKeywordWidget = (id: string, keywordName: string): WidgetMeta => ({
  id,
  type: WidgetType.Multiline,
  nodeType: NodeType.Keyword,
  satisfied: isKeyword(keywordName),
  component: OrgKeywordEditor,
  componentProps: { variant: keywordName === 'title' ? 'title' : 'description' },
  ignoreEvent: true,
  suppressEdit: true,
  showEditAction: true,
  priority: WIDGET_PRIORITY,
});

const titleWidget = buildKeywordWidget(TITLE_WIDGET_ID, 'title');
const descriptionWidget = buildKeywordWidget(DESCRIPTION_WIDGET_ID, 'description');

export const orgKeywordOverlayExtension: Extension = {
  onMounted: async (api) => {
    const { addWidgets } = api.core.useEditor();
    addWidgets(titleWidget, descriptionWidget);
  },

  onUnmounted: async (api) => {
    const { removeWidget } = api.core.useEditor();
    removeWidget(TITLE_WIDGET_ID);
    removeWidget(DESCRIPTION_WIDGET_ID);
  },
};

export { orgKeywordOverlayManifest } from './manifest';