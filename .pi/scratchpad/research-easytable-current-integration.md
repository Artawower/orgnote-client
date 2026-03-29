# Research: current `vue3-easy-data-table` integration audit

## Scope
Audited current source integration for:
- `<easy-data-table>` usage locations
- runtime imports in each SFC using the tag
- any global app registration (`app.component('EasyDataTable', ...)`) in source setup paths
- CSS import location
- status of `src/types/vue3-easy-data-table.d.ts`
- mismatches vs official local package docs

## 1) `<easy-data-table>` tag usage (exact locations)

### `src/containers/PerformanceReportContainer.vue`
```vue
<easy-data-table
  class="perf-table"
  :headers="headers"
  :items="rows"
  hide-footer
  header-text-direction="left"
  body-text-direction="left"
>
```

### `src/extensions/org-table/OrgTable.vue`
```vue
<easy-data-table
  class="org-table"
  :headers="headers"
  :items="items"
  hide-footer
  header-text-direction="left"
  body-text-direction="left"
>
```

## 2) Runtime imports in those SFCs

### `src/containers/PerformanceReportContainer.vue`
Current script imports include:
```ts
import type { Header, Item } from 'vue3-easy-data-table';
// @ts-expect-error default export is missing in upstream d.ts
import { EasyDataTable } from 'vue3-easy-data-table';
```

Observation:
- This is a **named import** (`{ EasyDataTable }`), not default import.
- Comment says `default export is missing`, but import statement is named, so there is an internal inconsistency in intent vs code form.

### `src/extensions/org-table/OrgTable.vue`
Current script imports include:
```ts
import type { Header, Item } from 'vue3-easy-data-table';
// @ts-expect-error default export is missing in upstream d.ts
import EasyDataTable from 'vue3-easy-data-table';
```

Observation:
- This is a **default runtime import**, consistent with typical local registration in `<script setup>`.

## 3) Global registration search result (`app.component('EasyDataTable', ...)`)

Search findings under `src/`:
- No occurrences of `app.component('EasyDataTable', ...)`
- No discovered global registration in `src/boot/*` or `src/plugins/*`

Evidence summary:
- Search matched only:
  - `src/containers/PerformanceReportContainer.vue`
  - `src/extensions/org-table/OrgTable.vue`
  - `src/css/app.scss`

Conclusion:
- No global component registration currently found in project source setup paths.
- Integration appears to rely on local SFC runtime imports.

## 4) CSS import location

### `src/css/app.scss`
```scss
@import 'vue3-easy-data-table/dist/style.css';
```

Conclusion:
- Styles are globally loaded through app stylesheet.

## 5) Status/purpose of `src/types/vue3-easy-data-table.d.ts`

Result:
- File path does **not exist** currently.
- Read attempt returned ENOENT.

Existing `src/types` files found:
- `src/types/orgnote-global.d.ts`
- `src/types/vue3-katex.d.ts`
- `src/types/global.d.ts`
- `src/types/router.d.ts`

Interpretation:
- There is no local augmentation/shim file for `vue3-easy-data-table` types at the expected path.

## 6) Mismatches versus official docs

From local package docs (`node_modules/vue3-easy-data-table/README.md`):
```js
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

const app = createApp(App);
app.component('EasyDataTable', Vue3EasyDataTable);
```

Current project state mismatch points:
1. **No global registration** (`app.component`) in project source setup.
2. **Inconsistent local runtime import style** across two SFCs:
   - `PerformanceReportContainer.vue`: named import `{ EasyDataTable }`
   - `OrgTable.vue`: default import `EasyDataTable`
3. `PerformanceReportContainer.vue` includes a `@ts-expect-error` message about default export but uses a named import, indicating potential drift or unresolved typing/export consistency issue.

## Final assessment
- `<easy-data-table>` is used in exactly two SFCs.
- CSS is globally configured.
- Global component registration is absent.
- Local runtime registration exists but is inconsistent across those two files.
- No `src/types/vue3-easy-data-table.d.ts` shim currently exists, which may be relevant to the TS export mismatch noted in comments/import forms.
