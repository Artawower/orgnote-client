# Research: `vue3-easy-data-table` official local package docs

Sources read:
- `/Users/darkawower/projects/pet/orgnote/orgnote-client/node_modules/vue3-easy-data-table/README.md`
- `/Users/darkawower/projects/pet/orgnote/orgnote-client/node_modules/vue3-easy-data-table/package.json`

## README facts (exact snippets)

### Installation snippet
```md
#### Install
```js
npm install vue3-easy-data-table
// or
yarn add vue3-easy-data-table
```
```

### Registration snippet (ES module)
```md
#### Regist
```js
import Vue3EasyDataTable from 'vue3-easy-data-table';
import 'vue3-easy-data-table/dist/style.css';

const app = createApp(App);
app.component('EasyDataTable', Vue3EasyDataTable);
```
```

### Usage snippet (component tag)
```md
<template>
  <EasyDataTable
    :headers="headers"
    :items="items"
  />
</template>
```

### Types snippet from README usage example
```md
import type { Header, Item } from "vue3-easy-data-table";
```

## package.json facts (exact snippets)

### Package metadata/export fields
```json
"version": "1.5.47",
"types": "./types/main.d.ts",
"main": "./dist/vue3-easy-data-table.umd.js",
"module": "./dist/vue3-easy-data-table.es.js",
"type": "module",
"exports": {
  ".": {
    "types": "./types/main.d.ts",
    "import": "./dist/vue3-easy-data-table.es.js",
    "require": "./dist/vue3-easy-data-table.umd.js"
  },
  "./dist/style.css": "./dist/style.css"
}
```

## Factual summary
- Official README instructs runtime registration via:
  - `import Vue3EasyDataTable from 'vue3-easy-data-table'`
  - `app.component('EasyDataTable', Vue3EasyDataTable)`
- Official README explicitly includes stylesheet import:
  - `import 'vue3-easy-data-table/dist/style.css';`
- Official README demonstrates type imports for table data models:
  - `import type { Header, Item } from "vue3-easy-data-table";`
- Package exports indicate ESM/UMD entrypoints and a dedicated exported CSS path `./dist/style.css`.
