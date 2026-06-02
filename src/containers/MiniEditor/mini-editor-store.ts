import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { MiniEditorSession } from './types';

export const buildEmptySession = (): MiniEditorSession => ({
  title: '',
  body: '',
  tags: [],
  priority: undefined,
  scheduledDate: undefined,
  bodyLoaded: false,
  fullSize: false,
});

// Temporary hidden <input> used to raise the iOS keyboard within a user gesture
// before the async modal mount. Not app state — a transient DOM bridge.
let iosCarrier: HTMLInputElement | null = null;

export const setIosCarrier = (el: HTMLInputElement): void => {
  // Remove any orphaned carrier (e.g. previous open whose modal never mounted)
  iosCarrier?.remove();
  iosCarrier = el;
};

export const consumeIosCarrier = (): HTMLInputElement | null => {
  const carrier = iosCarrier;
  iosCarrier = null;
  return carrier;
};

export const useMiniEditorStore = defineStore('miniEditor', () => {
  const title = ref('');
  const body = ref('');
  const tags = ref<string[]>([]);
  const priority = ref<string | undefined>(undefined);
  const scheduledDate = ref<string | undefined>(undefined);
  const bodyLoaded = ref(false);
  const fullSize = ref(false);

  return { title, body, tags, priority, scheduledDate, bodyLoaded, fullSize };
});
