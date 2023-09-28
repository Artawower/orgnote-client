import { NodeType, OrgNode } from 'org-mode-ast';

export type EmbeddedOrgWidget = {
  destroy: () => void;
};

export type WidgetBuilder = (
  wrap: HTMLElement,
  orgNode: OrgNode,
  onUpdateFn?: (newVal: string) => void
) => EmbeddedOrgWidget;

export type MultilineEmbeddedWidgets = {
  [key in NodeType]?: WidgetBuilder;
};

export interface InlineEmbeddedWidget {
  showRangeOffset?: [number, number];
  widgetBuilder?: WidgetBuilder;
  classBuilder?: (orgNode: OrgNode) => string;
  decorationType: 'mark' | 'widget' | 'replace' | 'line';
  side?: number;
  wrapComponent?: string;
  inclusive?: boolean;
  ignoreEvent?: boolean;
}

export type InlineEmbeddedWidgets = {
  [key in NodeType]?: InlineEmbeddedWidget;
};
