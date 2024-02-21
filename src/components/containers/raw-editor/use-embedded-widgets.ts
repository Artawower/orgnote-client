import { NodeType, OrgNode } from 'org-mode-ast';
import {
  EmbeddedWidgetBuilder,
  InlineEmbeddedWidget,
  InlineEmbeddedWidgets,
  MultilineEmbeddedWidgets,
} from 'src/api';
import { OrgLineClasses } from 'src/tools/cm-org-language/widgets/line-decoration.model';

import { Component } from 'vue';

import OrgCheckbox from 'src/components/OrgCheckbox.vue';
import OrgDateTime from 'src/components/OrgDateTime.vue';
import OrgHeadlineOperator from 'src/components/OrgHeadlineOperator.vue';
import OrgHorizontalRule from 'src/components/OrgHorizontalRule.vue';
import OrgInvisible from 'src/components/OrgInvisible.vue';
import OrgLatexBlock from 'src/components/extensions/OrgLatexBlock.vue';
import OrgLink from 'src/components/extensions/OrgLink.vue';
import OrgListTag from 'src/components/OrgListTag.vue';
import OrgPriority from 'src/components/OrgPriority.vue';
import OrgRawLink from 'src/components/OrgRawLink.vue';
import OrgTags from 'src/components/OrgTags.vue';
import ActionBtn from 'src/components/ui/ActionBtn.vue';
import { useEditorWidgetStore } from 'src/stores/editor-widget.store';

// TODO: master refactor 😭
// what a peremptory bullshit
export const useEmbeddedWidgets = () => {
  const { createWidgetBuilder, dynamicComponent, multilineExtensions } =
    useEditorWidgetStore();

  const multilineEmbeddedWidgets: MultilineEmbeddedWidgets =
    multilineExtensions;

  const inlineEmbeddedWidgets: InlineEmbeddedWidgets = {
    [NodeType.TodoKeyword]: {
      decorationType: 'mark',
      classBuilder: (orgNode: OrgNode) =>
        `org-keyword-${orgNode.value.toLowerCase()}`,
    },
    [NodeType.LatexFragment]: {
      decorationType: 'replace',
      widgetBuilder: createWidgetBuilder(OrgLatexBlock, {
        container: 'span',
        withHash: false,
      }),
    },
    [NodeType.Entity]: {
      decorationType: 'mark',
      classBuilder: () => 'org-entity',
    },
    [NodeType.Indent]: {
      decorationType: 'replace',
      ignoreEditing: true,
      widgetBuilder: createWidgetBuilder(OrgInvisible),
    },
    [NodeType.ListTag]: {
      decorationType: 'replace',
      ignoreEvent: true,
      widgetBuilder: createWidgetBuilder(OrgListTag, {
        container: 'span',
        withHash: false,
        inline: false,
      }),
    },
    [NodeType.Date]: {
      decorationType: 'replace',
      ignoreEvent: true,
      widgetBuilder: createWidgetBuilder(OrgDateTime),
    },
    [NodeType.TagList]: {
      decorationType: 'replace',
      ignoreEvent: true,
      widgetBuilder: createWidgetBuilder(OrgTags, { container: 'span' }),
    },
    [NodeType.Text]: {
      decorationType: 'replace',
      satisfied: (orgNode: OrgNode) => {
        const rawValue = orgNode.value.toLowerCase();
        const notBlockKeyword =
          rawValue.startsWith('#+') &&
          !rawValue.startsWith('#+begin_') &&
          !rawValue.startsWith('#+end_');

        return orgNode.parent?.is(NodeType.Keyword) && notBlockKeyword;
      },
      widgetBuilder: createWidgetBuilder(OrgInvisible),
    },
    [NodeType.Operator]: {
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
    [NodeType.HorizontalRule]: {
      decorationType: 'replace',
      widgetBuilder: createWidgetBuilder(OrgHorizontalRule),
    },
    [NodeType.RawLink]: {
      decorationType: 'replace',
      ignoreEvent: true,
      widgetBuilder: createWidgetBuilder(OrgRawLink),
    },
    [NodeType.Priority]: {
      decorationType: 'replace',
      widgetBuilder: createWidgetBuilder(OrgPriority),
    },
    [NodeType.Checkbox]: {
      decorationType: 'replace',
      widgetBuilder: createWidgetBuilder(OrgCheckbox),
      ignoreEvent: true,
    },
    // [NodeType.BlockHeader]: {
    //   decorationType: 'replace',
    //   widgetBuilder: createWidgetBuilder(OrgBlockWrapper),
    //   viewUpdater: srcHeaderViewUpdater,
    //   ignoreEvent: true,
    // },
    // [NodeType.BlockFooter]: {
    //   decorationType: 'replace',
    //   widgetBuilder: createWidgetBuilder(OrgBlockWrapper),
    //   ignoreEvent: true,
    // },
    [NodeType.Link]: {
      decorationType: 'replace',
      widgetBuilder: createWidgetBuilder(OrgLink),
      ignoreEvent: true,
      satisfied: (orgNode: OrgNode) => orgNode.meta.linkType !== 'image',
    },
  };

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
