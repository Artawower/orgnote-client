import { NodeType, OrgNode } from 'org-mode-ast';
import { useDynamicComponent } from 'src/hooks';
import {
  EmbeddedOrgWidget,
  InlineEmbeddedWidgets,
  MultilineEmbeddedWidgets,
  WidgetBuilder,
} from 'src/tools/cm-org-language/widgets';

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
  };

  const inlineEmbeddedWidgets: InlineEmbeddedWidgets = {
    [NodeType.Link]: {
      decorationType: 'replace',
      widgetBuilder: createOrgEmbeddedWidget(OrgLink),
      ignoreEvent: true,
      showRangeOffset: [1, -1],
    },
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

  return {
    createOrgEmbeddedWidget,
    multilineEmbeddedWidgets,
    inlineEmbeddedWidgets,
  };
};