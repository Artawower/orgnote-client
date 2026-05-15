import { expect, test } from 'vitest';
import { undoRecurringCompletion } from './undo-recurring-completion';

test('undoRecurringCompletion_removesTodayDoneEntry_andRewindsScheduled', () => {
  const content =
    '* TODO Daily\nSCHEDULED: <2026-05-14 Thu +1d>\n:LOGBOOK:\n- State "DONE" from "TODO" [2026-05-13 Wed 14:30]\n:END:\nBody\n';

  const result = undoRecurringCompletion(content, 0, '2026-05-13');

  expect(result).toBeDefined();
  expect(result).not.toContain('State "DONE"');
  expect(result).toContain('SCHEDULED: <2026-05-13');
  expect(result).not.toContain('SCHEDULED: <2026-05-14');
});
