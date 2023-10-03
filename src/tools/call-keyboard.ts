// NOTE: hack for ios safari
export function callKeyboard(): void {
  const fakeInput = document.createElement('input');
  fakeInput.setAttribute('type', 'text');
  fakeInput.style.position = 'absolute';
  fakeInput.style.top = '-999999px';
  fakeInput.style.left = '-999999px';
  document.body.appendChild(fakeInput);
  fakeInput.focus();
  setTimeout(() => document.body.removeChild(fakeInput), 500);
}
