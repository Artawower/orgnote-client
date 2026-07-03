import type { EditorView } from '@codemirror/view';
import {
  EMBEDDED_WIDGET_COMMAND,
  type EmbeddedWidgetBridge,
  type EmbeddedWidgetCommand,
  type EmbeddedWidgetDirection,
  type EmbeddedWidgetEditorPayload,
  type EmbeddedWidgetFocusPayload,
  type EmbeddedWidgetFocusPosition,
  type EmbeddedWidgetHandle,
  type EmbeddedWidgetNavigationPayload,
  type EmbeddedWidgetRange,
  type EmbeddedWidgetSnapshot,
} from './types';
import { debugEmbeddedWidgetNavigation } from './debug';

const DEFAULT_PRIORITY = 0;
const NEWLINE = '\n';

const bridges = new WeakMap<EditorView, EmbeddedWidgetBridge>();

interface ResolvedNavigationPayload {
  readonly sourceId?: string;
  readonly range?: EmbeddedWidgetRange;
  readonly direction: EmbeddedWidgetDirection;
  readonly position: EmbeddedWidgetFocusPosition;
}

interface EmbeddedWidgetEntry {
  readonly handle: EmbeddedWidgetHandle;
  readonly snapshot: EmbeddedWidgetSnapshot;
}

interface DebugWidgetSnapshot {
  readonly id: string;
  readonly range?: EmbeddedWidgetRange;
  readonly priority: number;
}

const defaultPosition = (direction: EmbeddedWidgetDirection): EmbeddedWidgetFocusPosition => {
  if (direction > 0) return 'start';
  return 'end';
};

const resolveNavigationPayload = (
  payload: EmbeddedWidgetNavigationPayload,
): ResolvedNavigationPayload => ({
  ...payload,
  position: payload.position ?? defaultPosition(payload.direction),
});

const resolveEditorPayload = (
  payload: EmbeddedWidgetEditorPayload,
): ResolvedNavigationPayload => ({
  direction: payload.direction,
  position: payload.position ?? defaultPosition(payload.direction),
});

const containsLine = (range: EmbeddedWidgetRange, lineFrom: number): boolean =>
  range.from <= lineFrom && lineFrom <= range.to;

const byDocumentOrder = (
  left: EmbeddedWidgetSnapshot,
  right: EmbeddedWidgetSnapshot,
): number => {
  if (left.range.from !== right.range.from) return left.range.from - right.range.from;
  return left.priority - right.priority;
};

const byPreviousAdjacentOrder = (
  left: EmbeddedWidgetEntry,
  right: EmbeddedWidgetEntry,
): number => {
  if (left.snapshot.range.from !== right.snapshot.range.from) {
    return right.snapshot.range.from - left.snapshot.range.from;
  }

  return left.snapshot.priority - right.snapshot.priority;
};

const byNextAdjacentOrder = (
  left: EmbeddedWidgetEntry,
  right: EmbeddedWidgetEntry,
): number => byDocumentOrder(left.snapshot, right.snapshot);

const byAdjacentOrder = (direction: EmbeddedWidgetDirection) => {
  if (direction > 0) return byNextAdjacentOrder;
  return byPreviousAdjacentOrder;
};

const isAdjacentRange = (
  sourceRange: EmbeddedWidgetRange,
  targetRange: EmbeddedWidgetRange,
  direction: EmbeddedWidgetDirection,
): boolean => {
  if (direction > 0) return targetRange.from > sourceRange.from;
  return targetRange.from < sourceRange.from;
};

