export interface MiniEditorSession {
  title: string;
  body: string;
  tags: string[];
  priority?: string;
  scheduledDate?: string;
  bodyLoaded: boolean;
  fullSize: boolean;
}
