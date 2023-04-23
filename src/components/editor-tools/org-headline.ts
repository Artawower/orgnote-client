import { BaseTool } from '@editorjs/editorjs';
import { App, createApp } from 'vue';
import { ToolParams } from 'src/models';
import EditorOrgHeadline from './EditorOrgHeadline.vue';

interface HeadlineData {
  content: string;
}
// NOTE: types https://github.com/codex-team/editor.js/issues/900
// NOTE: render as vuejs
export class OrgHeadline implements BaseTool {
  public data: HeadlineData;
  public app: App<any>;
  static get toolbox() {
    return {
      title: 'Headline',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" width="800px" height="800px" viewBox="0 0 32 32"><path d="M 3 5 L 3 23 C 3 25.210938 4.789063 27 7 27 L 25 27 C 27.210938 27 29 25.210938 29 23 L 29 12 L 23 12 L 23 5 Z M 5 7 L 21 7 L 21 23 C 21 23.730469 21.222656 24.410156 21.5625 25 L 7 25 C 5.808594 25 5 24.191406 5 23 Z M 7 9 L 7 14 L 19 14 L 19 9 Z M 9 11 L 17 11 L 17 12 L 9 12 Z M 23 14 L 27 14 L 27 23 C 27 24.191406 26.191406 25 25 25 C 23.808594 25 23 24.191406 23 23 Z M 7 15 L 7 17 L 12 17 L 12 15 Z M 14 15 L 14 17 L 19 17 L 19 15 Z M 7 18 L 7 20 L 12 20 L 12 18 Z M 14 18 L 14 20 L 19 20 L 19 18 Z M 7 21 L 7 23 L 12 23 L 12 21 Z M 14 21 L 14 23 L 19 23 L 19 21 Z"/></svg>',
    };
  }

  constructor({ data }: ToolParams<any>) {
    this.data = data;
  }

  render() {
    const wrapper = document.createElement('div');

    this.app = createApp(EditorOrgHeadline, {
      content: this.data.content ?? '',
    });

    this.app.mount(wrapper);

    wrapper.classList.add('simple-image');
    return wrapper;
  }

  save() {
    return { content: this.app._instance.exposed.getData() };
  }
}
