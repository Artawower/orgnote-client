import { test, expect, vi, beforeEach } from 'vitest';
import { createErrorReporter } from './error-reporter';
import type { ErrorReporterNotifications } from './error-reporter';
import type { OrgNoteApi } from 'orgnote-api';

type StoreDef = ReturnType<OrgNoteApi['core']['useNotifications']>;
type NotificationConfig = Parameters<StoreDef['notify']>[0];

const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  debug: vi.fn(),
  trace: vi.fn(),
  child: vi.fn(),
};

const mockNotifications: ErrorReporterNotifications = {
  notify: vi.fn<(config: NotificationConfig) => void>(),
};

let errorReporter: ReturnType<typeof createErrorReporter>;

beforeEach(() => {
  vi.clearAllMocks();
  errorReporter = createErrorReporter(mockLogger, mockNotifications);
});

test('createErrorReporter returns proper interface', () => {
  expect(errorReporter).toBeDefined();
  expect(typeof errorReporter.report).toBe('function');
  expect(typeof errorReporter.reportResult).toBe('function');
  expect(typeof errorReporter.reportError).toBe('function');
  expect(typeof errorReporter.reportWarning).toBe('function');
  expect(typeof errorReporter.reportInfo).toBe('function');
});

test('report logs error and shows notification', () => {
  const error = new Error('Test error message');
  
  errorReporter.report(error);
  
  expect(mockLogger.error).toHaveBeenCalledWith('Test error message', {
    cause: error.cause,
    stack: error.stack,
  });
  expect(mockNotifications.notify).toHaveBeenCalledWith({
    message: 'Test error message',
    level: 'danger',
  });
});

test('report handles options.level', () => {
  const error = new Error('Test warning');
  
  errorReporter.report(error, { level: 'warn' });
  
  expect(mockLogger.warn).toHaveBeenCalledWith('Test warning', {
    cause: error.cause,
    stack: error.stack,
  });
  expect(mockNotifications.notify).toHaveBeenCalledWith({
    message: 'Test warning',
    level: 'warning',
  });
});

test('report handles error with cause', () => {
  const originalError = new Error('Original error');
  const error = new Error('User friendly message', { cause: originalError });
  
  errorReporter.report(error);
  
  expect(mockLogger.error).toHaveBeenCalledWith('User friendly message', {
    cause: originalError,
    stack: error.stack,
  });
  expect(mockNotifications.notify).toHaveBeenCalledWith({
    message: 'User friendly message',
    level: 'danger',
  });
});

test('reportResult works with neverthrow-like Result', () => {
  const resultError = { error: 'File not found' };
  const message = 'Failed to read file';
  
  errorReporter.reportResult(resultError, message);
  
  expect(mockLogger.error).toHaveBeenCalledWith(message, {
    cause: 'File not found',
    stack: expect.any(String),
  });
  expect(mockNotifications.notify).toHaveBeenCalledWith({
    message,
    level: 'danger',
  });
});

test('reportResult handles options.level', () => {
  const resultError = { error: 'Warning condition' };
  const message = 'Warning';
  
  errorReporter.reportResult(resultError, message, { level: 'warn' });
  
  expect(mockLogger.warn).toHaveBeenCalledWith(message, {
    cause: 'Warning condition',
    stack: expect.any(String),
  });
  expect(mockNotifications.notify).toHaveBeenCalledWith({
    message,
    level: 'warning',
  });
});

test('reportError is shortcut for error level', () => {
  const error = new Error('Error message');
  
  errorReporter.reportError(error);
  
  expect(mockLogger.error).toHaveBeenCalledWith('Error message', {
    cause: error.cause,
    stack: error.stack,
  });
  expect(mockNotifications.notify).toHaveBeenCalledWith({
    message: 'Error message',
    level: 'danger',
  });
});

test('reportWarning is shortcut for warn level', () => {
  const error = new Error('Warning message');
  
  errorReporter.reportWarning(error);
  
  expect(mockLogger.warn).toHaveBeenCalledWith('Warning message', {
    cause: error.cause,
    stack: error.stack,
  });
  expect(mockNotifications.notify).toHaveBeenCalledWith({
    message: 'Warning message',
    level: 'warning',
  });
});

test('reportInfo is shortcut for info level', () => {
  const error = new Error('Info message');
  
  errorReporter.reportInfo(error);
  
  expect(mockLogger.info).toHaveBeenCalledWith('Info message', {
    cause: error.cause,
    stack: error.stack,
  });
  expect(mockNotifications.notify).toHaveBeenCalledWith({
    message: 'Info message',
    level: 'info',
  });
});

