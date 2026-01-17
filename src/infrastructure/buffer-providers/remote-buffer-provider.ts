import type { BufferProvider, BufferContext } from 'orgnote-api';

const extractTitleFromPath = (path: string): string => {
  const fileName = path.split('/').pop() || '';
  return fileName.replace(/\.[^.]+$/, '') || 'Untitled';
};

export const createRemoteBufferProvider = (): BufferProvider => ({
  scheme: 'remote',

  async read(path: string): Promise<Uint8Array> {
    const response = await fetch(path);

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${path} (${response.status})`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  },

  getContext(path: string): BufferContext {
    return {
      title: extractTitleFromPath(path),
    };
  },
});
