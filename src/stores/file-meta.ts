import { defineStore } from 'pinia';
import type { FileMeta, FileMetaStore } from 'orgnote-api';
import { repositories } from 'src/boot/repositories';

export const useFileMetaStore = defineStore<'fileMeta', FileMetaStore>('fileMeta', () => {
  const getById = async (id: string): Promise<FileMeta | undefined> => {
    return repositories.fileRepository.getById(id);
  };

  const getByIds = async (ids: string[]): Promise<FileMeta[]> => {
    return repositories.fileRepository.getByIds(ids);
  };

  const getByPath = async (filePath: string[]): Promise<FileMeta | undefined> => {
    return repositories.fileRepository.getByPath(filePath);
  };

  const getAll = async (options?: {
    limit?: number;
    offset?: number;
    tags?: string[];
  }): Promise<FileMeta[]> => {
    return repositories.fileRepository.getAll(options);
  };

  const count = async (tags?: string[]): Promise<number> => {
    return repositories.fileRepository.count(tags);
  };

  const getTagsStats = async (): Promise<{ tag: string; count: number }[]> => {
    return repositories.fileRepository.getTagsStats();
  };

  const save = async (meta: FileMeta): Promise<void> => {
    await repositories.fileRepository.save(meta);
  };

  const saveBulk = async (metas: FileMeta[]): Promise<void> => {
    await repositories.fileRepository.saveBulk(metas);
  };

  const resolveFileId = async (
    target: { id: string } | { path: string[] },
  ): Promise<string | undefined> => {
    if ('id' in target) return target.id;
    const file = await getByPath(target.path);
    return file?.id;
  };

  const deleteFile = async (target: { id: string } | { path: string[] }): Promise<void> => {
    const id = await resolveFileId(target);
    if (!id) return;
    await repositories.fileRepository.delete(id);
  };

  const clear = async (): Promise<void> => {
    await repositories.fileRepository.clear();
  };

  return {
    getById,
    getByIds,
    getByPath,
    getAll,
    count,
    getTagsStats,
    save,
    saveBulk,
    delete: deleteFile,
    clear,
  };
});
