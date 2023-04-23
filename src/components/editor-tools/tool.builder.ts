import { ToolParams } from 'src/models';
import { App, Component, createApp } from 'vue';

export function createEditorTool(
  title: string,
  icon: string,
  component: Component
): any {
  const cls = class EditorTool {
    private data: ToolParams<any>;
    private app: App<any>;

    static get toolbox() {
      return {
        title,
        icon,
      };
    }

    constructor({ data }: ToolParams<any>) {
      this.data = data;
    }

    render(): HTMLElement {
      const wrapper = document.createElement('div');

      this.app = createApp(component, {
        payload: this.data,
      });

      this.app.mount(wrapper);

      wrapper.classList.add(title);
      return wrapper;
    }

    save() {
      // console.log('✎: [line 50][org-headline.ts] this.component: ', this.app);
      return { content: this.app._instance.exposed.getData() };
    }
  };

  return cls;
}
