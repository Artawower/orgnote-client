# Comparison: `EasyDataTable` component resolution in two Vue SFCs

## Files compared
1. `src/extensions/org-table/OrgTable.vue`
2. `src/containers/PerformanceReportContainer.vue`

---

## 1) Whether `EasyDataTable` is imported in each file

### `src/extensions/org-table/OrgTable.vue`
- **No runtime/default import** of `EasyDataTable` is present.
- Only type import exists:

```ts
import type { Header, Item } from 'vue3-easy-data-table';
```

### `src/containers/PerformanceReportContainer.vue`
- In current file content, there is also **no runtime/default import** of `EasyDataTable`.
- Only type import exists:

```ts
import type { Header, Item } from 'vue3-easy-data-table';
```

---

## 2) Whether imported symbol is used in template (`easy-data-table` tag)

### `src/extensions/org-table/OrgTable.vue`
- Template uses `<easy-data-table ...>` as root wrapper for table rendering.
- Since no `EasyDataTable` runtime symbol is imported in `<script setup>`, resolution must come from global registration (or compiler/plugin behavior), not local registration.

Snippet:
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

### `src/containers/PerformanceReportContainer.vue`
- Template also uses `<easy-data-table ...>`.
- Same situation: no local runtime import symbol in script.

Snippet:
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

---

## 3) Differences in `<script setup>` affecting local component registration

### Local registration mechanics in `<script setup>`
- A component is locally available to template when its runtime symbol is imported in script (e.g. `import EasyDataTable from '...'`) and then referenced by tag naming transform.
- **Neither file imports runtime `EasyDataTable` currently**, so both rely on non-local registration.

### Notable differences between files (not registration-related)
- `OrgTable.vue` imports and uses:
  - `ContentRenderer` runtime component import
  - `storeToRefs(useConfigStore())`
  - Org-node-specific computed transformations
- `PerformanceReportContainer.vue` imports and uses:
  - `ContainerLayout`, `MenuItem`, `CardWrapper`, `SafeArea` runtime components
  - i18n + perf report composables

These differences affect data/UX logic, but **do not create a difference in `easy-data-table` local registration** because in both files it is not locally runtime-imported.

---

## Conclusion
- **Current state parity:** both files use `<easy-data-table>` in template and only `import type { Header, Item }` from the package in script.
- Therefore, for `easy-data-table`, both files have the same resolution mode: **not locally registered via `<script setup>` runtime import**.
- Any behavior difference between these two files is likely from external registration/context or other compile/runtime factors, not from local `EasyDataTable` import presence.