import { defineStore } from 'pinia';

export enum HeadlineFolding {
  ShowHeadline,
  ShowFirstLevel,
  ShowAll,
}

interface ViewState {
  headlineFolding: HeadlineFolding;
}

export const useViewStore = defineStore('view', {
  state: (): ViewState => ({
    headlineFolding: HeadlineFolding.ShowAll,
  }),
  actions: {
    setHeadlineFolding(payload: HeadlineFolding) {
      this.headlineFolding = payload;
    },
    cycleToggleHeadlineFolding() {
      const foldedStatusCount = Object.keys(HeadlineFolding).length / 2;
      if (this.headlineFolding >= foldedStatusCount - 1) {
        this.headlineFolding = 0;
        return;
      }
      this.headlineFolding++;
    },
  },
});
