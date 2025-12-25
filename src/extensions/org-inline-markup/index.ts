import type { Extension, WidgetMeta } from 'orgnote-api';
import { WidgetType } from 'orgnote-api';
import { NodeType } from 'org-mode-ast';
import type { OrgNode } from 'org-mode-ast';

import {
  OrgCheckbox,
  OrgDateTime,
  OrgHorizontalRule,
  OrgInlineCode,
  OrgInvisible,
  OrgLink,
  OrgListTag,
  OrgPriority,
  OrgRawLink,
  OrgTags,
} from 'src/components/org-nodes';
import styles from './styles.css?raw';

const inlineWidgets: WidgetMeta[] = [
  {
    type: WidgetType.Inline,
    nodeType: NodeType.TodoKeyword,
    decorationType: 'mark',
    classBuilder: (orgNode: OrgNode) => `org-keyword-${orgNode.value.toLowerCase()}`,
  },
  {
    type: WidgetType.Inline,
    nodeType: NodeType.Entity,
    decorationType: 'mark',
    classBuilder: () => 'org-entity',
  },
  {
    type: WidgetType.Inline,
    nodeType: NodeType.InlineCode,
    decorationType: 'replace',
    ignoreEvent: true,
    component: OrgInlineCode,
  },
  {
    type: WidgetType.Inline,
    nodeType: NodeType.Verbatim,
    decorationType: 'replace',
    ignoreEvent: true,
    component: OrgInlineCode,
  },
  {
    type: WidgetType.Inline,
    nodeType: NodeType.Indent,
    decorationType: 'replace',
    ignoreEditing: true,
    component: OrgInvisible,
  },
  {
    type: WidgetType.Inline,
    nodeType: NodeType.ListTag,
    decorationType: 'replace',
    ignoreEvent: true,
    component: OrgListTag,
  },
  {
    type: WidgetType.Inline,
    nodeType: NodeType.Date,
    decorationType: 'replace',
    ignoreEvent: true,
    component: OrgDateTime,
  },
  {
    type: WidgetType.Inline,
    nodeType: NodeType.TagList,
    decorationType: 'replace',
    ignoreEvent: true,
    component: OrgTags,
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
      return !!(orgNode.parent?.is(NodeType.Keyword) && notBlockKeyword);
    },
    component: OrgInvisible,
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
      return !!isListOperator;
    },
    widgetBuilder: (params) => {
      const operator = params.orgNode.rawValue.trim();
      params.wrap.innerHTML = operator === '-' ? '•' : '◦';
      params.wrap.classList.add('org-list-bullet');
      return { destroy: () => {} };
    },
  },
  {
    type: WidgetType.Inline,
    nodeType: NodeType.HorizontalRule,
    decorationType: 'replace',
    component: OrgHorizontalRule,
  },
  {
    type: WidgetType.Inline,
    nodeType: NodeType.RawLink,
    decorationType: 'replace',
    ignoreEvent: true,
    component: OrgRawLink,
  },
  {
    type: WidgetType.Inline,
    nodeType: NodeType.Priority,
    decorationType: 'replace',
    component: OrgPriority,
  },
  {
    type: WidgetType.Inline,
    nodeType: NodeType.Checkbox,
    decorationType: 'replace',
    component: OrgCheckbox,
    ignoreEvent: true,
  },
  {
    type: WidgetType.Inline,
    nodeType: NodeType.Link,
    decorationType: 'replace',
    component: OrgLink,
    ignoreEvent: true,
    satisfied: (orgNode: OrgNode) => orgNode.meta.linkType !== 'image',
  },
];

const lineClassWidgets: WidgetMeta[] = [
  {
    type: WidgetType.LineClass,
    nodeType: NodeType.Headline,
    class: (orgNode: OrgNode) => `org-headline-line org-headline-${orgNode.level}`,
  },
  {
    type: WidgetType.LineClass,
    nodeType: NodeType.Keyword,
    class: (orgNode: OrgNode) => {
      const firstChild = orgNode.children?.first;
      if (!firstChild?.value) return '';
      return `org-keyword-line org-keyword-${firstChild.value
        .trim()
        .toLowerCase()
        .slice(2, -1)}-line`;
    },
  },
  {
    type: WidgetType.LineClass,
    nodeType: NodeType.NewLine,
    class: (orgNode: OrgNode) => {
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
        return 'org-block-footer';
      }
      return '';
    },
  },
  {
    type: WidgetType.LineClass,
    nodeType: NodeType.ListItem,
    class: (orgNode: OrgNode) => {
      const checkedClass = orgNode.title?.children?.get(1)?.checked
        ? 'org-list-item-checked'
        : '';
      const orderedClass = orgNode.parent?.ordered
        ? 'org-list-item-ordered-line'
        : 'org-list-item-bullet-line';
      return `org-list-item-line ${checkedClass} ${orderedClass}`;
    },
  },
  {
    type: WidgetType.LineClass,
    nodeType: NodeType.Section,
    class: (orgNode: OrgNode) => {
      if (orgNode.parent?.is(NodeType.ListItem)) {
        return 'org-list-item-section-line';
      }
      return '';
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
    class: (orgNode: OrgNode) => {
      const classes: string[] = [];
      if (orgNode.parent?.parent?.is(NodeType.SrcBlock)) {
        classes.push('org-src-block-line');
      }
      if (orgNode.parent?.is(NodeType.BlockHeader)) {
        classes.push('org-block-header');
      }
      if (orgNode.parent?.is(NodeType.BlockFooter)) {
        classes.push('org-block-footer');
      }
      return classes.join(' ');
    },
  },
  {
    type: WidgetType.LineClass,
    nodeType: NodeType.Text,
    class: (orgNode: OrgNode) => {
      const classes: string[] = [];
      if (
        orgNode?.parent?.parent?.is(NodeType.SrcBlock) ||
        orgNode?.parent?.parent?.parent?.is(NodeType.SrcBlock)
      ) {
        classes.push('org-src-block-line');
      }
      if (orgNode?.parent?.parent?.is(NodeType.QuoteBlock)) {
        classes.push('org-quote-block-line');
      }
      if (orgNode.parent?.parent?.is(NodeType.BlockFooter)) {
        classes.push('org-block-footer');
      }
      if (orgNode.parent?.parent?.is(NodeType.BlockHeader)) {
        classes.push('org-block-header');
      }
      if (
        orgNode.parent?.is(NodeType.Section) &&
        orgNode.parent?.parent?.is(NodeType.ListItem)
      ) {
        classes.push('org-list-item-section-line');
      }
      return classes.join(' ');
    },
  },
];

const allWidgets: WidgetMeta[] = [...inlineWidgets, ...lineClassWidgets];

const SCOPE_ID = 'org-inline-markup';

export const orgInlineMarkupExtension: Extension = {
  onMounted: async (api) => {
    api.utils.applyScopedStyles(SCOPE_ID, styles);

    const { addWidgets } = api.core.useEditor();
    addWidgets(...allWidgets);
  },

  onUnmounted: async (api) => {
    api.utils.removeScopedStyles(SCOPE_ID);

    const { removeWidget } = api.core.useEditor();
    allWidgets.forEach((w) => removeWidget(w.nodeType));
  },
};

export { orgInlineMarkupManifest } from './manifest';
