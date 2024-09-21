import { Command } from 'orgnote-api';
import { useQuasar } from 'quasar';
import { useOrgNoteApiStore } from 'src/stores/orgnote-api.store';

export function getMobileDevicesCommands(): Command[] {
  const $q = useQuasar();
  if (!$q.platform.is.mobile) {
    return [];
  }

  const { orgNoteApi } = useOrgNoteApiStore();

  const commands: Command[] = [
    {
      command: 'select file path',
      description: 'select file path',
      available: () => $q.platform.is.mobile,
      icon: 'folder_open',
      group: 'mobile',
      handler: async () => {
        // TODO: open file manager here with native mobile os view
      },
    },
  ];

  return commands;
}
