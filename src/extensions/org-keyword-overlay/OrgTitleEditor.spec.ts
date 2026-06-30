import { EditorState } from '@codemirror/state';
import { markRaw, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import type { OrgNode } from 'org-mode-ast';
import { afterEach, expect, test, vi } from 'vitest';
import {
  EMBEDDED_WIDGET_COMMAND,
  EMBEDDED_WIDGET_DIRECTION,
  getEmbeddedWidgetBridge,
} from 'src/utils/org-editor/embedded-widget-runtime';
import OrgTitleEditor from './OrgTitleEditor.vue';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

const titleText = '#+TITLE: Hello';

const createTitleNode = (): OrgNode => ({
  start: 0,
  end: titleText.length,
  children: {
    first: { value: titleText },
  },
}) as unknown as OrgNode;

const createEditorView = () => ({
  state: EditorState.create({
    doc: `${titleText}\n\n:PROPERTIES:`,
    selection: { anchor: `${titleText}\n`.length },
  }),
  hasFocus: false,
  dispatch: vi.fn(),
  focus: vi.fn(),
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('OrgTitleEditor focuses synchronously when bridge enters from the line below', async () => {
  const focus = vi.spyOn(HTMLTextAreaElement.prototype, 'focus');
  const editorView = markRaw(createEditorView());

  mount(OrgTitleEditor, {
    props: {
      node: createTitleNode(),
      editorView: editorView as never,
    },
  });
  await nextTick();

  const bridge = getEmbeddedWidgetBridge(editorView as never);
  expect(bridge.snapshot().map((widget) => widget.id)).toEqual(['title:0']);

  const focused = bridge.dispatch({
    type: EMBEDDED_WIDGET_COMMAND.FocusFromEditor,
    payload: {
      direction: EMBEDDED_WIDGET_DIRECTION.Previous,
      position: 'end',
    },
  });

  expect(focused).toBe(true);
  expect(focus).toHaveBeenCalledTimes(1);
});
