import { defineBoot } from '@quasar/app-vite/wrappers';
import { createAuthCommands } from 'src/commands/auth-commands';
import { getCompletionCommands } from 'src/commands/completion';
import { getFileManagerCommands } from 'src/commands/file-manager';
import { getGlobalCommands } from 'src/commands/global-commands';
import { getNoteCommands } from 'src/commands/note-commands';
import { getTabsCommands } from 'src/commands/tabs';
import { getPaneCommands } from 'src/commands/pane-commands';
import { getRoutesCommands } from 'src/commands/router-commands';
import { getSettingsCommands } from 'src/commands/settings-commands';
import { getThemeCommands } from 'src/commands/theme-commands';
import { useCommandsStore } from 'src/stores/command';
import { getModalCommands } from 'src/commands/modal-commands';
import { getDeveloperCommands } from 'src/commands/developer-commands';
import { getRightPanelCommands } from 'src/commands/right-panel-commands';

export default defineBoot(async ({ router }) => {
  const commandsStore = useCommandsStore();

  commandsStore.add(
    ...getRoutesCommands(router),
    ...getGlobalCommands(),
    ...getSettingsCommands(),
    ...getThemeCommands(),
    ...getCompletionCommands(),
    ...getTabsCommands(),
    ...getPaneCommands(),
    ...getFileManagerCommands(),
    ...getNoteCommands(),
    ...getModalCommands(),
    ...getDeveloperCommands(),
    ...getRightPanelCommands(),
    ...createAuthCommands(router),
  );
});
