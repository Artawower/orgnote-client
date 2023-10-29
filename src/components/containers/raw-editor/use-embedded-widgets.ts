import { srcHeaderViewUpdater } from './src-view-updated';
import { NodeType, OrgNode } from 'org-mode-ast';
import { useDynamicComponent } from 'src/hooks';
import { textToKebab } from 'src/tools';
import {
  EmbeddedOrgWidget,
  InlineEmbeddedWidgets,
  MultilineEmbeddedWidgets,
  WidgetBuilder,
  WidgetBuilderParams,
} from 'src/tools/cm-org-language/widgets';
import { OrgLineClasses } from 'src/tools/cm-org-language/widgets/line-decoration.model';

import { Component } from 'vue';

import OrgBlockWrapper from 'src/components/OrgBlockWrapper.vue';
import OrgCheckbox from 'src/components/OrgCheckbox.vue';
import OrgDateTime from 'src/components/OrgDateTime.vue';
import OrgHorizontalRule from 'src/components/OrgHorizontalRule.vue';
import OrgHtmlBlock from 'src/components/OrgHtmlBlock.vue';
import OrgInvisible from 'src/components/OrgInvisible.vue';
import OrgLatexBlock from 'src/components/OrgLatexBlock.vue';
import OrgLink from 'src/components/OrgLink.vue';
import OrgListTag from 'src/components/OrgListTag.vue';
import OrgPriority from 'src/components/OrgPriority.vue';
import OrgRawLink from 'src/components/OrgRawLink.vue';
import OrgTable from 'src/components/OrgTable.vue';
import OrgTags from 'src/components/OrgTags.vue';

// TODO: master refactor 😭
// what a peremptory bullshit
export const useEmbeddedWidgets = () => {
  const dynamicComponent = useDynamicComponent();
  const createOrgEmbeddedWidget = (
    cmp: Component,
    props: { [key: string]: unknown } = {}
  ): WidgetBuilder => {
    return ({
      wrap,
      rootNodeSrc,
      onUpdateFn,
      orgNode,
      editorView,
      readonly,
    }: WidgetBuilderParams): EmbeddedOrgWidget => {
      const normalizedOrgNodeType = textToKebab(orgNode.type.toLowerCase());
      wrap.classList.add(`org-embedded-${normalizedOrgNodeType}`);
      return dynamicComponent.mount(cmp, wrap, {
        ...props,
        node: orgNode,
        editorView,
        rootNodeSrc,
        readonly,
        onUpdate: (newVal: string) => {
          onUpdateFn?.(newVal);
        },
      });
    };
  };

  const multilineEmbeddedWidgets: MultilineEmbeddedWidgets = {
    [NodeType.Table]: {
      widgetBuilder: createOrgEmbeddedWidget(OrgTable),
    },
    [NodeType.ExportBlock]: {
      widgetBuilder: createOrgEmbeddedWidget(OrgLatexBlock),
    },
    [NodeType.LatexEnvironment]: {
      widgetBuilder: createOrgEmbeddedWidget(OrgLatexBlock),
    },
    [NodeType.Link]: {
      widgetBuilder: createOrgEmbeddedWidget(OrgLink),
      satisfied: (orgNode: OrgNode) => {
        return orgNode.meta.linkType == 'image';
      },
    },
    [NodeType.HtmlBlock]: {
      widgetBuilder: createOrgEmbeddedWidget(OrgHtmlBlock),
    },
  };

  const inlineEmbeddedWidgets: InlineEmbeddedWidgets = {
    [NodeType.TodoKeyword]: {
      decorationType: 'mark',
      classBuilder: (orgNode: OrgNode) =>
        `org-keyword-${orgNode.value.toLowerCase()}`,
    },
    [NodeType.LatexFragment]: {
      decorationType: 'replace',
      widgetBuilder: createOrgEmbeddedWidget(OrgLatexBlock, {
        container: 'span',
        withHash: false,
      }),
    },
    [NodeType.ListTag]: {
      decorationType: 'replace',
      ignoreEvent: true,
      widgetBuilder: createOrgEmbeddedWidget(OrgListTag, {
        container: 'span',
        withHash: false,
      }),
    },
    [NodeType.Date]: {
      decorationType: 'replace',
      ignoreEvent: true,
      widgetBuilder: createOrgEmbeddedWidget(OrgDateTime),
    },
    [NodeType.TagList]: {
      decorationType: 'replace',
      ignoreEvent: true,
      widgetBuilder: createOrgEmbeddedWidget(OrgTags, { container: 'span' }),
    },
    [NodeType.Text]: {
      decorationType: 'replace',
      satisfied: (orgNode: OrgNode) => {
        return (
          orgNode.parent?.is(NodeType.Keyword) && orgNode.value.startsWith('#+')
        );
      },
      widgetBuilder: createOrgEmbeddedWidget(OrgInvisible),
    },
    [NodeType.Operator]: {
      decorationType: 'replace',
      ignoreEvent: true,
      satisfied: (orgNode: OrgNode) => {
        const isListOperator =
          orgNode.parent?.parent?.is(NodeType.ListItem) &&
          !orgNode.parent.parent?.parent?.ordered &&
          orgNode?.parent.isNot(NodeType.Section);

        const isHeadlineOperator = orgNode.parent?.parent?.is(
          NodeType.Headline
        );
        const satisfied = isListOperator || isHeadlineOperator;
        return satisfied;
      },
      widgetBuilder: (params) => {
        const isHeadline = params.orgNode.parent?.parent?.is(NodeType.Headline);
        if (isHeadline) {
          return createOrgEmbeddedWidget(OrgInvisible)(params);
        }
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
      widgetBuilder: createOrgEmbeddedWidget(OrgHorizontalRule),
    },
    [NodeType.RawLink]: {
      decorationType: 'replace',
      ignoreEvent: true,
      widgetBuilder: createOrgEmbeddedWidget(OrgRawLink),
    },
    [NodeType.Priority]: {
      decorationType: 'replace',
      widgetBuilder: createOrgEmbeddedWidget(OrgPriority),
    },
    [NodeType.Checkbox]: {
      decorationType: 'replace',
      widgetBuilder: createOrgEmbeddedWidget(OrgCheckbox),
      ignoreEvent: true,
    },
    [NodeType.BlockHeader]: {
      decorationType: 'replace',
      widgetBuilder: createOrgEmbeddedWidget(OrgBlockWrapper),
      viewUpdater: srcHeaderViewUpdater,
      ignoreEvent: true,
    },
    [NodeType.BlockFooter]: {
      decorationType: 'replace',
      widgetBuilder: createOrgEmbeddedWidget(OrgBlockWrapper),
      ignoreEvent: true,
    },
    [NodeType.Link]: {
      decorationType: 'replace',
      widgetBuilder: createOrgEmbeddedWidget(OrgLink),
      ignoreEvent: true,
      satisfied: (orgNode: OrgNode) => orgNode.meta.linkType !== 'image',
    },
  };

  const lineClasses: OrgLineClasses = {
    [NodeType.Headline]: (orgNode: OrgNode) =>
      `org-headline-line org-headline-${orgNode.level}`,
    [NodeType.SrcBlock]: 'org-src-block-line',
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

  return {
    createOrgEmbeddedWidget,
    multilineEmbeddedWidgets,
    inlineEmbeddedWidgets,
    lineClasses,
  };
};
