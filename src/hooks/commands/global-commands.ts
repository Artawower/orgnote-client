import { Command, DefaultCommands } from 'orgnote-api';
import FileManagerSideBar from 'src/components/containers/FileManagerSideBar.vue';
import DebugPage from 'src/pages/DebugPage.vue';
import LoggerPage from 'src/pages/LoggerPage.vue';
import ProjectInfo from 'src/pages/ProjectInfo.vue';
import { useModalStore } from 'src/stores/modal';
import { useNoteCreatorStore } from 'src/stores/note-creator';
import { useNotesStore } from 'src/stores/notes';
import { useOrgNoteApiStore } from 'src/stores/orgnote-api.store';
import { useSidebarStore } from 'src/stores/sidebar';
import { mockServer } from 'src/tools';

export function getGlobalCommands(): Command[] {
  const modalStore = useModalStore();
  const sidebarStore = useSidebarStore();
  const noteCreatorStore = useNoteCreatorStore();
  const notesStore = useNotesStore();

  const { orgNoteApi } = useOrgNoteApiStore();
  const fileManagerStore = orgNoteApi.core.useFileManagerStore();

  const commands: Command[] = [
    {
      command: DefaultCommands.REPORT_BUG,
      description: 'report bug',
      group: 'debug',
      handler: mockServer(() =>
        // TODO: remove hardcode
        window.open(
          'https://github.com/Artawower/orgnote-client/issues/new/choose',
          '_blank'
        )
      ),
    },
    {
      command: DefaultCommands.OPEN_DEBUG_INFO,
      keySequence: 'Ctrl+KeyD',
      description: 'open debug info',
      group: 'debug',
      handler: () => {
        modalStore.open(DebugPage, { title: 'system info' });
      },
    },
    {
      command: DefaultCommands.SHOW_LOGS,
      keySequence: 'Ctrl+KeyD',
      description: 'show logs',
      group: 'debug',
      handler: () => {
        modalStore.open(LoggerPage, { title: 'logs' });
      },
    },

    {
      command: DefaultCommands.TOGGLE_SIDEBAR,
      group: 'global',
      icon: () => {
        return sidebarStore.opened ? 'arrow_circle_left' : 'menu';
      },
      description: 'toggle sidebar',
      handler: () => {
        sidebarStore.toggle();
      },
    },
    {
      command: DefaultCommands.TOGGLE_FILE_MANAGER,
      group: 'global',
      icon: 'folder',
      description: 'toggle file manager',
      handler: () => {
        sidebarStore.toggleWithComponent(FileManagerSideBar);
      },
    },
    {
      command: DefaultCommands.CREATE_NOTE,
      group: 'global',
      icon: 'o_add_box',
      handler: () => noteCreatorStore.create(),
    },
    {
      command: DefaultCommands.PROJECT_INFO,
      icon: 'o_info',
      description: 'show project info',
      group: 'global',
      handler: () => modalStore.open(ProjectInfo),
    },
    {
      command: DefaultCommands.SYNC_FILES,
      icon: 'sync',
      description: 'sync files',
      group: 'global',
      handler: () => {
        notesStore.syncWithFs();
        fileManagerStore.updateFileManager();
      },
    },
  ];

  return commands;
}
