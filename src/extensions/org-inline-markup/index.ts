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
    id: 'inline-todo-keyword',
    type: WidgetType.Inline,
    nodeType: NodeType.TodoKeyword,
    decorationType: 'mark',
    classBuilder: (orgNode: OrgNode) => `org-keyword-${orgNode.value.toLowerCase()}`,
  },
  {
    id: 'inline-entity',
    type: WidgetType.Inline,
    nodeType: NodeType.Entity,
    decorationType: 'mark',
    classBuilder: () => 'org-entity',
  },
  {
    id: 'inline-code',
    type: WidgetType.Inline,
    nodeType: NodeType.InlineCode,
    decorationType: 'replace',
    ignoreEvent: true,
    component: OrgInlineCode,
  },
  {
    id: 'inline-verbatim',
    type: WidgetType.Inline,
    nodeType: NodeType.Verbatim,
    decorationType: 'replace',
    ignoreEvent: true,
    component: OrgInlineCode,
  },
  {
    id: 'inline-indent',
    type: WidgetType.Inline,
    nodeType: NodeType.Indent,
    decorationType: 'replace',
    ignoreEditing: true,
    component: OrgInvisible,
  },
  {
    id: 'inline-list-tag',
    type: WidgetType.Inline,
    nodeType: NodeType.ListTag,
    decorationType: 'replace',
    ignoreEvent: true,
    component: OrgListTag,
  },
  {
    id: 'inline-date',
    type: WidgetType.Inline,
    nodeType: NodeType.Date,
    decorationType: 'replace',
    ignoreEvent: true,
    component: OrgDateTime,
  },
  {
    id: 'inline-tag-list',
    type: WidgetType.Inline,
    nodeType: NodeType.TagList,
    decorationType: 'replace',
    ignoreEvent: true,
    component: OrgTags,
  },
  {
    id: 'inline-text-keyword',
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
    id: 'inline-list-operator',
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
      params.wrap.textContent = operator === '-' ? '•' : '◦';
      params.wrap.classList.add('org-list-bullet');
      return { destroy: () => {} };
    },
  },
  {
    id: 'inline-horizontal-rule',
    type: WidgetType.Inline,
    nodeType: NodeType.HorizontalRule,
    decorationType: 'replace',
    component: OrgHorizontalRule,
  },
  {
    id: 'inline-raw-link',
    type: WidgetType.Inline,
    nodeType: NodeType.RawLink,
    decorationType: 'replace',
    ignoreEvent: true,
    component: OrgRawLink,
  },
  {
    id: 'inline-priority',
    type: WidgetType.Inline,
    nodeType: NodeType.Priority,
    decorationType: 'replace',
    component: OrgPriority,
  },
  {
    id: 'inline-checkbox',
    type: WidgetType.Inline,
    nodeType: NodeType.Checkbox,
    decorationType: 'replace',
    component: OrgCheckbox,
    ignoreEvent: true,
  },
  {
    id: 'inline-link',
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
    id: 'line-class-headline',
    type: WidgetType.LineClass,
    nodeType: NodeType.Headline,
    class: (orgNode: OrgNode) => `org-headline-line org-headline-${orgNode.level}`,
  },
  {
    id: 'line-class-keyword',
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
    id: 'line-class-newline',
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
    id: 'line-class-list-item',
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
    id: 'line-class-section',
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
    id: 'line-class-horizontal-rule',
    type: WidgetType.LineClass,
    nodeType: NodeType.HorizontalRule,
    class: 'org-horizontal-rule-line',
  },
  {
    id: 'line-class-indent',
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
    id: 'line-class-text',
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

const BUILTIN_PRIORITY = 0;

const allWidgets: WidgetMeta[] = [...inlineWidgets, ...lineClassWidgets].map((w) => ({
  ...w,
  priority: BUILTIN_PRIORITY,
}));

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
    allWidgets.forEach((w) => removeWidget(w.id));
  },
};

export { orgInlineMarkupManifest } from './manifest';
