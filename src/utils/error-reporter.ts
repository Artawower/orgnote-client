import { DefaultCommands, type OrgNoteApi } from 'orgnote-api';
import { isPresent } from './nullable-guards';

type LogLevel = 'error' | 'warn' | 'info';
type Logger = OrgNoteApi['utils']['logger'];
type ErrorReporterNotifications = Pick<
  ReturnType<OrgNoteApi['core']['useNotifications']>,
  'notify'
>;
type CommandExecutor = (command: string) => Promise<void>;
type StoreDef = ReturnType<OrgNoteApi['core']['useNotifications']>;
type NotificationConfig = Parameters<StoreDef['notify']>[0];
type ReportOptions = { level?: LogLevel; notification?: NotificationConfig };

const LOG_LEVEL_TO_VARIANT: Record<LogLevel, 'danger' | 'warning' | 'info'> = {
  error: 'danger',
  warn: 'warning',
  info: 'info',
};

const toStyleVariant = (level: LogLevel) => LOG_LEVEL_TO_VARIANT[level];

interface ResultWithError<E> {
  error: E;
}

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' && isPresent(v);
const isError = (v: unknown): v is Error => v instanceof Error;
const pickMessage = (v: unknown, fallback: string): string => {
  if (isError(v)) return v.message;
  if (typeof v === 'string') return v;
  if (isRecord(v) && typeof (v as { message?: unknown }).message === 'string')
    return (v as { message: string }).message;
  return fallback;
};
const toLogContext = (v: unknown): Record<string, unknown> => {
  if (isError(v)) return { cause: v.cause, stack: v.stack };
  return { cause: v };
};

const createReportFunction =
  (
    logger: Logger,
    notifications: ErrorReporterNotifications,
    level: LogLevel,
    executeCommand?: CommandExecutor,
  ) =>
  (error: unknown, options?: ReportOptions): void => {
    const message = pickMessage(error, 'Unknown error');
    const context = toLogContext(error);
    const lvl = options?.level ?? level;
    logger[lvl](message, context);
    const onClick = executeCommand
      ? () => executeCommand(DefaultCommands.SHOW_LOGS)
      : undefined;
    const base: NotificationConfig = {
      message,
      level: toStyleVariant(lvl),
      onClick,
    } as NotificationConfig;
    const provided = options?.notification;
    const finalConfig: NotificationConfig = provided
      ? ({
          ...provided,
          message: provided.message ?? base.message,
          level: (provided.level as NotificationConfig['level']) ?? base.level,
          onClick: provided.onClick ?? base.onClick,
        } as NotificationConfig)
      : base;
    notifications.notify(finalConfig);
  };

const createReportResultFunction =
  (
    logger: Logger,
    notifications: ErrorReporterNotifications,
    level: LogLevel,
    executeCommand?: CommandExecutor,
  ) =>
  <E>(result: ResultWithError<E>, message: string, options?: ReportOptions): void => {
    const error = new Error(message, { cause: result.error });
    const lvl = options?.level ?? level;
    logger[lvl](error.message, {
      cause: error.cause,
      stack: error.stack,
    });
    const onClick = executeCommand
      ? () => executeCommand(DefaultCommands.SHOW_LOGS)
      : undefined;
    const base: NotificationConfig = {
      message: error.message,
      level: toStyleVariant(lvl),
      onClick,
    } as NotificationConfig;
    const provided = options?.notification;
    const finalConfig: NotificationConfig = provided
      ? ({
          ...provided,
          message: provided.message ?? base.message,
          level: (provided.level as NotificationConfig['level']) ?? base.level,
          onClick: provided.onClick ?? base.onClick,
        } as NotificationConfig)
      : base;
    notifications.notify(finalConfig);
  };

const createErrorReporter = (
  logger: Logger,
  notifications: ErrorReporterNotifications,
  executeCommand?: CommandExecutor,
) => ({
  report: (error: unknown, options?: ReportOptions): void => {
    const reportFn = createReportFunction(logger, notifications, 'error', executeCommand);
    reportFn(error, options);
  },

  reportResult: <E>(result: ResultWithError<E>, message: string, options?: ReportOptions): void => {
    const reportResultFn = createReportResultFunction(
      logger,
      notifications,
      'error',
      executeCommand,
    );
    reportResultFn(result, message, options);
  },

  reportError: (error: unknown, notification?: NotificationConfig): void => {
    const reportFn = createReportFunction(logger, notifications, 'error', executeCommand);
    reportFn(error, { notification });
  },

  reportWarning: (error: unknown, notification?: NotificationConfig): void => {
    const reportFn = createReportFunction(logger, notifications, 'warn', executeCommand);
    reportFn(error, { notification });
  },

  reportInfo: (error: unknown, notification?: NotificationConfig): void => {
    const reportFn = createReportFunction(logger, notifications, 'info', executeCommand);
    reportFn(error, { notification });
  },

  reportCritical: (error: unknown, meta?: Record<string, unknown>): void => {
    const message = pickMessage(error, 'Critical error');
    const context = { ...toLogContext(error), ...meta };
    logger.error(`FATAL: ${message}`, context);
    const onClick = executeCommand
      ? () => executeCommand(DefaultCommands.SHOW_LOGS)
      : undefined;
    notifications.notify({
      message: `Critical error: ${message}`,
      level: 'danger',
      timeout: 0,
      onClick,
    });
  },
});

type ErrorReporter = ReturnType<typeof createErrorReporter>;

export type { ErrorReporterNotifications, ErrorReporter };
export { createErrorReporter };
