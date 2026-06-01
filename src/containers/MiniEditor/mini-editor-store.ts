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
