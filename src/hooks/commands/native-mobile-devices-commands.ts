import { Command } from 'orgnote-api';
import { useQuasar } from 'quasar';

export function getMobileDevicesCommands(): Command[] {
  const $q = useQuasar();
  if (!$q.platform.is.mobile) {
    return [];
  }

  const commands: Command[] = [
    // TODO: master real path
    {
      command: 'select file path',
      description: 'select file path',
      available: () => $q.platform.is.mobile,
      handler: async () => {},
    },
  ];

  return commands;
}
