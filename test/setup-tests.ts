import { vi } from 'vitest';
import { config } from '@vue/test-utils';
import { Quasar } from 'quasar';
import iconSet from 'quasar/icon-set/material-icons';

config.global.plugins = [
  [
    Quasar,
    {
      iconSet,
      plugins: {},
    },
  ],
];

if (!globalThis.HTMLDialogElement) {
  class HTMLDialogElementMock extends HTMLElement {
    open = false;
    showModal = vi.fn(() => {
      this.open = true;
    });
    close = vi.fn(() => {
      this.open = false;
    });
  }
  globalThis.HTMLDialogElement = HTMLDialogElementMock as unknown as typeof HTMLDialogElement;
}
