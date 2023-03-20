import { defineStore } from 'pinia';

interface ViewState {
  tile?: boolean;
  loadingCount: number;
}

const defaultState: ViewState = {
  tile: false,
  loadingCount: 0,
};

export const useViewStore = defineStore('view', {
  state: (): ViewState => defaultState,
  getters: {
    hasGlobalLoading(): boolean {
      return this.loadingCount > 0;
    },
  },
  actions: {
    toggleTile(): void {
      this.tile = !this.tile;
    },
    addLoading(): void {
      this.loadingCount += 1;
    },
    removeLoading(): void {
      this.loadingCount -= 1;
    },
  },
  persist: true,
});
