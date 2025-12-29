import { defineBoot } from '@quasar/app-vite/wrappers';
import { api } from './api';

export default defineBoot(() => {
  const fileReader = api.core.useFileReader();

  fileReader.register({
    pattern: '\\.org(\\.gpg)?$',
    component: () => import('src/readers/OrgEditor.vue'),
    meta: {
      id: 'builtin:org-rich-editor',
      name: 'Org Editor (Rich)',
      icon: 'edit_note',
      priority: 20,
    },
  });

  fileReader.register({
    pattern: '\\.org(\\.gpg)?$',
    component: () => import('src/readers/OrgTextEditor.vue'),
    meta: {
      id: 'builtin:org-text-editor',
      name: 'Org Editor (Text)',
      icon: 'description',
      priority: 10,
    },
  });

  fileReader.register({
    pattern: '\\.(ts|js|jsx|tsx|json|toml|yaml|yml)$',
    component: () => import('src/readers/CodeEditor.vue'),
    meta: {
      id: 'builtin:code-editor',
      name: 'Code Editor',
      icon: 'code',
      priority: 10,
    },
  });

  fileReader.register({
    pattern: '\\.(png|jpg|jpeg|gif|webp|svg)$',
    component: () => import('src/readers/ImageViewer.vue'),
    meta: {
      id: 'builtin:image-viewer',
      name: 'Image Viewer',
      icon: 'image',
      priority: 10,
    },
  });

  fileReader.register({
    pattern: '.*',
    component: () => import('src/readers/CodeEditor.vue'),
    meta: {
      id: 'builtin:text-editor',
      name: 'Text Editor',
      icon: 'article',
      priority: 0,
    },
  });
});
