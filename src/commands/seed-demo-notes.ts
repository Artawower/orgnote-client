import type { OrgNoteApi } from 'orgnote-api';

interface DemoNote {
  id: string;
  title: string;
  tags: string[];
  links: string[];
  summary: string;
  bullets: string[];
  todoItems: string[];
  quote?: string;
}

const DEMO_NOTE_COUNT = 600;
const DEMO_FOLDER = ['demo', 'generated'];
const MIN_LINKS = 0;
const MAX_LINKS = 4;
const MIN_TAGS = 1;
const MAX_TAGS = 4;
const BULLETS_PER_NOTE = 3;
const TODOS_PER_NOTE = 2;
const WRITE_BATCH_SIZE = 25;

const TOPICS = [
  'Knowledge Graphs',
  'Daily Planning',
  'Project Architecture',
  'Research Notes',
  'Learning Systems',
  'Mobile UX',
  'Writing Workflow',
  'TypeScript Patterns',
  'Personal Knowledge',
  'Reading Queue',
  'Team Rituals',
  'Design Systems',
] as const;

const CONTEXTS = [
  'field notes',
  'meeting notes',
  'implementation ideas',
  'retrospective notes',
  'draft principles',
  'working definitions',
  'review notes',
  'experiments',
  'benchmarks',
  'migration plans',
] as const;

const TAG_POOL = [
  'work',
  'home',
  'idea',
  'graph',
  'orgmode',
  'typescript',
  'pwa',
  'mobile',
  'research',
  'project',
  'deep-work',
  'learning',
  'weekly',
  'architecture',
  'review',
  'seeded',
] as const;

const SUMMARY_PARTS = [
  'This note captures a reusable pattern that benefits from small, linked ideas.',
  'The main value here is turning scattered observations into searchable structure.',
  'The topic is intentionally broad so related notes can connect from different angles.',
  'A compact note ages better when it links outward instead of trying to explain everything.',
  'This record is meant to look realistic enough for indexing, search, and graph testing.',
  'Most of the interesting behavior appears when similar notes are created at larger scale.',
] as const;

const BULLET_PARTS = [
  'Capture one concrete example before writing a general rule.',
  'Prefer links to neighboring notes instead of long repeated explanations.',
  'Keep naming stable so search and backlinks remain predictable.',
  'Write summaries that are useful even when opened months later.',
  'Use lightweight structure first and polish only when the idea survives.',
  'Split procedural details from conceptual notes when the list grows.',
  'Add tags only when they help retrieval from a different angle than links.',
  'Preserve enough context so the note still makes sense in isolation.',
] as const;

const TODO_PARTS = [
  'Review related notes and merge duplicates.',
  'Turn the strongest idea into a project action.',
  'Add one concrete example from real usage.',
  'Check if this topic belongs in a weekly review.',
  'Create a follow-up note for the unresolved question.',
  'Link this note from a higher-level map of content.',
] as const;

const QUOTES = [
  'Small notes become powerful when the connections remain cheap to create.',
  'A calm system is often faster than an ambitious one.',
  'Search helps retrieval, but links help understanding.',
  'The best notes survive because they stay easy to revisit.',
] as const;

const createRandom = (seed: number): (() => number) => {
  let value = seed;

  return () => {
    value += 0x6d2b79f5;
    let nextValue = value;
    nextValue = Math.imul(nextValue ^ (nextValue >>> 15), nextValue | 1);
    nextValue ^= nextValue + Math.imul(nextValue ^ (nextValue >>> 7), nextValue | 61);
    return ((nextValue ^ (nextValue >>> 14)) >>> 0) / 4294967296;
  };
};

const pickIndex = (random: () => number, length: number): number => Math.floor(random() * length);

const pickManyUnique = <T>(values: readonly T[], count: number, random: () => number): T[] => {
  const pool = [...values];
  const result: T[] = [];

  while (pool.length > 0 && result.length < count) {
    const index = pickIndex(random, pool.length);
    const [item] = pool.splice(index, 1);
    if (item !== undefined) {
      result.push(item);
    }
  }

  return result;
};

const randomCount = (random: () => number, min: number, max: number): number =>
  Math.floor(random() * (max - min + 1)) + min;

const buildTitle = (index: number, random: () => number): string => {
  const topic = TOPICS[pickIndex(random, TOPICS.length)];
  const context = CONTEXTS[pickIndex(random, CONTEXTS.length)];
  return `${topic} ${String(index + 1).padStart(3, '0')} - ${context}`;
};

