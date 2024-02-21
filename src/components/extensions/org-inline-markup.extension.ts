import {
  Extension,
  ExtensionManifest,
  OrgNoteApi,
  WidgetType,
} from 'orgnote-api';
import { NodeType, OrgNode } from 'org-mode-ast';
import OrgLatexBlock from './OrgLatexBlock.vue';
import OrgInvisible from './OrgInvisible.vue';
import OrgListTag from './OrgListTag.vue';
import OrgDateTime from './OrgDateTime.vue';
import OrgTags from './OrgTags.vue';
import OrgHorizontalRule from './OrgHorizontalRule.vue';
import OrgRawLink from './OrgRawLink.vue';
import OrgPriority from './OrgPriority.vue';
import OrgCheckbox from './OrgCheckbox.vue';
import OrgLink from './OrgLink.vue';

export const commonInlineMarkupExtension: Extension = {
  onMounted: async (api: OrgNoteApi): Promise<void> => {
    api.editor.widgets.add(
      {
        type: WidgetType.Inline,
        nodeType: NodeType.TodoKeyword,
        decorationType: 'mark',
        classBuilder: (orgNode: OrgNode) =>
          `org-keyword-${orgNode.value.toLowerCase()}`,
      },
      {
        type: WidgetType.Inline,
        nodeType: NodeType.LatexFragment,
        decorationType: 'replace',
        widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgLatexBlock, {
          container: 'span',
          withHash: false,
        }),
      },
      {
        type: WidgetType.Inline,
        nodeType: NodeType.Entity,
        decorationType: 'mark',
        classBuilder: () => 'org-entity',
      },
      {
        type: WidgetType.Inline,
        nodeType: NodeType.Indent,
        decorationType: 'replace',
        ignoreEditing: true,
        widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgInvisible),
      },
      {
        type: WidgetType.Inline,
        nodeType: NodeType.ListTag,
        decorationType: 'replace',
        ignoreEvent: true,
        widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgListTag, {
          container: 'span',
          withHash: false,
          inline: false,
        }),
      },
      {
        type: WidgetType.Inline,
        nodeType: NodeType.Date,
        decorationType: 'replace',
        ignoreEvent: true,
        widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgDateTime),
      },
      {
        type: WidgetType.Inline,
        nodeType: NodeType.TagList,
        decorationType: 'replace',
        ignoreEvent: true,
        widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgTags, {
          container: 'span',
        }),
      },
      {
        type: WidgetType.Inline,
        nodeType: NodeType.Text,
        decorationType: 'replace',
        satisfied: (orgNode: OrgNode) => {
          const rawValue = orgNode.value.toLowerCase();
          const notBlockKeyword =
            rawValue.startsWith('#+') &&
            !rawValue.startsWith('#+begin_') &&
            !rawValue.startsWith('#+end_');

          return orgNode.parent?.is(NodeType.Keyword) && notBlockKeyword;
        },
        widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgInvisible),
      },
      {
        type: WidgetType.Inline,
        nodeType: NodeType.Operator,
        decorationType: 'replace',
        ignoreEvent: true,
        satisfied: (orgNode: OrgNode) => {
          const isListOperator =
            orgNode.parent?.parent?.is(NodeType.ListItem) &&
            !orgNode.parent.parent?.parent?.ordered &&
            orgNode?.parent.isNot(NodeType.Section);
          const satisfied = isListOperator;
          return satisfied;
        },
        widgetBuilder: (params) => {
          const operator = params.orgNode.rawValue.trim();
          params.wrap.innerHTML = operator === '-' ? '•' : '◦';
          params.wrap.classList.add('org-list-bullet');
          return {
            destroy: () => {
              /* pass */
            },
          };
        },
      },
      {
        type: WidgetType.Inline,
        nodeType: NodeType.HorizontalRule,
        decorationType: 'replace',
        widgetBuilder:
          api.editor.widgets.createWidgetBuilder(OrgHorizontalRule),
      },
      {
        type: WidgetType.Inline,
        nodeType: NodeType.RawLink,
        decorationType: 'replace',
        ignoreEvent: true,
        widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgRawLink),
      },
      {
        type: WidgetType.Inline,
        nodeType: NodeType.Priority,
        decorationType: 'replace',
        widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgPriority),
      },
      {
        type: WidgetType.Inline,
        nodeType: NodeType.Checkbox,
        decorationType: 'replace',
        widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgCheckbox),
        ignoreEvent: true,
      },
      {
        type: WidgetType.Inline,
        nodeType: NodeType.Link,
        decorationType: 'replace',
        widgetBuilder: api.editor.widgets.createWidgetBuilder(OrgLink),
        ignoreEvent: true,
        satisfied: (orgNode: OrgNode) => orgNode.meta.linkType !== 'image',
      }
    );
  },
  onUnmounted: async (api: OrgNoteApi): Promise<void> => {
    api.system.reload({ verbose: true });
  },
};

export const commonInlineMarkupExtensionManifest: ExtensionManifest = {
  name: 'Inline markup',
  description: 'Bundle of predefined inline markups widgets for editor.',
  version: '0.0.1',
  category: 'extension',
  sourceType: 'builtin',
  keywords: ['editor', 'widgets'],
};
