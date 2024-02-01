import fetchMixin, { IFetchRepo } from '@es-git/fetch-mixin';
import loadAsMixin, { ILoadAsRepo } from '@es-git/load-as-mixin';
import MemoryRepo from '@es-git/memory-repo';
import { RefChange } from '@es-git/http-transport';

import mix from '@es-git/mix';
import object, { IObjectRepo } from '@es-git/object-mixin';
import walkers, { IWalkersRepo } from '@es-git/walkers-mixin';

export class IncorrectExtensionError extends Error {}
export class ExtensionNotFoundError extends Error {}

type GitRepo = MemoryRepo &
  IObjectRepo &
  IWalkersRepo &
  ILoadAsRepo &
  IFetchRepo;

export async function readFileFromRepo(
  repoUrl: string,
  paths: string[]
): Promise<string> {
  const [repo, ref] = await initRepo(repoUrl);
  const hash = ref.hash;

  const { tree: treeHash } = await repo.loadCommit(hash);

  const fileHash = await findFileHash(repo, paths, treeHash);
  if (!fileHash) {
    throw new ExtensionNotFoundError();
  }

  const text = await repo.loadText(fileHash);

  return text;
}

async function findFileHash(
  repo: GitRepo,
  paths: string[],
  treeHash: string
): Promise<string> {
  for (const path of paths) {
    const hash = await findFileHashByPath(repo, path, treeHash);
    if (hash) {
      return hash;
    }
  }
}

export async function* initGitTextFileLoader(
  source: string,
  dir: string
): AsyncGenerator<string> {
  const [repo, ref] = await initRepo(source);
  const hash = ref.hash;

  const { tree: treeHash } = await repo.loadCommit(hash);
  const targetDirHash = await findFileHashByPath(repo, dir, treeHash);
  if (!targetDirHash) {
    return;
  }
  const tree = await repo.loadTree(targetDirHash);
  for (const key of Object.keys(tree)) {
    yield await repo.loadText(tree[key].hash);
  }
}

async function initRepo(source: string): Promise<[GitRepo, RefChange]> {
  const Repo = mix(MemoryRepo)
    .with(object)
    .with(walkers)
    .with(loadAsMixin)
    .with(fetchMixin, fetch);

  const repo = new Repo();
  const url = 'https://corsproxy.io/?' + encodeURIComponent(source);
  const result = await repo.fetch(url, 'refs/heads/*:refs/heads/*');
  return [repo, result?.[0]];
}

async function findFileHashByPath(
  repo: GitRepo,
  path: string,
  treeHash: string
): Promise<string> {
  const nodes = path.split('/');
  let hash = treeHash;

  while (nodes.length && hash) {
    const node = nodes.shift();
    const tree = await repo.loadTree(hash);
    hash = tree[node]?.hash;
  }

  return hash;
}
