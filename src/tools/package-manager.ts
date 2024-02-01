import { ExtensionManifest } from 'src/api/extension';
import { initGitTextFileLoader } from './git';

const recipeDir = 'recipes';

export async function* refreshPackages(
  sources: string[]
): AsyncGenerator<ExtensionManifest> {
  for (const source of sources) {
    yield* refreshPackage(source);
  }
}

async function* refreshPackage(
  source: string
): AsyncGenerator<ExtensionManifest> {
  const fileLoader = initGitTextFileLoader(source, recipeDir);
  for await (const file of fileLoader) {
    if (!file) {
      continue;
    }
    // TODO: master add validation from ZOD
    yield JSON.parse(file) as ExtensionManifest;
  }
}
