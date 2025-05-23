import { Command } from 'orgnote-api';
import { useQuasar } from 'quasar';

export function getMobileDevicesCommands(): Command[] {
  const $q = useQuasar();
  if (!$q.platform.is.mobile) {
    return [];
  }

  const commands: Command[] = [
    {
      command: 'select file path',
      description: 'select file path',
      disabled: () => !$q.platform.is.mobile,
      icon: 'folder_open',
      group: 'mobile',
      handler: async () => {
        // TODO: open file manager here with native mobile os view
      },
    },
  ];

  return commands;
}
