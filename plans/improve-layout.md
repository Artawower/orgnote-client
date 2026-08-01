# Desktop Pane and Buffer Lifecycle Improvements

**Status: DRAFT**

## Goal

Make desktop panes predictable and isolated:

- navigation in one pane must not visually update neighboring buffers;
- switching tabs must preserve editor view state;
- pane, layout, route, and buffer state must remain consistent;
- inactive buffers must not leak resources or perform unnecessary work.

## Current model

```text
Layout tree
└── Pane
    └── Tab
        └── memory Router
            └── Buffer URI
                └── Buffer
                    └── Viewer component
```

`PanesPage` renders the layout tree through `LayoutRenderer`. Each `AppPane` renders tab headers but mounts only the active tab's `ScopedRouterView`. `FilePage` resolves the buffer and viewer for the active route. Buffer text lives outside the viewer, while cursor, selection, scroll position, folds, and editor history live inside the viewer instance.

## Confirmed correctness issues

### 1. Stale asynchronous buffer activation

**Files:**

- `src/pages/AppBuffer.vue`
- `src/stores/buffer.ts`

`AppBuffer` starts `getOrCreateBuffer()` from an asynchronous watcher without invalidating the previous request. A slow request for route A can finish after a newer request for route B and replace `activeBuffer` with A.

Consequences:

- stale error state;
- unbalanced buffer reference counts;
- a loaded buffer may remain retained after the component stops displaying it.

The watcher must invalidate stale requests and release every acquired buffer exactly once.

### 2. Incomplete buffer disposal

**File:** `src/stores/buffer.ts`

`releaseBuffer()` only decreases `referenceCount`. `cleanupUnusedBuffers()` has no production caller. Autosave watchers created by `setupRegularAutoSave()` and `setupValidatedAutoSave()` do not retain their stop handles, and `closeBuffer()` does not cancel them.

A complete buffer lifecycle must own and dispose:

- file-system watchers;
- Vue watchers;
- pending debounce callbacks;
- validation/autosave work;
- buffer map entries.

### 3. Pane snapshots can disagree with the layout tree

**Files:**

- `src/stores/pane.ts`
- `src/stores/layout.ts`
- `src/composables/pane-persistence.ts`

Embedded tabs are excluded from pane snapshots, but their pane nodes are not removed from the saved layout. The saved `activePaneId` can therefore reference a pane that is not restored. If every tab is embedded, no new snapshot is produced and an older workspace can be restored later.

Snapshot creation and restoration must validate these invariants:

- every layout pane exists in pane data;
- every tab belongs to its containing pane;
- every active pane and active tab exists;
- transient tabs and transient-only panes are removed consistently;
- invalid snapshots fall back to a valid single-pane layout.

### 4. Pane and layout mutations are not atomic

**Files:**

- `src/stores/pane.ts`
- `src/stores/layout.ts`
- `src/pages/AppPane.vue`

Pane state and layout state are owned by separate stores and synchronized through action subscriptions and UI orchestration. Public `closePane()` can remove the last pane while the root layout node continues referencing it. Edge drop performs `split` and `moveTab` as separate operations without rollback.

Workspace mutations should have one transactional boundary for:

- split pane and move tab;
- close tab and remove empty pane;
- close pane and choose a valid successor;
- restore and validate a snapshot.

### 5. Public contracts are inconsistent

**Files:**

- `src/stores/layout.ts`
- `src/stores/pane.ts`
- `src/utils/pane-router.ts`
- `orgnote-api/src/models/panes-store.ts`

Known inconsistencies:

- `initLayout(layout)` accepts a layout and immediately replaces it with a new pane node;
- route restoration by path is unreachable when a snapshot route has no name;
- `getPane()` is typed as nullable in the public API but throws in the client;
- the route parameter named `paneId` initially contains a tab ID and later contains a pane ID.

### 6. Drag state is not cleaned up defensively

**File:** `src/pages/AppPane.vue`

Drag activation uses an uncancelled timer, and split/move cleanup is not protected by `finally`. A failed operation can leave global drag state or an empty split pane behind.

## Reported issue: neighboring buffers update during navigation

**Status:** reproducible behavior reported, exact trigger not yet isolated.

A route change should update only:

- the selected tab title;
- the selected tab's router view;
- global controls that intentionally follow the active buffer.

It should not render or remount the viewer in another pane.

### Relevant reactive boundaries

- `AppPane` reads every local tab router to generate tab titles.
- `PaneStore.activeBufferUri` is global to the selected pane.
- Agenda and file-manager surfaces subscribe to the global active buffer.
- `pane-persistence` observes every tab router and serializes the workspace after navigation.
- `FilePage` correctly resolves its buffer from its injected tab router, so its route source is pane-local.
- `ScopedRouterView` is keyed by `activeTabId`; a route change within the same tab should not change neighboring pane keys.

