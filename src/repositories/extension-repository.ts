import { migrator } from './migrator';
import { BaseRepository } from './repository';
import Dexie from 'dexie';
import { ExtensionMeta, StoredExtension } from 'src/api/extension';

export class ExtensionRepository extends BaseRepository {
  public static storeName = 'extensions';

  public static readonly migrations = migrator<StoredExtension>()
    .v(4)
    .indexes(
      '++manifest.name, manifest.description, manifest.category, active, *manifest.keywords, manifest.source'
    )
    .build();

  get store(): Dexie.Table<StoredExtension, string> {
    return this.db.table(ExtensionRepository.storeName);
  }

  public async getMeta(): Promise<ExtensionMeta[]> {
    const manifests: ExtensionMeta[] = [];
    return this.store
      .toCollection()
      .each((ext) =>
        manifests.push({
          active: ext.active,
          manifest: ext.manifest,
        })
      )
      .then(() => manifests);
  }

  public async getActiveExtensions(): Promise<StoredExtension[]> {
    return this.store.filter((n) => n.active).toArray();
  }

  public async setActiveStatus(extensionName: string, active: boolean) {
    if (active) {
      return await this.activateExtension(extensionName);
    }
    await this.deactivateExtension(extensionName);
  }

  public async activateExtension(extensionName: string): Promise<void> {
    await this.store.update(extensionName, { active: true });
  }

  async deactivateExtension(extensionName: string): Promise<void> {
    await this.store.update(extensionName, { active: false });
  }

  public async upsertExtensions(extensions: StoredExtension[]): Promise<void> {
    await this.store.bulkPut(extensions);
  }

  public async getExtension(extensionName: string): Promise<StoredExtension> {
    return await this.store.get({ 'manifest.name': extensionName });
  }

  public async getExtensionBySource(source: string): Promise<StoredExtension> {
    return await this.store.get({ 'manifest.source': source });
  }

  public async deleteBySource(source: string): Promise<void> {
    const ext = await this.getExtensionBySource(source);
    return await this.store.delete(ext.manifest.name);
  }
}
