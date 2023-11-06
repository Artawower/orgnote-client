import { ChangeSpec } from '@codemirror/state';
import { EditorView } from 'codemirror';
import { NodeType, OrgNode } from 'org-mode-ast';

export type EmbeddedOrgWidget = {
  destroy: () => void;
  refresh?: () => void;
};

export interface WidgetBuilderParams {
  wrap: HTMLElement;
  orgNode: OrgNode;
  rootNodeSrc?: () => OrgNode;
  onUpdateFn?: (newVal: string) => void;
  editorView: EditorView;
  readonly?: boolean;
}

export type WidgetBuilder = (params: WidgetBuilderParams) => EmbeddedOrgWidget;

export interface CommonEmbeddedWidget {
  satisfied?: (orgNode: OrgNode) => boolean;
  widgetBuilder?: WidgetBuilder;
  viewUpdater?: (orgNode: OrgNode, newVal: string) => ViewUpdateSchema;
  ignoreEvent?: boolean;
  showRangeOffset?: [number, number];
}

export interface MultilineEmbeddedWidget extends CommonEmbeddedWidget {
  widgetBuilder: WidgetBuilder;
}

export type MultilineEmbeddedWidgets = {
  [key in NodeType]?: MultilineEmbeddedWidget;
};

export type ViewUpdateSchema = ChangeSpec;

export interface InlineEmbeddedWidget extends CommonEmbeddedWidget {
  classBuilder?: (orgNode: OrgNode) => string;
  decorationType: 'mark' | 'widget' | 'replace' | 'line';
  ignoreEditing?: boolean;
  side?: number;
  wrapComponent?: string;
  inclusive?: boolean;
}

export type InlineEmbeddedWidgets = {
  [key in NodeType]?: InlineEmbeddedWidget;
};
