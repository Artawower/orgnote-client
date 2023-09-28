import { NodeType, OrgNode } from 'org-mode-ast';
import {
  EmbeddedOrgWidget,
  EmbeddedWidgets,
} from 'src/tools/cm-org-language/widgets/multiline-widgets';

import { Component, createApp, getCurrentInstance } from 'vue';

import OrgLatexBlock from 'src/components/OrgLatexBlock.vue';
import OrgTable from 'src/components/OrgTable.vue';

export const useEmbeddedWidgets = () => {
  const vueInstance = getCurrentInstance();

  const createOrgEmbeddedWidget = (cmp: Component) => {
    return (wrap: HTMLElement, orgNode: OrgNode): EmbeddedOrgWidget => {
      const comp = createApp(cmp, {
        node: orgNode,
      });
      Object.assign(comp._context, vueInstance.appContext);
      comp.mount(wrap);
      return { destroy: () => comp.unmount() };
    };
  };

  const embeddedWidgets: EmbeddedWidgets = {
    [NodeType.Table]: createOrgEmbeddedWidget(OrgTable),
    [NodeType.ExportBlock]: createOrgEmbeddedWidget(OrgLatexBlock),
  };

  return {
    createOrgEmbeddedWidget,
    embeddedWidgets,
  };
};
