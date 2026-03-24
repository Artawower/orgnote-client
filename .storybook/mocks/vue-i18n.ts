import { computed, inject, ref, type App, type InjectionKey, type Ref } from 'vue';

type MessageRecord = Record<string, unknown>;
type MessageMap = Record<string, MessageRecord>;

interface I18nOptions {
  locale?: string;
  fallbackLocale?: string;
  messages?: MessageMap;
}

interface I18nComposer {
  locale: Ref<string>;
  messages: Ref<MessageMap>;
  t: (key: string, params?: unknown) => string;
}

interface I18nInstance {
  install: (app: App) => void;
  global: I18nComposer;
}

const I18N_KEY: InjectionKey<I18nComposer> = Symbol('storybook-i18n');

const stringifyParams = (params?: unknown): string => {
  if (!params) {
    return '';
  }

  return ` ${JSON.stringify(params)}`;
};

const createComposer = (options: I18nOptions): I18nComposer => {
  const locale = ref(options.locale ?? 'en-US');
  const messages = ref(options.messages ?? {});

  return {
    locale,
    messages,
    t: (key: string, params?: unknown) => `${key}${stringifyParams(params)}`,
  };
};

export const createI18n = (options: I18nOptions = {}): I18nInstance => {
  const composer = createComposer(options);

  return {
    global: composer,
    install: (app: App) => {
      app.provide(I18N_KEY, composer);
      app.config.globalProperties.$t = composer.t;
    },
  };
};

export const useI18n = (): I18nComposer => {
  const composer = inject(I18N_KEY);
  if (composer) {
    return composer;
  }

  return createComposer({});
};

export const castToVueI18n = <T>(value: T): T => value;
export const vTDirective = {};
export const Translation = {};
export const NumberFormat = {};
export const DatetimeFormat = {};
export const VERSION = 'storybook-mock';

export type I18n = I18nInstance;
export type Composer = I18nComposer;
export type VueMessageType = string;

export const useLocaleHead = () => computed(() => ({}));
