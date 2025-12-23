import type { Component } from 'vue';
import { createApp, getCurrentInstance } from 'vue';

export interface DynamicComponentInstance {
  destroy: () => void;
  refresh: (...args: unknown[]) => void;
}

export const useDynamicComponent = () => {
  const vueInstance = getCurrentInstance();

  const mount = (
    cmp: Component,
    wrap: Element,
    props?: Record<string, unknown>
  ): DynamicComponentInstance => {
    const app = createApp(cmp, props);

    if (vueInstance?.appContext) {
      Object.assign(app._context, vueInstance.appContext);
    }

    app.mount(wrap);

    return {
      destroy: () => app.unmount(),
      refresh: (...args: unknown[]) => {
        const exposed = app._instance?.exposed as { refresh?: (...args: unknown[]) => void };
        exposed?.refresh?.(...args);
      },
    };
  };

  return { mount };
};
