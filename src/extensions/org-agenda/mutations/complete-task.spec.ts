import { expect, test } from 'vitest';
import { completeTask } from './complete-task';

const completedAt = new Date(2026, 4, 13, 12, 34);
const logLine = '- State "DONE" from "WAIT" [2026-05-13 Wed 12:34]';

test('completeTask_recordsStateChangeInLogbook', () => {
  const content = '* WAIT Task\nSCHEDULED: <2026-05-13 Wed>\nBody\n';

  expect(completeTask(content, 0, completedAt)).toBe(
    `* DONE Task\nCLOSED: [2026-05-13 Wed 12:34] SCHEDULED: <2026-05-13 Wed>\n:LOGBOOK:\n${logLine}\n:END:\nBody\n`,
  );
});
