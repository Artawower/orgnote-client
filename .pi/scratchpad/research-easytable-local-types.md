# Investigation: local type stub for `vue3-easy-data-table`

## Target file
`/Users/darkawower/projects/pet/orgnote/orgnote-client/src/types/vue3-easy-data-table.d.ts`

## What it declares (exactly)
The file declares a module augmentation/stub for package name `'vue3-easy-data-table'`:

```ts
declare module 'vue3-easy-data-table' {
  import type { DefineComponent } from 'vue';

  export interface Header {
    text: string;
    value: string;
    sortable?: boolean;
  }

  export type Item = Record<string, unknown>;

  const EasyDataTable: DefineComponent<
    {
      headers?: Header[];
      items?: Item[];
      hideFooter?: boolean;
      headerTextDirection?: string;
      bodyTextDirection?: string;
    },
    Record<string, unknown>,
    unknown
  >;

  export default EasyDataTable;
}
```

### Declared exports
1. `Header` interface with fields:
   - `text: string`
   - `value: string`
   - `sortable?: boolean`
2. `Item` alias:
   - `Record<string, unknown>`
3. Default export:
   - `EasyDataTable` typed as `DefineComponent` with props:
     - `headers?: Header[]`
     - `items?: Item[]`
     - `hideFooter?: boolean`
     - `headerTextDirection?: string`
     - `bodyTextDirection?: string`

## Why this file might exist
Most likely it is a **local fallback type declaration** to make TypeScript happy when:
- the upstream package has missing/incomplete `.d.ts`, or
- the project needs a narrowed/compatible subset of types for local usage.

Evidence from current codebase usage:
- `src/containers/PerformanceReportContainer.vue` imports `type { Header, Item } from 'vue3-easy-data-table'` and uses `<easy-data-table ...>` props matching this stub (`headers`, `items`, `hide-footer`, text direction props).
- The local `.d.ts` provides exactly those symbols and props used by the component.

## Where this type file is loaded/referenced by TS config

### 1) Root tsconfig
File: `/Users/darkawower/projects/pet/orgnote/orgnote-client/tsconfig.json`
- Extends: `./.quasar/tsconfig.json`
- Does **not** define explicit `include`, `types`, or `typeRoots`.

### 2) Effective include comes from Quasar tsconfig
File: `/Users/darkawower/projects/pet/orgnote/orgnote-client/.quasar/tsconfig.json`

Relevant entries:
```json
"include": [
  "./**/*.d.ts",
  "./../**/*"
]
```

Implication:
- `./../**/*` includes project files under repo root, including:
  - `src/types/vue3-easy-data-table.d.ts`
- Therefore this declaration is part of the TypeScript program through global include scanning.

### 3) No explicit `types`/`typeRoots` pinning found
Search did not find project-level explicit references such as:
- `compilerOptions.types: [...]`
- `compilerOptions.typeRoots: [...]`
- direct mention of `vue3-easy-data-table.d.ts` in tsconfig files

So loading appears **implicit via include glob**, not explicit registration.
