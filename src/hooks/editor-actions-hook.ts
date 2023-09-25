import { useNoteEditorStore, useToolbarStore } from 'src/stores';

import { onMounted, onUnmounted } from 'vue';

// TODO: master use API instead.
export const useEditorActions = () => {
  const toolbarStore = useToolbarStore();
  const noteEditorStore = useNoteEditorStore();

  const registerActions = () => {
    toolbarStore.setAdditionalAction({
      name: 'debug',
      handler: () => noteEditorStore.toggleDebug(),
      icon: 'bug_report',
      permament: true,
      sidebarPosition: 'top',
    });
  };

  onMounted(() => registerActions());
  onUnmounted(() => toolbarStore.backToPreviousActions());
};
