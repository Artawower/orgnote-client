# Pattern-violation scan: perf-related touched files (`try/finally` vs `to(...)`)

## Scope checked
- `src/stores/extension.ts`
- `src/boot/perf-timer.ts`
- `src/commands/developer-commands.ts`
- `src/containers/PerformanceReportContainer.vue`
- `src/boot/api.ts`

## Findings

### 1) Confirmed potential violation

#### File
`src/stores/extension.ts`

#### Function anchor
`useExtensionsStore -> sync`

#### Snippet
```ts
const sync = async (): Promise<void> => {
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
};
```

#### Why flagged
- This function uses `try/finally` while the same store heavily favors `to(...)`-based Result handling (`writeToDisk`, `readFromDisk`, `mountExtension`, `installExtension`, etc.).
- If the goal of the revision is stricter `to(...)` consistency, `sync` is the clearest outlier.

#### Caveat
- `finally` currently guarantees loading counter decrement even on thrown errors.
- A replacement with `to(...)` must preserve this guarantee (e.g., explicit finalize path with combinator / equivalent deterministic cleanup).

---

### 2) `try/finally` exists but appears intentional utility-level behavior (not a store/command policy mismatch)

#### File
`src/boot/perf-timer.ts`

#### Function anchor
`createPerfTimer -> scopedMeasure`

#### Snippet
```ts
const scopedMeasure = async <T>(
  label: string,
  fn: () => T | Promise<T>,
): Promise<T> => {
  scopedStart(label);

  try {
    return await fn();
  } finally {
    scopedEnd(label);
  }
};
```

#### Assessment
- Not flagged as a violation for the stated rule target.
- This is infrastructure timing logic where `finally` is required to always close measurement even when callback throws.
- This file does not otherwise use `to(...)`, and pattern is coherent for timer semantics.

---

### 3) No `try/finally`/`to(...)` inconsistency detected

#### File
`src/commands/developer-commands.ts`
- No `try/finally` found.
- No direct `to(...)` usage in command handlers.
- Handlers are straightforward orchestration; no explicit mismatch similar to `extension.sync`.

#### File
`src/containers/PerformanceReportContainer.vue`
- No `try/finally` found.
- Mostly pure view/computed formatting logic.
- No candidate violation of `try/finally` vs `to(...)` pattern.

#### File
`src/boot/api.ts`
- No `try/finally` found.
- Uses `bootTimer.measure(...)` wrappers; no local error-wrapper inconsistency of the same type.

---

## Summary
- **Primary outlier:** `src/stores/extension.ts` → `sync`.
- **Utility exception (likely valid):** `src/boot/perf-timer.ts` → `scopedMeasure` uses `try/finally` for guaranteed timer closure.
- **Other scanned perf-related touched files:** no similar pattern-violation candidates found.