The first implementation step must be measurement rather than speculative memoization.

### Investigation plan

1. Add temporary mount, unmount, render, and render-trigger counters to `AppPane`, `ScopedRouterView`, `FilePage`, and the Agenda buffer root.
2. Record which reactive dependency triggers the neighboring render.
3. Add an integration test with two visible panes: navigate pane A and assert that pane B is neither remounted nor rendered.
4. Separate global active-buffer consumers from pane-local route consumers.
5. Verify whether persistence serialization causes only CPU work or also reactive writes.

### Acceptance criteria

- route navigation in pane A causes zero mount/unmount events in pane B;
- the root viewer in pane B does not render when none of its inputs changed;
- tab titles still update correctly;
- sidebar follow behavior remains intentional and independently testable.

## Reported issue: tab switching loses editor view state

**Status:** confirmed by implementation.

`AppPane` mounts only the active tab's `ScopedRouterView` and keys it by `activeTabId`. Switching tabs unmounts the old viewer. `RichEditor` and `SourceCodeEditor` then destroy their CodeMirror `EditorView`. On the next mount a new `EditorState` is created; `RichEditor` also moves the cursor to the end of the document.

Currently preserved:

- buffer content.

Currently lost:

- cursor position;
- selection ranges;
- scroll position;
- folded ranges;
- undo/redo history;
- viewer-local component state.

### Options considered

#### A. Keep every tab viewer alive

Wrap tab router views in `KeepAlive` or render all tab views with `v-show`.

Advantages:

- exact cursor, selection, scroll, history, and component state;
- instant tab switching.

Risks:

- every Agenda, graph, editor, and extension viewer remains reactive;
- hidden viewers retain DOM, timers, subscriptions, and large editor states;
- this can worsen the neighboring-render problem;
- `KeepAlive` needs explicit cache eviction when a tab closes;
- active editor context, focus, and accessibility require activation hooks.

A blanket keep-alive policy is not recommended before profiling.

#### B. Save lightweight view state per tab and buffer

Destroy inactive viewers, but capture and restore a small state object keyed by `(tabId, bufferUri)`.

Initial state should contain:

- selection anchor and head;
- primary cursor position;
- scroll top and left;
- optional viewport anchor for robust restoration after document edits.

Advantages:

- bounded memory;
- hidden viewers perform no work;
- closed tabs can remove their state deterministically;
- each tab can keep a different position for the same buffer.

Trade-offs:

- viewer adapters must implement capture and restore;
- full undo history and arbitrary component state are not preserved automatically;
- positions must be clamped when content changes externally.

#### C. Selective retention policy

Allow each registered viewer to choose `destroy`, `snapshot`, or `keep-alive` behavior.

This is the most flexible long-term model, but it expands the public viewer API and should follow a proven editor-only implementation rather than precede it.

### Recommendation

Start with option B for CodeMirror viewers. It directly solves cursor, selection, and scroll restoration without keeping Agenda and graph buffers active in the background.

Use `(tabId, bufferUri)` rather than only `bufferUri`: two tabs showing the same note must retain independent positions. Remove state when a tab closes. Do not persist it across application restarts in the first iteration.

Evaluate selective keep-alive only for viewers whose complete local state cannot be represented cheaply.

### Acceptance criteria

- switching A → B → A restores cursor, selection, and scroll in A;
- two tabs showing the same buffer retain independent state;
- moving a tab to another pane preserves its state;
- closing a tab removes its cached view state;
- external content changes clamp stale positions safely;
- inactive viewers do not render or keep active editor context;
- buffer reference counts remain balanced.

## Test gaps

Required integration coverage:

- rapid A → B buffer navigation with out-of-order loading;
- route navigation in one pane does not render another pane;
- tab switching restores CodeMirror selection and scroll;
- the same buffer in two tabs has independent view state;
- split, move, close, and restore preserve workspace invariants;
- embedded-only panes produce a valid snapshot;
- closing the final pane through the public API leaves a valid workspace;
- failed drag/drop always clears drag state.

## Proposed order of work

1. Add render and lifecycle instrumentation tests.
2. Fix stale `AppBuffer` activation and buffer disposal.
3. Isolate pane-local rendering from global active-buffer state.
4. Add lightweight tab view-state restoration for CodeMirror viewers.
5. Normalize snapshot creation and restoration.
6. Introduce an atomic workspace mutation boundary.
7. Align public pane, layout, and route contracts.

## Open decisions

- Should undo/redo history survive tab switching, or only cursor, selection, and scroll?
- Should view state survive application restart?
- Which non-editor viewers genuinely require keep-alive?
- Should embedded buffers be persisted, or should their panes be removed from snapshots?
- Should route identity use `tabId`, `paneId`, or a dedicated route scope ID?
