import { NodeType, OrgNode } from 'org-mode-ast';
import {
  EmbeddedOrgWidget,
  InlineEmbeddedWidgets,
  MultilineEmbeddedWidgets,
  WidgetBuilder,
} from 'src/tools/cm-org-language/widgets';

import { Component, createApp, getCurrentInstance } from 'vue';

import OrgCheckbox from 'src/components/OrgCheckbox.vue';
import OrgLatexBlock from 'src/components/OrgLatexBlock.vue';
import OrgLink from 'src/components/OrgLink.vue';
import OrgPriority from 'src/components/OrgPriority.vue';
import OrgTable from 'src/components/OrgTable.vue';

export const useEmbeddedWidgets = () => {
  const vueInstance = getCurrentInstance();

  const createOrgEmbeddedWidget = (cmp: Component): WidgetBuilder => {
    return (
      wrap: HTMLElement,
      orgNode: OrgNode,
      onUpdateFn?: (newVal: string) => void
    ): EmbeddedOrgWidget => {
      const comp = createApp(cmp, {
        node: orgNode,
        update: (newVal: string) => {
          onUpdateFn?.(newVal);
        },
      });
      Object.assign(comp._context, vueInstance.appContext);
      comp.provide;
      comp.mount(wrap);
      return { destroy: () => comp.unmount() };
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
      side: 0,
      inclusive: true,
      ignoreEvent: true,
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
