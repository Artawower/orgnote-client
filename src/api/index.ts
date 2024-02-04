export type {
  ExtensionManifest,
  OrgNoteApi,
  Command,
  NotePreview,
  MultilineEmbeddedWidget,
  StoredExtension,
  Extension,
  OrgNoteConfig,
  CompletionSearchResult,
  CompletionCandidate,
  CompletionConfigs,
  CandidateGetterFn,
  CommonEmbeddedWidget,
  MultilineEmbeddedWidgets,
  EmbeddedWidget,
  InlineEmbeddedWidget,
  InlineEmbeddedWidgets,
  EmbeddedWidgetBuilder,
  ModalConfig,
  ExtensionMeta,
  CommandHandlerParams,
  ViewUpdateSchema,
  WidgetBuilder,
  WidgetBuilderParams,
  CommandGroup,
  ActiveExtension,
} from 'orgnote-api';

export { DEFAULT_KEYBINDING_GROUP, ThemeVariable } from 'orgnote-api';

import { z } from 'zod';

export const orgnoteApiSchema = z.object({
  editor: z.object({
    showSpecialSymbols: z.boolean(),
    showPropertyDrawer: z.boolean(),
  }),
  common: z.object({
    developerMode: z.boolean(),
    maximumLogsCount: z.number(),
  }),
  completion: z.object({
    showGroup: z.boolean(),
    defaultCompletionLimit: z.number(),
  }),
  ui: z.object({
    theme: z.literal('light').or(z.literal('dark')),
    darkThemeName: z.optional(z.string()),
    lightThemeName: z.optional(z.string()),
  }),
  extensions: z.object({
    sources: z.array(z.string()),
  }),
});
