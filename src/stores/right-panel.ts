import { defineStore } from 'pinia';
import { ref } from 'vue';
import { DefaultCommands, type RightPanelStore } from 'orgnote-api';
import { usePanelState } from 'src/composables/use-panel-state';
import {
  RIGHT_PANEL_MIN_WIDTH,
  RIGHT_PANEL_MAX_WIDTH,
  RIGHT_PANEL_DEFAULT_WIDTH,
} from 'src/constants/right-panel';

export const useRightPanelStore = defineStore<'rightPanel', RightPanelStore>('rightPanel', () => {
  const panel = usePanelState([DefaultCommands.TOGGLE_RIGHT_PANEL]);

  const width = ref(RIGHT_PANEL_DEFAULT_WIDTH);

  const setWidth = (w: number) => {
    if (Number.isNaN(w)) return;
    width.value = Math.max(RIGHT_PANEL_MIN_WIDTH, Math.min(w, RIGHT_PANEL_MAX_WIDTH));
  };

  const store: RightPanelStore = {
    ...panel,
    width,
    setWidth,
  };

  return store;
});