const createEmbeddedWidgetBridge = (view: EditorView): EmbeddedWidgetBridge => {
  const handles = new Map<string, EmbeddedWidgetHandle>();

  const toSnapshot = (handle: EmbeddedWidgetHandle): EmbeddedWidgetSnapshot => ({
    id: handle.id,
    range: handle.getRange(),
    priority: handle.priority ?? DEFAULT_PRIORITY,
  });

  const toEntry = (handle: EmbeddedWidgetHandle): EmbeddedWidgetEntry => ({
    handle,
    snapshot: toSnapshot(handle),
  });

  const sortedEntries = (excludedId?: string): EmbeddedWidgetEntry[] =>
    Array.from(handles.values())
      .flatMap((handle) => {
        if (handle.id === excludedId) return [];
        return [toEntry(handle)];
      })
      .sort((left, right) => byDocumentOrder(left.snapshot, right.snapshot));

  const snapshot = (): EmbeddedWidgetSnapshot[] =>
    sortedEntries().map((entry) => entry.snapshot);

  const rangeLineLabel = (range: EmbeddedWidgetRange | undefined): string => {
    if (!range) return 'L?';
    const docLength = view.state.doc.length;
    const from = Math.min(range.from, docLength);
    const to = Math.min(Math.max(range.to, from), docLength);
    const fromLine = view.state.doc.lineAt(from).number;
    const toLine = view.state.doc.lineAt(to).number;
    if (fromLine === toLine) return `L${fromLine}`;
    return `L${fromLine}-L${toLine}`;
  };

  const rangeBar = (range: EmbeddedWidgetRange | undefined): string => {
    const width = 48;
    if (!range) return '?'.repeat(width);
    const docLength = Math.max(view.state.doc.length, 1);
    const start = Math.floor((Math.max(range.from, 0) / docLength) * width);
    const end = Math.max(start + 1, Math.ceil((Math.max(range.to, 0) / docLength) * width));
    return Array.from({ length: width }, (_, index) => {
      if (index < start) return '.';
      if (index < end) return '#';
      return '.';
    }).join('');
  };

  const widgetRangeLabel = (range: EmbeddedWidgetRange | undefined): string => {
    if (!range) return '[range unavailable]';
    return `[${range.from}-${range.to}]`;
  };

  const toDebugWidget = (handle: EmbeddedWidgetHandle): DebugWidgetSnapshot => ({
    id: handle.id,
    priority: handle.priority ?? DEFAULT_PRIORITY,
  });

  const debugWidgets = (): DebugWidgetSnapshot[] => Array.from(handles.values()).map(toDebugWidget);

  const widgetMap = (widgets: readonly DebugWidgetSnapshot[]): string => {
    if (!widgets.length) return '(empty widget registry)';
    return widgets
      .map((widget, index) => {
        const order = `${index + 1}`.padStart(2, '0');
        const range = widgetRangeLabel(widget.range).padEnd(19, ' ');
        const lines = rangeLineLabel(widget.range).padEnd(7, ' ');
        const priority = `p=${widget.priority}`.padEnd(5, ' ');
        return `${order} ${widget.id.padEnd(24, ' ')} ${lines} ${range} ${priority} ${rangeBar(widget.range)}`;
      })
      .join('\n');
  };

  const debug = (event: string, context: Record<string, unknown> = {}): void => {
    const head = view.state.selection.main.head;
    const line = view.state.doc.lineAt(head);
    const widgets = debugWidgets();
    debugEmbeddedWidgetNavigation(event, {
      head,
      lineNumber: line.number,
      lineFrom: line.from,
      lineTo: line.to,
      docLength: view.state.doc.length,
      docLines: view.state.doc.lines,
      registeredIds: widgets.map((widget) => widget.id),
      widgetMap: widgetMap(widgets),
      widgets,
      ...context,
    });
  };

  const getCommandRange = (
    command: ResolvedNavigationPayload,
  ): EmbeddedWidgetRange | undefined => {
    if (command.range) return command.range;
    if (!command.sourceId) return undefined;
    return handles.get(command.sourceId)?.getRange();
  };

  const findAdjacentEntry = (
    sourceRange: EmbeddedWidgetRange,
    direction: EmbeddedWidgetDirection,
    sourceId?: string,
  ): EmbeddedWidgetEntry | undefined =>
    sortedEntries(sourceId)
      .filter((entry) => isAdjacentRange(sourceRange, entry.snapshot.range, direction))
      .sort(byAdjacentOrder(direction))
      .at(0);

  const firstEditorLineNumber = (direction: EmbeddedWidgetDirection): number => {
    const head = view.state.selection.main.head;
    const line = view.state.doc.lineAt(head);
    if (direction > 0 && head < line.to) return line.number;
    return line.number + direction;
  };

  const targetEditorLineFrom = (
    direction: EmbeddedWidgetDirection,
  ): number | undefined => {
    const lineNumber = firstEditorLineNumber(direction);
    if (lineNumber < 1 || lineNumber > view.state.doc.lines) return undefined;
    return view.state.doc.line(lineNumber).from;
  };

  const adjacentLineNumberAroundRange = (
    range: EmbeddedWidgetRange,
    direction: EmbeddedWidgetDirection,
  ): number | undefined => {
    const position = direction > 0 ? range.to : range.from;
    const lineNumber = view.state.doc.lineAt(position).number + direction;
    if (lineNumber < 1 || lineNumber > view.state.doc.lines) return undefined;
    return lineNumber;
  };

  const editorAnchorAtLine = (
    lineNumber: number,
    direction: EmbeddedWidgetDirection,
  ): number => {
    const line = view.state.doc.line(lineNumber);
    return direction > 0 ? line.from : line.to;
  };

  const appendLineAfterRange = (range: EmbeddedWidgetRange): void => {
    const changes = view.state.changes({ from: range.to, to: range.to, insert: NEWLINE });
    const anchor = changes.mapPos(range.to, 1);
    view.dispatch({ changes, selection: { anchor }, scrollIntoView: true });
    view.focus();
  };

  const focusEditorAtLine = (
    lineNumber: number,
    direction: EmbeddedWidgetDirection,
  ): void => {
    const anchor = editorAnchorAtLine(lineNumber, direction);
    view.dispatch({ selection: { anchor }, scrollIntoView: true });
    view.focus();
  };

  const focusEditorAroundRange = (
    range: EmbeddedWidgetRange,
    direction: EmbeddedWidgetDirection,
  ): boolean => {
    if (direction > 0 && range.to >= view.state.doc.length) {
      appendLineAfterRange(range);
      return true;
    }

    const lineNumber = adjacentLineNumberAroundRange(range, direction);
    if (lineNumber === undefined) return false;

    focusEditorAtLine(lineNumber, direction);
    return true;
  };

  const focusAdjacent = (command: ResolvedNavigationPayload): boolean => {
    const sourceRange = getCommandRange(command);
    if (!sourceRange) {
      debug('focus-adjacent:no-source-range', { command });
      return false;
    }

    const target = findAdjacentEntry(sourceRange, command.direction, command.sourceId);
    const focused = target?.handle.focus({ position: command.position }) ?? false;
    debug('focus-adjacent', {
      direction: command.direction,
      position: command.position,
      sourceId: command.sourceId,
      sourceRange,
      targetId: target?.snapshot.id,
      targetRange: target?.snapshot.range,
      focused,
    });
    return focused;
  };

  const focusFromEditor = (command: ResolvedNavigationPayload): boolean => {
    const targetLineFrom = targetEditorLineFrom(command.direction);
    const target = targetLineFrom === undefined
      ? undefined
      : sortedEntries().find((entry) => containsLine(entry.snapshot.range, targetLineFrom));
    const focused = target?.handle.focus({ position: command.position }) ?? false;
    debug('focus-from-editor', {
      direction: command.direction,
      position: command.position,
      targetLineFrom,
      targetId: target?.snapshot.id,
      targetRange: target?.snapshot.range,
      focused,
    });
    return focused;
  };

  const findEntryAtLine = (
    lineNumber: number,
    sourceId?: string,
  ): EmbeddedWidgetEntry | undefined => {
    const lineFrom = view.state.doc.line(lineNumber).from;
    return sortedEntries(sourceId).find((entry) => containsLine(entry.snapshot.range, lineFrom));
  };

  const focusExitTarget = (command: ResolvedNavigationPayload): boolean => {
    const sourceRange = getCommandRange(command);
    if (!sourceRange) {
      debug('exit:no-source-range', { command });
      return false;
    }

    const lineNumber = adjacentLineNumberAroundRange(sourceRange, command.direction);
    if (lineNumber === undefined) {
      const focused = focusEditorAroundRange(sourceRange, command.direction);
      debug('exit:editor-around-range', { direction: command.direction, sourceRange, focused });
      return focused;
    }

    const target = findEntryAtLine(lineNumber, command.sourceId);
    if (target) {
      const focused = target.handle.focus({ position: command.position });
      debug('exit:widget-at-line', {
        direction: command.direction,
        position: command.position,
        lineNumber,
        sourceRange,
        targetId: target.snapshot.id,
        targetRange: target.snapshot.range,
        focused,
      });
      return focused;
    }

    focusEditorAtLine(lineNumber, command.direction);
    debug('exit:editor-line', { direction: command.direction, lineNumber, sourceRange });
    return true;
  };

  const exitWidget = (command: ResolvedNavigationPayload): boolean =>
    focusExitTarget(command);

  const focusById = (command: EmbeddedWidgetFocusPayload): boolean => {
    const handle = handles.get(command.id);
    const focused = handle?.focus({ position: command.position ?? 'end' }) ?? false;
    debug('focus-by-id', {
      id: command.id,
      position: command.position ?? 'end',
      focused,
    });
    return focused;
  };

  const dispatch = (command: EmbeddedWidgetCommand): boolean => {
    if (command.type === EMBEDDED_WIDGET_COMMAND.Focus) return focusById(command.payload);
    if (command.type === EMBEDDED_WIDGET_COMMAND.FocusAdjacent) {
      return focusAdjacent(resolveNavigationPayload(command.payload));
    }
    if (command.type === EMBEDDED_WIDGET_COMMAND.FocusFromEditor) {
      return focusFromEditor(resolveEditorPayload(command.payload));
    }
    return exitWidget(resolveNavigationPayload(command.payload));
  };

  const register = (handle: EmbeddedWidgetHandle): (() => void) => {
    handles.set(handle.id, handle);
    debug('register', { id: handle.id, priority: handle.priority });

    return () => {
      const current = handles.get(handle.id);
      const stale = current !== handle;
      if (!stale) handles.delete(handle.id);
      debug('unregister', { id: handle.id, stale });
    };
  };

  return {
    register,
    dispatch,
    snapshot,
  };
};

export const getEmbeddedWidgetBridge = (view: EditorView): EmbeddedWidgetBridge => {
  const bridge = bridges.get(view);
  if (bridge) return bridge;

  const nextBridge = createEmbeddedWidgetBridge(view);
  bridges.set(view, nextBridge);
  return nextBridge;
};
