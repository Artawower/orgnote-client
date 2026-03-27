import type { OrgNoteApi } from 'orgnote-api';

interface DemoNote {
  id: string;
  title: string;
  links: string[];
}

const DEMO_NOTES: readonly DemoNote[] = [
  { id: 'pkm-01', title: 'Personal Knowledge Management', links: ['pkm-02', 'pkm-03', 'pkm-04', 'prog-01', 'read-01'] },
  { id: 'pkm-02', title: 'Zettelkasten Method', links: ['pkm-03', 'pkm-05', 'read-02'] },
  { id: 'pkm-03', title: 'Evergreen Notes', links: ['pkm-04', 'pkm-06'] },
  { id: 'pkm-04', title: 'Atomic Notes', links: ['pkm-05'] },
  { id: 'pkm-05', title: 'Note Linking Strategy', links: ['pkm-06', 'proj-01'] },
  { id: 'pkm-06', title: 'Spaced Repetition', links: ['read-03'] },

  { id: 'prog-01', title: 'Software Architecture', links: ['prog-02', 'prog-03', 'prog-04', 'proj-02'] },
  { id: 'prog-02', title: 'Functional Programming', links: ['prog-05', 'prog-06'] },
  { id: 'prog-03', title: 'Type Systems', links: ['prog-02', 'prog-06'] },
  { id: 'prog-04', title: 'Design Patterns', links: ['prog-05', 'proj-03'] },
  { id: 'prog-05', title: 'Refactoring Techniques', links: ['prog-06'] },
  { id: 'prog-06', title: 'Code Quality', links: ['proj-01'] },

  { id: 'read-01', title: 'Reading Workflow', links: ['read-02', 'read-03', 'read-04'] },
  { id: 'read-02', title: 'Literature Notes', links: ['pkm-02', 'read-05'] },
  { id: 'read-03', title: 'Highlights and Annotations', links: ['read-04', 'read-06'] },
  { id: 'read-04', title: 'Book Summaries', links: ['read-05'] },
  { id: 'read-05', title: 'Reading List', links: ['read-06', 'daily-01'] },
  { id: 'read-06', title: 'Fleeting Notes', links: ['pkm-04'] },

  { id: 'proj-01', title: 'Project Management', links: ['proj-02', 'proj-03', 'proj-04', 'daily-02'] },
  { id: 'proj-02', title: 'OrgNote Development', links: ['prog-01', 'proj-05'] },
  { id: 'proj-03', title: 'Research Projects', links: ['read-01', 'proj-06'] },
  { id: 'proj-04', title: 'Task Inbox', links: ['proj-05', 'daily-01'] },
  { id: 'proj-05', title: 'Weekly Goals', links: ['proj-06', 'daily-03'] },
  { id: 'proj-06', title: 'Someday Maybe List', links: ['daily-02'] },

  { id: 'daily-01', title: 'Daily Notes System', links: ['daily-02', 'daily-03', 'pkm-01'] },
  { id: 'daily-02', title: 'Morning Review', links: ['daily-04', 'daily-05'] },
  { id: 'daily-03', title: 'Evening Reflection', links: ['daily-04', 'pkm-06'] },
  { id: 'daily-04', title: 'Habit Tracking', links: ['daily-05', 'daily-06'] },
  { id: 'daily-05', title: 'Gratitude Log', links: ['daily-06'] },
  { id: 'daily-06', title: 'Weekly Review', links: ['proj-05', 'pkm-03'] },
];

const FILLER_TEXT =
  'Obvious but irrefutable conclusions, as well as obvious signs of the victory of institutionalization, ' +
  'form a global economic network and at the same time are called to account. On the other hand, ' +
  'the further development of various forms of activity directly depends on standard approaches. ' +
  'Thus, constant information and propaganda support of our activities entails a process of ' +
  'introduction and modernization of the strengthening of moral values.';

const buildOrgContent = (note: DemoNote, notesById: Map<string, DemoNote>): string => {
  const linkLines = note.links
    .map((id) => `- [[id:${id}][${notesById.get(id)?.title ?? id}]]`)
    .join('\n');

  return (
    `:PROPERTIES:\n:ID: ${note.id}\n:END:\n` +
    `#+TITLE: ${note.title}\n\n` +
    `* Overview\n\n${FILLER_TEXT}\n\n` +
    `* Related\n\n${linkLines}\n`
  );
};

export const seedDemoNotes = async (api: OrgNoteApi): Promise<void> => {
  const fs = api.core.useFileSystem();
  const notesById = new Map(DEMO_NOTES.map((n) => [n.id, n]));

  await DEMO_NOTES.reduce(
    (chain, note) => chain.then(() => fs.writeFile(['demo', `${note.id}.org`], buildOrgContent(note, notesById))),
    Promise.resolve(),
  );
};