test('report accepts unknown: string', () => {
  errorReporter.report('String error');
  expect(mockLogger.error).toHaveBeenCalledWith('String error', { cause: 'String error' });
  expect(mockNotifications.notify).toHaveBeenCalledWith({ message: 'String error', level: 'danger' });
});

test('report accepts unknown: object with message', () => {
  const obj = { message: 'Boom', code: 123 } as const;
  errorReporter.report(obj);
  expect(mockLogger.error).toHaveBeenCalledWith('Boom', { cause: obj });
  expect(mockNotifications.notify).toHaveBeenCalledWith({ message: 'Boom', level: 'danger' });
});

test('report accepts unknown: primitive without message', () => {
  errorReporter.report(404);
  expect(mockLogger.error).toHaveBeenCalledWith('Unknown error', { cause: 404 });
  expect(mockNotifications.notify).toHaveBeenCalledWith({ message: 'Unknown error', level: 'danger' });
});

test('reportWarning works with unknown', () => {
  errorReporter.reportWarning('Warn str');
  expect(mockLogger.warn).toHaveBeenCalledWith('Warn str', { cause: 'Warn str' });
  expect(mockNotifications.notify).toHaveBeenCalledWith({ message: 'Warn str', level: 'warning' });
});

test('reportInfo works with unknown', () => {
  errorReporter.reportInfo('Info str');
  expect(mockLogger.info).toHaveBeenCalledWith('Info str', { cause: 'Info str' });
  expect(mockNotifications.notify).toHaveBeenCalledWith({ message: 'Info str', level: 'info' });
});

test('report uses provided notification message and level', () => {
  const err = new Error('Original');
  errorReporter.report(err, { notification: { message: 'Custom', level: 'info' } as NotificationConfig });
  expect(mockLogger.error).toHaveBeenCalledWith('Original', { cause: err.cause, stack: err.stack });
  expect(mockNotifications.notify).toHaveBeenCalledWith({ message: 'Custom', level: 'info' });
});

test('report fills missing notification fields and respects options.level', () => {
  const err = new Error('Warn original');
  errorReporter.report(err, { level: 'warn', notification: { description: 'Desc' } as NotificationConfig });
  expect(mockLogger.warn).toHaveBeenCalledWith('Warn original', { cause: err.cause, stack: err.stack });
  expect(mockNotifications.notify).toHaveBeenCalledWith({ message: 'Warn original', level: 'warning', description: 'Desc' });
});

test('reportError accepts NotificationConfig sugar', () => {
  const err = new Error('Sugar');
  errorReporter.reportError(err, { message: 'Shown', level: 'danger' } as NotificationConfig);
  expect(mockLogger.error).toHaveBeenCalledWith('Sugar', { cause: err.cause, stack: err.stack });
  expect(mockNotifications.notify).toHaveBeenCalledWith({ message: 'Shown', level: 'danger' });
});

test('reportResult accepts notification override', () => {
  const resultError = { error: 'reason' };
  const message = 'Failed';
  errorReporter.reportResult(resultError, message, { notification: { message: 'Shown', level: 'info' } as NotificationConfig });
  expect(mockLogger.error).toHaveBeenCalledWith('Failed', { cause: 'reason', stack: expect.any(String) });
  expect(mockNotifications.notify).toHaveBeenCalledWith({ message: 'Shown', level: 'info' });
});

test('report includes onClick when executeCommand is provided', () => {
  const mockExecuteCommand = vi.fn();
  const reporterWithCommand = createErrorReporter(mockLogger, mockNotifications, mockExecuteCommand);
  const error = new Error('Click test');

  reporterWithCommand.report(error);

  expect(mockNotifications.notify).toHaveBeenCalledWith(
    expect.objectContaining({
      message: 'Click test',
      level: 'danger',
      onClick: expect.any(Function),
    }),
  );
});

test('report onClick executes SHOW_LOGS command', () => {
  const mockExecuteCommand = vi.fn();
  const reporterWithCommand = createErrorReporter(mockLogger, mockNotifications, mockExecuteCommand);
  const error = new Error('Click test');

  reporterWithCommand.report(error);

  const notifyCall = vi.mocked(mockNotifications.notify).mock.calls[0]?.[0];
  notifyCall?.onClick?.();

  expect(mockExecuteCommand).toHaveBeenCalledWith('show-logs');
});
