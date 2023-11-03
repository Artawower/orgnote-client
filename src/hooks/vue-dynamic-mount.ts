import { Component, createApp, getCurrentInstance } from 'vue';

export const useDynamicComponent = () => {
  const vueInstance = getCurrentInstance();
  const mount = (
    cmp: Component,
    wrap: Element,
    props?: { [key: string]: unknown }
  ) => {
    const comp = createApp(cmp, props);
    Object.assign(comp._context, vueInstance.appContext);
    comp.provide;
    comp.mount(wrap);
    return {
      destroy: () => comp.unmount(),
      refresh: (...args: unknown[]) => comp._instance?.exposed.refresh(...args),
    };
  };

  return {
    mount,
  };
};
