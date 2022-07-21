import { defineStore } from 'pinia';
import { generateHeadlineId } from 'src/tools';
import { Headline, OrgData, OrgNode } from 'uniorg';

interface HeadlineVisibleStatus {
  visible: boolean;
  nestedChildren: string[];
}

interface HeadlineInfo {
  headline: Headline;
  id: string;
  parent?: HeadlineInfo;
}

interface ViewState {
  // TODO: master delete
  // TODO: master add real type
  headlineFoldings: { [key: string]: HeadlineVisibleStatus };
  nodeVisibleStatus: { [key: string]: boolean };
  lastHeadlineInfo?: HeadlineInfo;
  tile?: boolean;
  loadingCount: number;
}

const defaultState: ViewState = {
  headlineFoldings: {},
  nodeVisibleStatus: {},
  lastHeadlineInfo: null,
  tile: false,
  loadingCount: 0,
};

export const useViewStore = defineStore('view', {
  state: (): ViewState => defaultState,
  getters: {
    isHeadlineVisible() {
      return (headline: Headline): boolean => {
        const headlineId = generateHeadlineId(headline as any);
        const currentHeadlineFolding = this.headlineFoldings[headlineId];
        return currentHeadlineFolding == null || currentHeadlineFolding.visible;
      };
    },
    isNodeVisible() {
      return (node: OrgData): boolean => {
        if (!node) {
          return true;
        }
        const nodeId = generateHeadlineId(node as any);
        const nodeVisible = this.nodeVisibleStatus[nodeId];
        return nodeVisible == null || nodeVisible;
      };
    },
    someNodeVisible(): boolean {
      return Object.values(this.nodeVisibleStatus).some((s) => s);
    },
    hasGlobalLoading(): boolean {
      return this.loadingCount > 0;
    },
  },
  actions: {
    registerHeadline(headline: Headline) {
      // TODO: master remove type casting
      const headlineId = generateHeadlineId(headline as any);
      this.headlineFoldings = {
        ...this.headlineFoldings,
        [headlineId]: {
          visible: true,
          nestedChildren: [],
        },
      };

      const parent = this._getParentHeadline(headline);

      this.lastHeadlineInfo = {
        headline,
        id: headlineId,
        parent,
      };
    },
    _getParentHeadline(headline: Headline): HeadlineInfo | undefined {
      const lastHeadline = this.lastHeadlineInfo?.headline;
      if (!lastHeadline) {
        return null;
      }
      if (lastHeadline.level === headline.level) {
        return this.lastHeadlineInfo.parent;
      }
      if (lastHeadline.level < headline.level) {
        return this.lastHeadlineInfo;
      }
      return null;
    },
    registerNestedNode(node: OrgNode, visible = true): void {
      if (
        !this.lastHeadlineInfo ||
        this._isUnfoldedNode(node) ||
        this._isUnfoldedNode(node) ||
        ((node as Headline).type === 'headline' &&
          (node as Headline).level === 1)
      ) {
        // NOTE: nested content doesn't require folding, cause his parent already registered
        return;
      }

      const nodeId = generateHeadlineId(node as any);

      this.nodeVisibleStatus = {
        ...this.nodeVisibleStatus,
        [nodeId]: visible,
      };

      const headlineLevel = node.type === 'headline' ? node.level : undefined;
      this.headlineFoldings = this._buildHeadlineFoldings(
        nodeId,
        headlineLevel
      );
    },
    _isUnfoldedNode(node: OrgNode): boolean {
      const alwaysOnDisplayTypes: OrgNode['type'][] = [
        'property-drawer',
        'section',
        'org-data',
        'keyword',
        'table-cell',
        'text',
      ];
      return !!alwaysOnDisplayTypes.find((t) => t === node.type);
    },
    // TODO: master refactor this bullshit
    _buildHeadlineFoldings(
      id: string,
      ignoreLevel?: number
    ): {
      [key: string]: HeadlineVisibleStatus;
    } {
      let parent = this.lastHeadlineInfo;
      const updatedHeadlineFoldings: { [key: string]: HeadlineVisibleStatus } =
        {};
      while (parent) {
        const headlineId = generateHeadlineId(parent?.headline as any);
        if (parent.headline.level !== ignoreLevel) {
          updatedHeadlineFoldings[headlineId] = {
            visible: true,
            nestedChildren: [
              ...this.headlineFoldings[headlineId].nestedChildren,
              id,
            ],
          };
        }
        parent = parent.parent;
      }
      return { ...this.headlineFoldings, ...updatedHeadlineFoldings };
    },
    foldHeadline(headline: Headline): void {
      this.setHeadlineFoldingStatus(headline, false);
    },
    setHeadlineFoldingStatus(headline: Headline, visible: boolean): void {
      const hedalineId = generateHeadlineId(headline as any);

      this.nodeVisibleStatus = this.headlineFoldings[
        hedalineId
      ].nestedChildren.reduce((acc, curr) => {
        acc[curr] = visible;
        return acc;
      }, this.nodeVisibleStatus);

      this.headlineFoldings = {
        ...this.headlineFoldings,
        [hedalineId]: {
          ...this.headlineFoldings[hedalineId],
          visible,
        },
      };
    },
    setCollapseStatusForAllNodes(status: boolean): void {
      console.log(status);

      this.headlineFoldings = Object.keys(this.headlineFoldings).reduce<{
        [key: string]: HeadlineVisibleStatus;
      }>((acc, key) => {
        acc[key] = { ...this.headlineFoldings[key], visible: status };
        return acc;
      }, {});

      this.nodeVisibleStatus = Object.keys(this.nodeVisibleStatus).reduce(
        (acc, key) => {
          return { ...acc, [key]: status };
        },
        {}
      );
    },
    resetView(): void {
      this.headlineFoldings = defaultState.headlineFoldings;
      this.nodeVisibleStatus = defaultState.nodeVisibleStatus;
      this.lastHeadlineInfo = defaultState.lastHeadlineInfo;
    },
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
