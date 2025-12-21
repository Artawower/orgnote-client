import { defineBoot } from '@quasar/app-vite/wrappers';
import { reporter } from './report';
import type { Router } from 'vue-router';
import type { ComponentPublicInstance } from 'vue';
import { RouteNames } from 'orgnote-api';

const extractComponentChain = (instance: ComponentPublicInstance | null): string[] => {
  const chain: string[] = [];
  let current = instance;
  while (current) {
    const name = current.$.type?.name ?? current.$.type?.__name ?? 'Anonymous';
    chain.push(name);
    current = current.$.parent?.proxy ?? null;
  }
  return chain;
};

const handleError = (error: unknown, meta: Record<string, unknown>, router: Router): void => {
  reporter.reportCritical(error, meta);

  router.push({ name: RouteNames.Error }).catch(() => {
    throw error;
  });
};

export default defineBoot(({ app, router, ssrContext }) => {
  if (!ssrContext && typeof window !== 'undefined') {
    window.addEventListener(
      'error',
      (event) => {
        event.stopImmediatePropagation();

        handleError(
          event.error,
          { url: event.filename, line: event.lineno, col: event.colno },
          router,
        );
      },
      { capture: true },
    );

    window.addEventListener(
      'unhandledrejection',
      (event) => {
        event.stopImmediatePropagation();

        handleError(event.reason, {}, router);
      },
      { capture: true },
    );
  }

  app.config.errorHandler = (err, instance, info): void => {
    const componentChain = extractComponentChain(instance);

    reporter.reportCritical(err, {
      context: `Vue: ${info}`,
      component: componentChain[0],
      componentChain,
    });

    router.push('/error').catch(() => {
      throw err;
    });
  };

  router.onError((error) => {
    reporter.reportCritical(error, { context: 'Router' });

    router.push('/error').catch(() => {
      throw error;
    });
  });
});
