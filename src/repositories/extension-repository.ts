import { ExtensionRepository as IExtensionRepository } from 'orgnote-api';
import { migrator } from './migrator';
import { BaseRepository } from './repository';
import Dexie from 'dexie';
import { ExtensionMeta, StoredExtension } from 'src/api';

export class ExtensionRepository
  extends BaseRepository
  implements IExtensionRepository
{
  public static storeName = 'extensions';

  public static readonly migrations = migrator<StoredExtension>()
    .v(5)
    .indexes(
      '++manifest.name, manifest.description, manifest.category, active, *manifest.keywords, manifest.sourceUrl'
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
          uploaded: !!ext.module,
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
    return await this.store.get({ 'manifest.sourceUrl': source });
  }

  public async deleteBySource(source: string): Promise<void> {
    const ext = await this.getExtensionBySource(source);
    return await this.store.delete(ext.manifest.name);
  }

  public async delete(extensionName: string): Promise<void> {
    await this.store.update(extensionName, { module: null });
  }
}
