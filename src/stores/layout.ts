import type {
  DropDirection,
  LayoutNode,
  LayoutPaneNode,
  LayoutSnapshot,
  LayoutStore,
  PanePosition,
  HorizontalPosition,
  VerticalPosition,
} from 'orgnote-api';
import { defineStore, storeToRefs } from 'pinia';
import { v4 } from 'uuid';
import { shallowRef } from 'vue';
import { debounce } from 'src/utils/debounce';
import { to } from 'orgnote-api/utils';
import { DEFAULT_PANE_PERSISTENCE_SAVE_DELAY } from 'src/constants/config';
import { usePaneStore } from './pane';
import { useConfigStore } from './config';
import { logger } from 'src/boot/logger';
import { repositories } from 'src/boot/repositories';

export const useLayoutStore = defineStore<'layout', LayoutStore>('layout', () => {
  const paneStore = usePaneStore();
  const { activePaneId } = storeToRefs(paneStore);
  const configStore = useConfigStore();

  const layout = shallowRef<LayoutNode | undefined>();

  const initLayout = async (layoutParam?: LayoutNode): Promise<void> => {
    if (layoutParam) {
      layout.value = layoutParam;
    }

    if (!activePaneId.value) {
      await initPane();
    }

    const paneNode: LayoutPaneNode = createPaneNode(activePaneId.value!);
    layout.value = paneNode;
  };

  const initPane = async () => {
    const pane = await paneStore.createPane();
    await paneStore.addTab(pane.id);
    paneStore.setActivePane(pane.id);
  };

  const safeSave = async (): Promise<void> => {
    const result = await to(saveLayout)();
    if (result.isErr()) {
      logger.error('Pane snapshot save failed', { error: result.error, context: 'auto-save' });
    }
  };

  const getSaveDelay = (): number => {
    return configStore.config.ui.persistantPanesSaveDelay ?? DEFAULT_PANE_PERSISTENCE_SAVE_DELAY;
  };

  const scheduleSave = debounce(safeSave, getSaveDelay);

  const shouldPersistPanes = (): boolean => {
    return Boolean(configStore.config?.ui.persistantPanes);
  };

  const getLayoutSnapshot = (): LayoutSnapshot | undefined => {
    if (!layout.value) return;

    const panesData = paneStore.getPanesData();
    return {
      panes: panesData,
      activePaneId: activePaneId.value || '',
      timestamp: Date.now(),
      layout: layout.value,
    };
  };

  const saveLayout = async (): Promise<void> => {
    if (!shouldPersistPanes() || !layout.value) {
      return;
    }

    const repository = repositories.layoutSnapshotRepository;
    const snapshot = getLayoutSnapshot();
    if (!snapshot) {
      return;
    }
    await repository.save(snapshot);
  };

  const clearPanes = (): void => {
    const paneIds = Object.keys(paneStore.panes);
    paneIds.forEach((id) => paneStore.closePane(id));
  };

  const safeInitLayout = async (): Promise<void> => {
    const result = await to(initLayout)();
    if (result.isErr()) {
      logger.error('Layout initialization failed', { error: result.error });
    }
  };

  const restoreLayout = async (): Promise<void> => {
    if (!shouldPersistPanes()) {
      await safeInitLayout();
      return;
    }

    const repository = repositories.layoutSnapshotRepository;
    const stored = await repository.getLatest();
    if (!stored) {
      await safeInitLayout();
      return;
    }

    await restoreLayoutSnapshot(stored.snapshot);
  };

  const restoreLayoutSnapshot = async (snapshot: LayoutSnapshot): Promise<void> => {
    clearPanes();

    await paneStore.restorePanesData(snapshot.panes);

    activePaneId.value = snapshot.activePaneId;
    if (snapshot.layout) {
      layout.value = snapshot.layout;
    }
  };

  const findPaneInLayout = (paneId: string, node?: LayoutNode): LayoutNode | undefined => {
    const searchNode = node ?? layout.value;

    if (searchNode?.type === 'pane') {
      return searchNode.paneId === paneId ? searchNode : undefined;
    }

    for (const child of searchNode!.children) {
      const found = findPaneInLayout(paneId, child);
      if (found) return found;
    }
  };

  const shouldRemoveNode = (node: LayoutNode, paneId: string): boolean => {
    return node.type === 'pane' && node.paneId === paneId;
  };

  const removeNodeFromTree = (node: LayoutNode, paneId: string): LayoutNode | undefined => {
    if (shouldRemoveNode(node, paneId)) return;
    if (node.type !== 'split') return node;

    const filteredChildren = node.children
      .map((child) => removeNodeFromTree(child, paneId))
      .filter((child): child is LayoutNode => !!child);

    if (filteredChildren.length === 0) return;
    if (filteredChildren.length === 1) return filteredChildren[0];

    return {
      ...node,
      children: filteredChildren,
    };
  };

  const removePaneFromLayout = (paneId: string): void => {
    if (!layout.value) return;

    if (layout.value.type === 'pane' && layout.value.paneId === paneId) {
      return;
    }

    const result = removeNodeFromTree(layout.value, paneId);

    if (result) {
      layout.value = result;
    }
  };

  const getSplitOrientation = (direction: DropDirection): 'horizontal' | 'vertical' => {
    const isHorizontal = direction === 'left' || direction === 'right';
    return isHorizontal ? 'horizontal' : 'vertical';
  };

  const orderSplitChildren = (
    direction: DropDirection,
    newPaneNode: LayoutPaneNode,
    paneNode: LayoutNode,
  ): LayoutNode[] => {
    const shouldNewPaneFirst = direction === 'left' || direction === 'top';
    return shouldNewPaneFirst ? [newPaneNode, paneNode] : [paneNode, newPaneNode];
  };

  const createSplitNode = (
    direction: DropDirection,
    newPaneNode: LayoutPaneNode,
    paneNode: LayoutNode,
  ): LayoutNode => {
    return {
      type: 'split' as const,
      id: v4(),
      orientation: getSplitOrientation(direction),
      children: orderSplitChildren(direction, newPaneNode, paneNode),
      sizes: [50, 50],
    };
  };

  const replaceRootLayout = (splitNode: LayoutNode): void => {
    layout.value = splitNode;
  };

  const replaceNodeInTree = (
    node: LayoutNode,
    targetNode: LayoutNode,
    replacement: LayoutNode,
  ): LayoutNode => {
    if (node === targetNode) return replacement;
    if (node.type === 'split') {
      return {
        ...node,
        children: node.children.map((child) => replaceNodeInTree(child, targetNode, replacement)),
      };
    }
    return node;
  };

  const createPaneWithEmptyTabs = async (): Promise<string> => {
    const pane = await paneStore.createPane();
    return pane.id;
  };

  const createPaneWithInitialTab = async (): Promise<string> => {
    const pane = await paneStore.createPane();
    await paneStore.addTab(pane.id);
    return pane.id;
  };

  const createNewPaneForSplit = async (shouldCreateTab: boolean): Promise<string> =>
    shouldCreateTab ? await createPaneWithInitialTab() : await createPaneWithEmptyTabs();

  const splitPaneInLayout = async (
    paneId: string,
    direction: DropDirection,
    createInitialTab = true,
  ): Promise<string> => {
    const paneNode = findPaneInLayout(paneId);

    if (!paneNode || paneNode.type !== 'pane') {
      throw new Error(`Pane ${paneId} not found in layout`);
    }

    const newPaneId = await createNewPaneForSplit(createInitialTab);

    const newPaneNode = createPaneNode(newPaneId);

    const splitNode = createSplitNode(direction, newPaneNode, paneNode);

    if (layout.value === paneNode) {
      replaceRootLayout(splitNode);
      scheduleSave();
      return newPaneId;
    }

    layout.value = replaceNodeInTree(layout.value!, paneNode, splitNode);
    activePaneId.value = newPaneId;
    scheduleSave();
    return newPaneId;
  };

  const createPaneNode = (paneId: string): LayoutPaneNode => {
    return {
      type: 'pane',
      id: v4(),
      paneId,
    };
  };

  const updateNodeInTree = (
    node: LayoutNode,
    targetId: string,
    newSizes: number[],
  ): LayoutNode => {
    if (node.id === targetId && node.type === 'split') {
      return { ...node, sizes: newSizes };
    }

    if (node.type !== 'split') return node;

    return {
      ...node,
      children: node.children.map((child) => updateNodeInTree(child, targetId, newSizes)),
    };
  };

  const updateNodeSizes = (nodeId: string, sizes: number[]): void => {
    if (!layout.value) return;

    layout.value = updateNodeInTree(layout.value, nodeId, sizes);
    scheduleSave();
  };

  const normalizeSizes = (sizes: number[]): number[] => {
    if (sizes.length === 0) return [];

    const sum = sizes.reduce((acc, size) => acc + size, 0);
    if (Math.abs(sum - 100) < 0.01) return sizes;

    return sizes.map((size) => (size / sum) * 100);
  };

  const isPaneExistsInStore = (paneId: string): boolean => Boolean(paneStore.panes[paneId]);

  const collectPaneIds = (node: LayoutNode): string[] => {
    if (node.type === 'pane') {
      return [node.paneId];
    }
    return node.children.flatMap(collectPaneIds);
  };

  const getAllLayoutPaneIds = (): string[] => {
    if (!layout.value) return [];
    return collectPaneIds(layout.value);
  };

  const findOrphanedPaneIds = (): string[] => {
    const layoutPaneIds = getAllLayoutPaneIds();
    return layoutPaneIds.filter((paneId) => !isPaneExistsInStore(paneId));
  };

  const cleanupOrphanedNodes = (): void => {
    const orphanedIds = findOrphanedPaneIds();
    if (orphanedIds.length === 0) return;

    orphanedIds.forEach((paneId) => {
      removePaneFromLayout(paneId);
    });

    scheduleSave();
  };

  const shouldCleanupAfterAction = (actionName: string): boolean =>
    actionName === 'deletePane' || actionName === 'closePane' || actionName === 'closeTab';

  paneStore.$onAction(({ name, after, args }) => {
    after(() => {
      if (name === 'closePane' && args && args[0]) {
        const paneId = args[0] as string;
        removePaneFromLayout(paneId);
        scheduleSave();
      } else if (shouldCleanupAfterAction(name)) {
        cleanupOrphanedNodes();
      }
    });
  });

  const getPanePosition = (paneId: string): PanePosition | undefined => {
    if (!layout.value) return;
    return findPanePosition(layout.value, paneId, { horizontal: 'center', vertical: 'center' });
  };

  const findPanePosition = (
    node: LayoutNode,
    paneId: string,
    currentPosition: PanePosition,
  ): PanePosition | undefined => {
    if (node.type === 'pane') {
      return node.paneId === paneId ? currentPosition : undefined;
    }

    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      if (!child) continue;

      const childPosition = getChildPosition(node, i, currentPosition);
      const result = findPanePosition(child, paneId, childPosition);
      if (result) return result;
    }
  };

  const getChildPosition = (
    node: LayoutNode & { type: 'split' },
    childIndex: number,
    currentPosition: PanePosition,
  ): PanePosition => {
    const isFirst = childIndex === 0;
    const isLast = childIndex === node.children.length - 1;

    if (node.orientation === 'horizontal') {
      const horizontal: HorizontalPosition = isFirst ? 'left' : isLast ? 'right' : 'center';
      return { ...currentPosition, horizontal };
    }

    const vertical: VerticalPosition = isFirst ? 'top' : isLast ? 'bottom' : 'center';
    return { ...currentPosition, vertical };
  };

  const store: LayoutStore = {
    layout,
    initLayout,
    splitPaneInLayout,
    removePaneFromLayout,
    updateNodeSizes,
    normalizeSizes,
    saveLayout,
    restoreLayout,
    getLayoutSnapshot,
    restoreLayoutSnapshot,
    getPanePosition,
  };

  return store;
});
