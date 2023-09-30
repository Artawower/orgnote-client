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
    [NodeType.Priority]: {
      decorationType: 'replace',
      widgetBuilder: createOrgEmbeddedWidget(OrgPriority),
    },
    [NodeType.Checkbox]: {
      decorationType: 'replace',
      widgetBuilder: createOrgEmbeddedWidget(OrgCheckbox),
      ignoreEvent: true,
    },
  };

  const lineClasses: OrgLineClasses = {
    [NodeType.Headline]: (orgNode: OrgNode) =>
      `org-headline-line org-headline-${orgNode.level}`,
    [NodeType.SrcBlock]: 'org-src-block-line',
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
