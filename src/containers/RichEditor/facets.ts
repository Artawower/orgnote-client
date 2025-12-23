import { Facet } from '@codemirror/state';
import type { OrgNode } from 'org-mode-ast';
import type {
  InlineEmbeddedWidgets,
  MultilineEmbeddedWidgets,
  OrgLineClasses,
} from 'orgnote-api';

export type OrgNodeGetter = () => OrgNode | null;

export const orgNodeGetterFacet = Facet.define<OrgNodeGetter, OrgNodeGetter>({
  combine: (inputs) => inputs[0] ?? (() => null),
});

export const readonlyFacet = Facet.define<boolean, boolean>({
  combine: (inputs) => inputs[0] ?? false,
});

export const inlineWidgetsFacet = Facet.define<InlineEmbeddedWidgets, InlineEmbeddedWidgets>({
  combine: (inputs) => inputs.reduce((acc, widgets) => ({ ...acc, ...widgets }), {}),
});

export const multilineWidgetsFacet = Facet.define<MultilineEmbeddedWidgets, MultilineEmbeddedWidgets>({
  combine: (inputs) => inputs.reduce((acc, widgets) => ({ ...acc, ...widgets }), {}),
});

export const lineClassesFacet = Facet.define<OrgLineClasses, OrgLineClasses>({
  combine: (inputs) => inputs.reduce((acc, classes) => ({ ...acc, ...classes }), {}),
});
