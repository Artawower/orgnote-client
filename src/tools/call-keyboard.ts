// NOTE: hack for ios safari
export function revealKeyboard(): void {
  const fakeInput = document.createElement('input') as HTMLInputElement;
  fakeInput.setAttribute('type', 'text');
  fakeInput.style.position = 'absolute';
  fakeInput.attributes.autocomplete = 'off';
  fakeInput.style.top = '-999999px';
  fakeInput.style.left = '-999999px';
  document.body.appendChild(fakeInput);
  fakeInput.focus();
  setTimeout(() => document.body.removeChild(fakeInput), 500);
}
