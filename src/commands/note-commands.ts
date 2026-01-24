import type { Command, CommandHandlerParams, OrgNoteApi } from 'orgnote-api';
import { DefaultCommands, RouteNames } from 'orgnote-api';
import { useNotePickCompletion } from 'src/composables/file-pick-completion';

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
      group: 'public',
      handler: async (api, params: CommandHandlerParams<{ text: string }>) => {
        const text = params?.data?.text ?? '';
        const logger = api.utils.logger;
        if (!text.trim()) {
          logger.warn('Preview note skipped: empty text');
          return;
        }
        logger.info('Preview note requested', { length: text.length });
        const layoutStore = api.core.useLayout();
        const router = api.vue.router;
        if (router.currentRoute.value.name !== RouteNames.Panes) {
          await router.push({ name: RouteNames.Panes });
        }
        await layoutStore.initLayout();
        const bufferViewer = api.core.useBufferViewer();
        const uri = api.core.useEmbeddedBuffer().create(text);
        await bufferViewer.open(uri);
        logger.info('Preview note buffer opened', { uri });
      },
    },
  ];

  return commands;
}
