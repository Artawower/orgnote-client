const DEBUG_LABEL = '[embedded-widget-nav]';

type DebugConsole = {
  log: (label: string, event: string, context: Record<string, unknown>) => void;
};

export const debugEmbeddedWidgetNavigation = (
  event: string,
  context: Record<string, unknown> = {},
): void => {
  const debugConsole = globalThis.console as DebugConsole | undefined;
  debugConsole?.log(DEBUG_LABEL, event, context);
};
