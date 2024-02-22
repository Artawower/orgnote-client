import {
  Extension,
  ExtensionManifest,
  OrgNoteApi,
  WidgetType,
  ast,
} from 'orgnote-api';
import { NodeType } from 'org-mode-ast';
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
        classBuilder: (orgNode: ast.OrgNode) =>
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
        satisfied: (orgNode: ast.OrgNode) => {
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
        satisfied: (orgNode: ast.OrgNode) => {
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
        satisfied: (orgNode: ast.OrgNode) => orgNode.meta.linkType !== 'image',
      }
    );

    api.editor.widgets.add(
      {
        type: WidgetType.LineClass,
        nodeType: NodeType.Headline,
        class: (orgNode: ast.OrgNode) =>
          `org-headline-line org-headline-${orgNode.level}`,
      },
      {
        type: WidgetType.LineClass,
        nodeType: NodeType.Keyword,
        class: (orgNode: ast.OrgNode) =>
          `org-keyword-line org-keyword-${orgNode.children.first.value
            .trim()
            .toLowerCase()
            .slice(2, -1)}-line`,
      },
      {
        type: WidgetType.LineClass,
        nodeType: NodeType.NewLine,
        class: (orgNode: ast.OrgNode) => {
          if (orgNode?.parent?.is(NodeType.SrcBlock)) {
            return 'org-src-block-line';
          }
          if (
            orgNode.parent?.is(NodeType.Section) &&
            orgNode.parent?.parent?.is(NodeType.ListItem) &&
            !!orgNode.next
          ) {
            return 'org-list-item-section-line';
          }
          if (
            orgNode.parent?.is(NodeType.QuoteBlock) &&
            orgNode.next?.isNot(NodeType.BlockFooter)
          ) {
            return 'org-quote-block-line';
          }
          if (orgNode.parent?.parent?.is(NodeType.BlockFooter)) {
            return ' org-block-footer';
          }
        },
      },
      {
        type: WidgetType.LineClass,
        nodeType: NodeType.ListItem,
        class: (orgNode: ast.OrgNode) =>
          `org-list-item-line ${
            orgNode.title?.children?.get(1)?.checked
              ? 'org-list-item-checked'
              : ''
          } ${
            orgNode.parent?.ordered
              ? 'org-list-item-ordered-line'
              : 'org-list-item-bullet-line'
          }`,
      },
      {
        type: WidgetType.LineClass,
        nodeType: NodeType.Section,
        class: (orgNode: ast.OrgNode) => {
          if (orgNode.parent?.is(NodeType.ListItem)) {
            return 'org-list-item-section-line';
          }
        },
      },
      {
        type: WidgetType.LineClass,
        nodeType: NodeType.HorizontalRule,
        class: 'org-horizontal-rule-line',
      },
      {
        type: WidgetType.LineClass,
        nodeType: NodeType.Indent,
        class: (orgNode: ast.OrgNode) => {
          let lineClass = '';
          if (orgNode.parent?.parent?.is(NodeType.SrcBlock)) {
            lineClass += 'org-src-block-line';
          }
          if (orgNode.parent?.is(NodeType.BlockHeader)) {
            lineClass += ' org-block-header';
          }
          if (orgNode.parent?.is(NodeType.BlockFooter)) {
            lineClass += ' org-block-footer';
          }
          return lineClass;
        },
      },
      {
        type: WidgetType.LineClass,
        nodeType: NodeType.Text,
        class: (orgNode: ast.OrgNode) => {
          let lineClass = '';
          if (
            orgNode?.parent?.parent?.is(NodeType.SrcBlock) ||
            orgNode?.parent?.parent?.parent?.is(NodeType.SrcBlock)
          ) {
            lineClass += 'org-src-block-line';
          }
          if (orgNode?.parent?.parent?.is(NodeType.QuoteBlock)) {
            lineClass += 'org-quote-block-line';
          }
          if (orgNode.parent?.parent?.is(NodeType.BlockFooter)) {
            lineClass += ' org-block-footer';
          }
          if (orgNode.parent?.parent?.is(NodeType.BlockHeader)) {
            lineClass += ' org-block-header';
          }
          if (
            orgNode.parent?.is(NodeType.Section) &&
            orgNode.parent?.parent?.is(NodeType.ListItem)
          ) {
            lineClass += ' org-list-item-section-line';
          }
          return lineClass;
        },
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
