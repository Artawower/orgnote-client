import { API, ToolSettings } from '@editorjs/editorjs';

export interface ToolParams<T> {
  api: API;
  config?: ToolSettings;
  data: T;
}
