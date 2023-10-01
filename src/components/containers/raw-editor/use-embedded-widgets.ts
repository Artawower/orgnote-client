import { NodeType, OrgNode } from 'org-mode-ast';
import { useDynamicComponent } from 'src/hooks';
import {
  EmbeddedOrgWidget,
  InlineEmbeddedWidgets,
  MultilineEmbeddedWidgets,
  WidgetBuilder,
} from 'src/tools/cm-org-language/widgets';
import { OrgLineClasses } from 'src/tools/cm-org-language/widgets/line-decoration.model';

import { Component } from 'vue';

import OrgBlockWrapper from 'src/components/OrgBlockWrapper.vue';
import OrgCheckbox from 'src/components/OrgCheckbox.vue';
import OrgLatexBlock from 'src/components/OrgLatexBlock.vue';
import OrgLink from 'src/components/OrgLink.vue';
import OrgPriority from 'src/components/OrgPriority.vue';
import OrgTable from 'src/components/OrgTable.vue';

export const useEmbeddedWidgets = () => {
  const dynamicComponent = useDynamicComponent();
  const createOrgEmbeddedWidget = (cmp: Component): WidgetBuilder => {
    return (
      wrap: HTMLElement,
      orgNode: OrgNode,
      onUpdateFn?: (newVal: string) => void
    ): EmbeddedOrgWidget => {
      return dynamicComponent.mount(cmp, wrap, {
        node: orgNode,
        update: (newVal: string) => {
          onUpdateFn?.(newVal);
        },
      });
    };
  };

  const multilineEmbeddedWidgets: MultilineEmbeddedWidgets = {
    [NodeType.Table]: createOrgEmbeddedWidget(OrgTable),
    [NodeType.ExportBlock]: createOrgEmbeddedWidget(OrgLatexBlock),
    [NodeType.Link]: createOrgEmbeddedWidget(OrgLink),
  };

  const inlineEmbeddedWidgets: InlineEmbeddedWidgets = {
    [NodeType.TodoKeyword]: {
      decorationType: 'mark',
      classBuilder: (orgNode: OrgNode) =>
        `org-keyword-${orgNode.value.toLowerCase()}`,
    },
    [NodeType.Operator]: {
      decorationType: 'replace',
      satisfied: (orgNode: OrgNode) => {
        return (
          orgNode.parent?.parent?.is(NodeType.ListItem) &&
          !orgNode.parent.parent?.parent?.ordered
        );
      },
      widgetBuilder: (wrap: HTMLElement, orgNode: OrgNode) => {
        const operator = orgNode.rawValue.trim();
        wrap.classList.add(
          'org-list-bullet',
          `bullet-${operator === '-' ? '1' : '2'}`
        );
        return {
          destroy: () => {
            /* pass */
          },
        };
      },
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
      ignoreEvent: true,
    },
    [NodeType.BlockFooter]: {
      decorationType: 'replace',
      widgetBuilder: createOrgEmbeddedWidget(OrgBlockWrapper),
      ignoreEvent: true,
    },
  };

  const lineClasses: OrgLineClasses = {
    [NodeType.Headline]: (orgNode: OrgNode) =>
      `org-headline-line org-headline-${orgNode.level}`,
    [NodeType.SrcBlock]: 'org-src-block-line',
    [NodeType.Keyword]: 'org-keyword-line',
    [NodeType.NewLine]: (orgNode: OrgNode) => {
      if (orgNode?.parent?.is(NodeType.SrcBlock)) {
        return 'org-src-block-line';
      }
    },
    // TODO: master add support for nested lists.
    [NodeType.ListItem]: 'org-list-item-line',
    [NodeType.Text]: (orgNode: OrgNode) => {
      let lineClass = '';
      if (
        orgNode?.parent?.parent?.is(NodeType.SrcBlock) ||
        orgNode?.parent?.parent?.parent?.is(NodeType.SrcBlock)
      ) {
        lineClass += 'org-src-block-line';
      }

      if (orgNode.parent?.parent?.is(NodeType.BlockFooter)) {
        lineClass += ' org-block-footer';
      }

      if (orgNode.parent?.parent?.is(NodeType.BlockHeader)) {
        lineClass += ' org-block-header';
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