const buildId = (index: number): string => `demo-${String(index + 1).padStart(4, '0')}`;

const buildSummary = (random: () => number): string =>
  pickManyUnique(SUMMARY_PARTS, 2, random).join(' ');

const buildBullets = (random: () => number): string[] =>
  pickManyUnique(BULLET_PARTS, BULLETS_PER_NOTE, random);

const buildTodos = (random: () => number): string[] =>
  pickManyUnique(TODO_PARTS, TODOS_PER_NOTE, random);

const maybeQuote = (random: () => number): string | undefined => {
  if (random() < 0.45) {
    return QUOTES[pickIndex(random, QUOTES.length)];
  }

  return undefined;
};

const buildTags = (random: () => number): string[] => {
  const count = randomCount(random, MIN_TAGS, MAX_TAGS);
  return pickManyUnique(TAG_POOL, count, random);
};

const buildLinks = (
  noteIds: readonly string[],
  currentId: string,
  random: () => number,
): string[] => {
  const otherIds = noteIds.filter((id) => id !== currentId);
  const count = randomCount(random, MIN_LINKS, MAX_LINKS);
  return pickManyUnique(otherIds, count, random);
};

const createDemoNotes = (): DemoNote[] => {
  const random = createRandom(42);
  const noteIds = Array.from({ length: DEMO_NOTE_COUNT }, (_, index) => buildId(index));

  return noteIds.map((id, index) => ({
    id,
    title: buildTitle(index, random),
    tags: buildTags(random),
    links: buildLinks(noteIds, id, random),
    summary: buildSummary(random),
    bullets: buildBullets(random),
    todoItems: buildTodos(random),
    quote: maybeQuote(random),
  }));
};

const buildLinkSection = (note: DemoNote, notesById: Map<string, DemoNote>): string => {
  if (note.links.length === 0) {
    return '* Related\n\n- No explicit links yet\n';
  }

  const linkLines = note.links
    .map((id) => `- [[id:${id}][${notesById.get(id)?.title ?? id}]]`)
    .join('\n');

  return `* Related\n\n${linkLines}\n`;
};

const buildQuoteSection = (quote?: string): string => {
  if (!quote) {
    return '';
  }

  return `* Quote\n\n#+begin_quote\n${quote}\n#+end_quote\n\n`;
};

const buildOrgContent = (note: DemoNote, notesById: Map<string, DemoNote>): string => {
  const tags = `:${note.tags.join(':')}:`;
  const bullets = note.bullets.map((item) => `- ${item}`).join('\n');
  const todos = note.todoItems.map((item) => `** TODO ${item}`).join('\n');

  return (
    `:PROPERTIES:\n:ID: ${note.id}\n:END:\n` +
    `#+TITLE: ${note.title}\n` +
    `#+FILETAGS: ${tags}\n\n` +
    `* Overview\n\n${note.summary}\n\n` +
    `* Notes\n\n${bullets}\n\n` +
    buildQuoteSection(note.quote) +
    buildLinkSection(note, notesById) +
    `\n* Actions\n\n${todos}\n`
  );
};

const writeBatch = async (
  fs: ReturnType<OrgNoteApi['core']['useFileSystem']>,
  notes: DemoNote[],
  notesById: Map<string, DemoNote>,
): Promise<void> => {
  await Promise.all(
    notes.map((note) =>
      fs.writeFile([...DEMO_FOLDER, `${note.id}.org`], buildOrgContent(note, notesById)),
    ),
  );
};

const writeNotesInBatches = async (
  fs: ReturnType<OrgNoteApi['core']['useFileSystem']>,
  notes: DemoNote[],
  notesById: Map<string, DemoNote>,
): Promise<void> => {
  for (let index = 0; index < notes.length; index += WRITE_BATCH_SIZE) {
    const batch = notes.slice(index, index + WRITE_BATCH_SIZE);
    await writeBatch(fs, batch, notesById);
  }
};

export const seedDemoNotes = async (api: OrgNoteApi): Promise<void> => {
  const fs = api.core.useFileSystem();
  const notes = createDemoNotes();
  const notesById = new Map(notes.map((note) => [note.id, note]));

  await writeNotesInBatches(fs, notes, notesById);
};
