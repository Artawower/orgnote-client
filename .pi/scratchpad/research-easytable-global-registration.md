# Research: `vue3-easy-data-table` global registration/setup

## Scope checked
- Global component registration (`app.component('EasyDataTable', ...)` or equivalent)
- Boot/plugins/entry imports of `vue3-easy-data-table`
- Global stylesheet import `vue3-easy-data-table/dist/style.css`
- Whether modal lazy loading impacts component resolution

## Findings

### 1) Global `EasyDataTable` component registration
**Result: not found in `src/`.**

Evidence (project-wide search under `src`):
- Searched for `app.component(`, `EasyDataTable`, and `vue3-easy-data-table` references.
- Matches found only in:
  - `src/css/app.scss` (CSS import)
  - `src/containers/PerformanceReportContainer.vue` (type import only)
  - `src/extensions/org-table/OrgTable.vue` (type import only)

No `app.component('EasyDataTable', ...)`, no plugin `.use(...)` for `vue3-easy-data-table`, and no runtime component import were found in the scanned source files.

### 2) Boot/plugins/entry imports of `vue3-easy-data-table`
**Result: no boot/plugin runtime import found for the library in `src/boot` or `src/plugins`.**

Evidence:
- Search across `src` for `vue3-easy-data-table` returned only:
  - `src/css/app.scss`
  - `src/containers/PerformanceReportContainer.vue`
  - `src/extensions/org-table/OrgTable.vue`
- No occurrences in `src/boot/*` or `src/plugins/*`.

### 3) Global CSS import
**Result: found, globally imported.**

Evidence:
- `src/css/app.scss` includes:
  - `@import 'vue3-easy-data-table/dist/style.css';`

This indicates table styles are globally available via the main app stylesheet pipeline.

### 4) Modal lazy loading and component resolution behavior
**Result: modal lazy loading is used for container components; this does not itself provide global registration for `EasyDataTable`.**

Evidence:
- `src/commands/developer-commands.ts` opens performance modal via async component:
  - `defineAsyncComponent(() => import('src/containers/PerformanceReportContainer.vue'))`
- Modal rendering path uses dynamic component from modal store:
  - `src/containers/ModalDialog.vue` renders `:is="modalData.component"`

Interpretation:
- Lazy-loaded modal containers are resolved when imported and rendered.
- If `PerformanceReportContainer.vue` template uses `<EasyDataTable />`, that tag still requires either:
  1) local component registration/import in that SFC, or
  2) global app registration elsewhere.
- Since no global registration was found in searched app setup files, modal lazy loading does **not** change this requirement.

## Conclusion
- There is **global CSS** setup for `vue3-easy-data-table` in `src/css/app.scss`.
- There is **no evidence of global runtime component registration** for `EasyDataTable` in `src` boot/plugin/setup paths.
- Modal lazy loading (`defineAsyncComponent` + dynamic `:is`) affects when container components are loaded, but does not alter Vue component registration rules for nested components like `EasyDataTable`.
