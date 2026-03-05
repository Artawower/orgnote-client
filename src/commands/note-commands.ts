import type { Command, CommandHandlerParams, OrgNoteApi } from 'orgnote-api';
import { DefaultCommands, I18N, RouteNames } from 'orgnote-api';
import { useNotePickCompletion } from 'src/composables/file-pick-completion';
import NoteInfoModal from 'src/containers/NoteInfoModal.vue';
import { getCurrentNoteInfo } from 'src/utils/current-note-info';

export function getNoteCommands(): Command[] {
  const commands: Command[] = [
    {
      command: DefaultCommands.OPEN_NOTE,
      title: DefaultCommands.OPEN_NOTE,
      group: 'note',
      icon: 'sym_o_edit_square',
      handler: async (api: OrgNoteApi, params?: CommandHandlerParams<{ path: string }>) => {
        const path = params?.data?.path ?? (await useNotePickCompletion(api, '/'));

        if (!path) {
          return;
        }

        const bufferViewer = api.core.useBufferViewer();
        await bufferViewer.open(path);
      },
    },
    {
      command: DefaultCommands.PREVIEW_NOTE,
      icon: 'sym_o_image_search',
      group: 'note',
      hide: () => true,
      handler: async (api, params: CommandHandlerParams<{ text: string }>) => {
        const text = params?.data?.text ?? '';
        if (!text.trim()) {
          return;
        }
        const layoutStore = api.core.useLayout();
        const router = api.vue.router;
        if (router.currentRoute.value.name !== RouteNames.Panes) {
          await router.push({ name: RouteNames.Panes });
        }
        await layoutStore.initLayout();
        const bufferViewer = api.core.useBufferViewer();
        const uri = api.core.useEmbeddedBuffer().create(text);
        await bufferViewer.open(uri);
      },
    },
    {
      command: DefaultCommands.SHARE_NOTE_ONETIME,
      icon: 'sym_o_ios_share',
      group: 'note',
      handler: async (api) => {
        const { activeContext } = api.core.useEditor();
        const n = api.core.useNotifications();

        if (!activeContext?.orgNode) {
          n.notify({
            level: 'warning',
            message: I18N.NO_SELECTED_NOTE,
          });
          return;
        }

        const payload = {
          command: DefaultCommands.PREVIEW_NOTE,
          data: { text: activeContext?.orgNode?.rawValue },
        };

        const shareUrl = `${window.location.origin}${
          window.location.pathname
        }?execute=${encodeURIComponent(JSON.stringify(payload))}`;

        await api.utils.copyToClipboard(shareUrl);
        n.notify({
          message: I18N.COPIED_TO_CLIPBOARD,
        });
      },
    },
    {
      command: DefaultCommands.SHOW_FILE_INFO,
      icon: 'sym_o_info',
      group: 'note',
      handler: async (api) => {
        const notifications = api.core.useNotifications();
        const noteInfo = await getCurrentNoteInfo(api);

        if (!noteInfo) {
          notifications.notify({
            level: 'warning',
            message: I18N.NO_SELECTED_NOTE,
          });
          return;
        }

        api.ui.useModal().open(NoteInfoModal, {
          title: DefaultCommands.SHOW_FILE_INFO,
          modalProps: { noteInfo },
        });
      },
    },
  ];

  return commands;
}
