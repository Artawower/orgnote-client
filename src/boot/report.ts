import { defineBoot } from '@quasar/app-vite/wrappers';
import type { ErrorReporter } from 'src/utils/error-reporter';
import { createErrorReporter } from 'src/utils/error-reporter';
import { logger } from './logger';
import { useNotificationsStore } from 'src/stores/notifications';
import { useCommandsStore } from 'src/stores/command';

let reporter: ErrorReporter;

const initReport = (): ErrorReporter => {
  const notifications = useNotificationsStore();
  const commands = useCommandsStore();
  reporter = createErrorReporter(logger, notifications, commands.execute);
  return reporter;
};

export default defineBoot(() => {
  initReport();
});

export { reporter, initReport };
