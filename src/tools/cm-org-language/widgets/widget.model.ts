import { NodeType, OrgNode } from 'org-mode-ast';

export type EmbeddedOrgWidget = {
  destroy: () => void;
};

export type WidgetBuilder = (
  wrap: HTMLElement,
  orgNode: OrgNode,
  onUpdateFn?: (newVal: string) => void
) => EmbeddedOrgWidget;

interface CommonEmbeddedWidget {
  satisfied?: (orgNode: OrgNode) => boolean;
}

interface MultilineEmbeddedWidget extends CommonEmbeddedWidget {
  widgetBuilder: WidgetBuilder;
}

export type MultilineEmbeddedWidgets = {
  [key in NodeType]?: MultilineEmbeddedWidget;
};

export interface InlineEmbeddedWidget extends CommonEmbeddedWidget {
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
