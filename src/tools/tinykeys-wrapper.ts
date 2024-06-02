/*
 * This is solution for allowing enable/disable keybinding inside input fields
 * original solution: https://github.com/jamiebuilds/tinykeys/issues/17#issuecomment-1163109758
 */

import { mockServer } from './mock-server';

function isEventTargetInputOrTextArea(target: Window | HTMLElement) {
  if (target === null) return false;
  const targetElementName = (target as HTMLElement).tagName.toLowerCase();
  const isContentEditable = (target as HTMLElement).isContentEditable;
  return isContentEditable || ['input', 'textarea'].includes(targetElementName);
}

function _hotkeys(
  target: Window | HTMLElement,
  bindings: { [key: string]: (arg?: KeyboardEvent) => unknown },
  disableOnInputs = true
): () => void {
  const wrappedBindings = disableOnInputs
    ? Object.fromEntries(
        Object.entries(bindings).map(([key, handler]) => [
          key,
          (event: KeyboardEvent) => {
            if (!isEventTargetInputOrTextArea(event.target as HTMLElement)) {
              handler(event);
            }
          },
        ])
      )
    : bindings;
  return window.tinykeys(target, wrappedBindings);
}

export const hotkeys = mockServer(_hotkeys);
