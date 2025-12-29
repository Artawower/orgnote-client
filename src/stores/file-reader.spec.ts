import { test, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useFileReaderStore } from './file-reader';
import { defineComponent } from 'vue';

const mockNavigate = vi.fn();
const mockConfig = {
  fileReaders: {
    preferredReaders: {} as Record<string, string>,
  },
};

vi.mock('./pane', () => ({
  usePaneStore: () => ({
    navigate: mockNavigate,
  }),
}));

vi.mock('./config', () => ({
  useConfigStore: () => ({
    config: mockConfig,
  }),
}));

const createMockComponent = (name: string) =>
  defineComponent({ name, template: '<div />' });

beforeEach(() => {
  setActivePinia(createPinia());
  mockNavigate.mockClear();
  mockConfig.fileReaders.preferredReaders = {};
});

test('file-reader register adds a reader correctly', () => {
  const fileReaderStore = useFileReaderStore();
  const mockComponent = createMockComponent('OrgReader');

  fileReaderStore.register({
    pattern: '\\.org$',
    component: mockComponent,
    meta: { id: 'test:org', name: 'Org Reader' },
  });

  const reader = fileReaderStore.getReader('test.org');
  expect(reader).toBeDefined();
  expect(reader?.meta.id).toBe('test:org');
});

test('file-reader getReaders returns all matching readers sorted by priority', () => {
  const fileReaderStore = useFileReaderStore();

  fileReaderStore.register({
    pattern: '\\.org$',
    component: createMockComponent('LowPriority'),
    meta: { id: 'test:low', name: 'Low Priority', priority: 5 },
  });

  fileReaderStore.register({
    pattern: '\\.org$',
    component: createMockComponent('HighPriority'),
    meta: { id: 'test:high', name: 'High Priority', priority: 20 },
  });

  const readers = fileReaderStore.getReaders('test.org');
  expect(readers).toHaveLength(2);
  expect(readers[0]?.meta.id).toBe('test:high');
  expect(readers[1]?.meta.id).toBe('test:low');
});

test('file-reader getReader returns highest priority reader', () => {
  const fileReaderStore = useFileReaderStore();

  fileReaderStore.register({
    pattern: '\\.md$',
    component: createMockComponent('Default'),
    meta: { id: 'builtin:md', name: 'Default', priority: 0 },
  });

  fileReaderStore.register({
    pattern: '\\.md$',
    component: createMockComponent('Extension'),
    meta: { id: 'ext:md', name: 'Extension', priority: 10 },
  });

  const reader = fileReaderStore.getReader('readme.md');
  expect(reader?.meta.id).toBe('ext:md');
});

test('file-reader config preferred reader overrides priority', () => {
  const fileReaderStore = useFileReaderStore();

  fileReaderStore.register({
    pattern: '\\.md$',
    component: createMockComponent('Low'),
    meta: { id: 'test:low', name: 'Low', priority: 5 },
  });

  fileReaderStore.register({
    pattern: '\\.md$',
    component: createMockComponent('High'),
    meta: { id: 'test:high', name: 'High', priority: 20 },
  });

  mockConfig.fileReaders.preferredReaders['md'] = 'test:low';

  const reader = fileReaderStore.getReader('readme.md');
  expect(reader?.meta.id).toBe('test:low');
});

test('file-reader handles compound extensions like org.gpg', () => {
  const fileReaderStore = useFileReaderStore();

  fileReaderStore.register({
    pattern: '\\.org(\\.gpg)?$',
    component: createMockComponent('Org'),
    meta: { id: 'test:org', name: 'Org', priority: 10 },
  });

  fileReaderStore.register({
    pattern: '\\.org(\\.gpg)?$',
    component: createMockComponent('OrgAlt'),
    meta: { id: 'test:org-alt', name: 'Org Alt', priority: 5 },
  });

  mockConfig.fileReaders.preferredReaders['org.gpg'] = 'test:org-alt';

  const reader = fileReaderStore.getReader('secret.org.gpg');
  expect(reader?.meta.id).toBe('test:org-alt');
});

test('file-reader unregister removes reader by id', () => {
  const fileReaderStore = useFileReaderStore();

  fileReaderStore.register({
    pattern: '\\.org$',
    component: createMockComponent('ToRemove'),
    meta: { id: 'test:remove', name: 'To Remove' },
  });

  expect(fileReaderStore.getReader('test.org')).toBeDefined();

  fileReaderStore.unregister('test:remove');

  expect(fileReaderStore.getReader('test.org')).toBeUndefined();
});

test('file-reader openFile navigates to file page', async () => {
  const fileReaderStore = useFileReaderStore();

  await fileReaderStore.openFile('notes.org');

  expect(mockNavigate).toHaveBeenCalledWith({
    name: 'File',
    params: { path: 'notes.org' },
  });
});

test('file-reader pattern matches correctly with regex', () => {
  const fileReaderStore = useFileReaderStore();

  fileReaderStore.register({
    pattern: '\\.org(\\.gpg)?$',
    component: createMockComponent('Org'),
    meta: { id: 'test:org', name: 'Org' },
  });

  expect(fileReaderStore.getReader('test.org')).toBeDefined();
  expect(fileReaderStore.getReader('test.org.gpg')).toBeDefined();
  expect(fileReaderStore.getReader('test.txt')).toBeUndefined();
});
