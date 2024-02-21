import { NodeType, OrgNode } from 'org-mode-ast';
import {
  EmbeddedWidgetBuilder,
  InlineEmbeddedWidget,
  InlineEmbeddedWidgets,
  MultilineEmbeddedWidgets,
} from 'src/api';
import { OrgLineClasses } from 'src/tools/cm-org-language/widgets/line-decoration.model';

import { Component } from 'vue';

import OrgHeadlineOperator from 'src/components/OrgHeadlineOperator.vue';
import ActionBtn from 'src/components/ui/ActionBtn.vue';
import { useEditorWidgetStore } from 'src/stores/editor-widget.store';

// TODO: master refactor 😭
// what a peremptory bullshit
export const useEmbeddedWidgets = () => {
  const {
    createWidgetBuilder,
    dynamicComponent,
    multilineExtensions,
    inlineExtensions,
  } = useEditorWidgetStore();

  const multilineEmbeddedWidgets: MultilineEmbeddedWidgets =
    multilineExtensions;

  const inlineEmbeddedWidgets: InlineEmbeddedWidgets = inlineExtensions;

  const lineClasses: OrgLineClasses = {
    [NodeType.Headline]: (orgNode: OrgNode) =>
      `org-headline-line org-headline-${orgNode.level}`,
    [NodeType.Keyword]: (orgNode: OrgNode) =>
      `org-keyword-line org-keyword-${orgNode.children.first.value
        .trim()
        .toLowerCase()
        .slice(2, -1)}-line`,
    [NodeType.NewLine]: (orgNode: OrgNode) => {
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
    // TODO: master add support for nested lists.
    [NodeType.ListItem]: (orgNode: OrgNode) =>
      `org-list-item-line ${
        orgNode.title?.children?.get(1)?.checked ? 'org-list-item-checked' : ''
      } ${
        orgNode.parent?.ordered
          ? 'org-list-item-ordered-line'
          : 'org-list-item-bullet-line'
      }`,
    [NodeType.Section]: (orgNode: OrgNode) => {
      if (orgNode.parent?.is(NodeType.ListItem)) {
        return 'org-list-item-section-line';
      }
    },
    [NodeType.HorizontalRule]: 'org-horizontal-rule-line',
    [NodeType.Indent]: (orgNode: OrgNode) => {
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
    [NodeType.Text]: (orgNode: OrgNode) => {
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
  };

  const createEmbeddedWidget =
    (cmp: Component, props = {}): EmbeddedWidgetBuilder =>
    (wrap: HTMLElement, dynamicProps: { [key: string]: unknown } = {}) =>
      dynamicComponent.mount(cmp, wrap, {
        ...props,
        ...dynamicProps,
      });

  const editBadgeWidget = createEmbeddedWidget(ActionBtn, {
    icon: 'edit_note',
    activeIcon: 'done',
  });

  const foldWidget: InlineEmbeddedWidget = {
    decorationType: 'replace',
    ignoreEvent: true,
    widgetBuilder: createWidgetBuilder(OrgHeadlineOperator),
  };

  return {
    createWidgetBuilder,
    multilineEmbeddedWidgets,
    inlineEmbeddedWidgets,
    lineClasses,
    foldWidget,
    editBadgeWidget,
  };
};
