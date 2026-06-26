import { expect, test } from 'vitest';
import { parse } from 'org-mode-ast';
import {
  getPropertyWidgetRange,
  insertEmptyPropertyDrawer,
  isRootPropertySequenceStart,
  replacePropertyItems,
} from './property-source';

const createFakeView = (content: string) => {
  const calls: unknown[] = [];
  return {
    calls,
    view: {
      state: {
        doc: { length: content.length, toString: () => content },
        selection: { main: { head: 0 } },
        changes: () => ({ mapPos: (position: number) => position }),
      },
      dispatch: (transaction: unknown) => calls.push(transaction),
    },
  };
};

test('property source detects root property sequence after keywords', () => {
  const root = parse('#+title: X\n:PROPERTIES:\n:type: note\n:END:\n\n* H\n');
  const propertyStart = root.childrenList.find((node) => node.rawValue === ':PROPERTIES:')!;
  expect(isRootPropertySequenceStart(propertyStart)).toBe(true);
  expect(getPropertyWidgetRange(propertyStart)).toEqual({ from: 11, to: 41 });
});

test('property source replaces current drawer range', () => {
  const root = parse(':PROPERTIES:\n:type: old\n:END:\n');
  const drawer = root.childrenList[0]!;
  const { calls, view } = createFakeView(root.rawValue);

  replacePropertyItems(view as never, drawer, [{ key: 'type', value: 'new' }]);

  expect(calls).toHaveLength(1);
  expect(calls[0]).toMatchObject({
    changes: { ...getPropertyWidgetRange(drawer), insert: ':PROPERTIES:\n:type: new\n:END:' },
  });
});

test('property source reports applied drawer replacement', () => {
  const root = parse(':PROPERTIES:\n:type: old\n:END:\n');
  const drawer = root.childrenList[0]!;
  const { calls, view } = createFakeView(root.rawValue);
  let applied = false;

  replacePropertyItems(view as never, drawer, [{ key: 'type', value: 'new' }], () => {
    applied = true;
  });

  expect(applied).toBe(true);
  expect(calls).toHaveLength(1);
});

test('property source inserts empty drawer at target position', () => {
  const { calls, view } = createFakeView('* H\n');
  insertEmptyPropertyDrawer(view as never, 0);
  expect(calls).toHaveLength(1);
  expect(calls[0]).toMatchObject({
    changes: { from: 0, to: 0, insert: ':PROPERTIES:\n:END:\n' },
  });
});
