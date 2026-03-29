# Research: `to(...)` error-handling pattern in stores and commands

## Scope
Investigated `to(...)` usage under `src/`, focusing on **stores** and **commands**, then derived style guidance for `src/stores/extension.ts` `sync()`.

---

## Concrete examples (stores + commands)

### 1) Store: `src/stores/sync.ts` — `createPlanAction`
**Pattern:** wrap async calls with `to(...)`, branch on `isErr()`, centralize error handling.

```ts
const recoverResult = await to(recoverState)(state);
if (recoverResult.isErr()) return handleSyncError(recoverResult.error);

const planResult = await to(createSyncPlan)({
  fs: fs.value,
  api: sdk.sync,
  state,
  rootPath: rootPath,
  enableContentHashCheck: contentHashCheckEnabled,
});
if (planResult.isErr()) return handleSyncError(planResult.error);
```

Why notable: no local `try/catch`; failures are explicit data-flow (`Result`).

---

### 2) Store: `src/stores/extension.ts` — `writeToDisk`
**Pattern:** pre-bind safe function + compose sync and async operations (`asyncAndThen`) + report once.

```ts
const safeWrite = to(fileSystem.writeFile, 'Failed to write extensions.toml');

const res = safeStringifyToml(data).asyncAndThen((content) =>
  safeWrite(extensionsFilePath, content),
);

const result = await res;
if (result.isErr()) {
  reporter.reportError(result.error);
}
```

Why notable: keeps pipeline linear and avoids nested `try/catch`.

---

### 3) Store: `src/stores/extension.ts` — `readFromDisk`
**Pattern:** `to(...)` for I/O + guard returns for recoverable states.

```ts
const safeRead = to(fileSystem.readFile, 'Failed to read extensions.toml');
const res = await safeRead(extensionsFilePath, 'utf8');

if (res.isErr()) {
  return;
}

const parseResult = safeParseToml(content as string);
if (parseResult.isErr()) {
  reporter.reportError(parseResult.error);
  return;
}
```

Why notable: early returns are preferred for non-fatal failures.

---

### 4) Command: `src/commands/file-manager.ts` — `pickInteractiveDestination`
**Pattern:** wrap dependency call with message; on error, convert to control-flow (`cancelAndThrow`).

```ts
const destinationResult = await to(
  useTransferDestinationCompletion,
  'Failed to pick destination',
)(api, fm.path);

if (destinationResult.isErr()) {
  return cancelAndThrow(fm, destinationResult.error);
}
```

Why notable: command layer uses `to(...)` plus domain-specific failure action.

---

### 5) Command: `src/commands/file-manager.ts` — `executePendingTransferAndSync`
**Pattern:** safe wrapper around bound method + explicit error branch.

```ts
const executeResult = await to(
  fm.executePending.bind(fm),
  'Failed to execute pending transfer',
)(destination.destinationDir);

if (executeResult.isErr()) {
  return cancelAndThrow(fm, executeResult.error);
}
```

Why notable: `.bind(...)` is consistently used when passing instance methods to `to(...)`.

---

### 6) Command: `src/commands/file-manager.ts` — `safeSyncActiveFileAfterRename`
**Pattern:** `to(...)` for secondary operation; downgrade failure severity to warning.

```ts
const syncResult = await to(syncActiveFileAfterRename, 'Failed to sync active file after rename')(
  api,
  previousPath,
  nextPath,
);

if (syncResult.isErr()) {
  reporter.reportWarning(syncResult.error);
}
```

Why notable: pattern distinguishes critical vs non-critical failures by reporter level.

---

### 7) Command: `src/commands/file-manager.ts` — `executeExplicitTransfer`
**Pattern:** short `to(...)` use then rethrow in command orchestration.

```ts
const transferResult = await to(transfer, 'Failed to execute pending transfer')(
  sourcePath,
  targetPath,
);
if (transferResult.isErr()) {
  throw transferResult.error;
}
```

Why notable: command orchestrator can intentionally rethrow after `to(...)` for upstream handling.

---

## Observed style conventions

1. **Prefer `to(...)` over `try/catch`** for operational failures.
2. **Attach meaningful context message** at wrapping site (`'Failed to ...'`) when crossing module boundaries.
3. **Use guard clauses (`isErr()`)** and early returns.
4. **Choose failure policy per layer:** report+return (stores), warn (non-critical), or throw (command orchestration).
5. **Preserve `this`** via `.bind(...)` when wrapping instance methods.

---

## Recommendation for `src/stores/extension.ts` `sync()`

Current `sync()` uses `try/finally` only to manage loading counter:

```ts
loading.value++;
try {
  await extensionTimer.measure('sync', async () => {
    await readFromDisk();
    registerBuiltinExtensions();
    await mountActiveExtensions();
  });
} finally {
  loading.value--;
}
```

### Recommended replacement style
Use `to(...)` around the measured operation and explicit result handling, while keeping deterministic loading decrement (via `mapOrElse` or equivalent Result combinator) to align with existing `to(...)`-first style in the store.

Target style (conceptual):

```ts
loading.value += 1;

const runSync = to(() =>
  extensionTimer.measure('sync', async () => {
    await readFromDisk();
    registerBuiltinExtensions();
    await mountActiveExtensions();
  }),
  'Failed to sync extensions',
);

const result = await runSync();
loading.value -= 1;

if (result.isErr()) {
  reporter.reportError(result.error);
}
```

### Why this style
- Matches dominant project idiom: explicit `Result` handling via `to(...)`.
- Keeps error reporting consistent with other store methods (`writeToDisk`, `readFromDisk`, `mountExtension`, etc.).
- Avoids silent failure path for sync runtime errors.
- Maintains simple, linear control flow with guard-style branching.

If you want strict no-`try/finally`, ensure decrement is guaranteed via a Result combinator that executes both branches; otherwise fallback to current `finally` remains the safest counter integrity mechanism.
