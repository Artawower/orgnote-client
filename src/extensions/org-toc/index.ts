import type { Command, Extension, OrgNoteApi } from 'orgnote-api';
import { DefaultCommands } from 'orgnote-api';
import OrgToc from './OrgToc.vue';

const COMMAND_NAME = DefaultCommands.OPEN_OUTLINE;

const createCommand = (): Command => ({
  command: COMMAND_NAME,
  group: 'right panel',
  icon: 'sym_o_format_list_bulleted',
  handler: (api: OrgNoteApi) => {
    api.ui.useRightPanel().openComponent(OrgToc);
  },
});

let registeredCommand: Command | null = null;

export const orgTocExtension: Extension = {
  onMounted: async (api) => {
    registeredCommand = createCommand();
    api.core.useCommands().add(registeredCommand);
    api.ui.useRightPanel().addCommand(COMMAND_NAME);
  },

  onUnmounted: async (api) => {
    if (registeredCommand) {
      api.core.useCommands().remove(registeredCommand);
      registeredCommand = null;
    }
    api.ui.useRightPanel().removeCommand(COMMAND_NAME);
  },
};

export { orgTocManifest } from './manifest';
