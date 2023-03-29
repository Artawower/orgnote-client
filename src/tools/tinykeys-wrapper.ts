import tinykeys from 'tinykeys';

/*
 * This is solution for allowing enable/disable keybinding inside input fields
 * original solution: https://github.com/jamiebuilds/tinykeys/issues/17#issuecomment-1163109758
 */

function isEventTargetInputOrTextArea(target: Window | HTMLElement) {
  if (target === null) return false;

  const targetElementName = (target as HTMLElement).tagName.toLowerCase();
  return ['input', 'textarea'].includes(targetElementName);
}

export default function hotkeys(
  target: Window | HTMLElement,
  bindings: { [key: string]: (arg?: unknown) => unknown },
  disableOnInputs = true
) {
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
  tinykeys(target, wrappedBindings);
}