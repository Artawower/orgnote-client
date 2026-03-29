# Spec: align extension `sync` with `to(...)` error pattern

## Research inputs reviewed
- `/Users/darkawower/projects/pet/orgnote/orgnote-client/.pi/scratchpad/research-to-error-pattern.md`
  - Confirms store/command style: operational failures are wrapped with `to(...)`, branched via `isErr()`, and reported explicitly.
  - Shows `src/stores/extension.ts` already follows this style in `writeToDisk`, `readFromDisk`, `mountExtension`, and `installExtension`.
- `/Users/darkawower/projects/pet/orgnote/orgnote-client/.pi/scratchpad/research-pattern-violations.md`
  - Identifies `src/stores/extension.ts` `sync` as the primary outlier using `try/finally`.
  - Notes `src/boot/perf-timer.ts` `scopedMeasure` `try/finally` is intentional and must remain unchanged.

## File to modify
- `/Users/darkawower/projects/pet/orgnote/orgnote-client/src/stores/extension.ts`

## Exact change location
- Function: `sync` inside `useExtensionsStore`
- Code anchor: block with `loading.value++`, `try { await extensionTimer.measure('sync', ...) } finally { loading.value-- }`

## Exact replacement code
Replace current `sync` with:

```ts
const sync = async (): Promise<void> => {
  loading.value++;

  const runSync = to(
    () =>
      extensionTimer.measure('sync', async () => {
        await readFromDisk();
        registerBuiltinExtensions();
        await mountActiveExtensions();
      }),
    'Failed to sync extensions',
  );

  const result = await runSync();
  loading.value--;

  if (result.isErr()) {
    reporter.reportError(result.error);
  }
};
```

## Non-changes
- Do **not** modify `/Users/darkawower/projects/pet/orgnote/orgnote-client/src/boot/perf-timer.ts` `scopedMeasure` `try/finally`.
- Do not modify other files unless required by type/lint.

## Order of operations
1. Edit `src/stores/extension.ts` `sync` function as above.
2. Run `npx vue-tsc --noEmit`.
3. Run `npx eslint src/stores/extension.ts`.

## Expected outcome
- `sync` follows `to(...)` Result pattern used across store code.
- Loading decrement still happens after sync execution.
- Errors are reported through `reporter.reportError`.
- No TS/ESLint regressions.
