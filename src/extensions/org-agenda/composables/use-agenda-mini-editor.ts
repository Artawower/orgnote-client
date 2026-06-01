import { api } from 'src/boot/api';
import AgendaMiniEditor from '../components/AgendaMiniEditor.vue';
import type { AgendaTaskView } from './use-agenda-tasks';
import type { AgendaTaskDraft } from '../types';
import type { CreateTaskInput } from '../mutations/create-task';

export const useAgendaMiniEditor = () => {
  const modal = api.ui.useModal();
  const { tabletBelow } = api.ui.useScreenDetection();

  const openCreate = async (
    defaults?: Partial<AgendaTaskDraft>,
  ): Promise<CreateTaskInput | null> => {
    if (!tabletBelow.value) return null;
    return modal.open<CreateTaskInput | null>(AgendaMiniEditor, {
      mini: true,
      position: 'bottom',
      noBodyPadding: true,
      modalProps: { mode: 'create', defaults },
      modalEmits: {
        submit: (payload: CreateTaskInput) => modal.close(payload),
        close: () => modal.close(null),
      },
    });
  };

  const openEdit = (task: AgendaTaskView, filePath: string): void => {
    if (!tabletBelow.value) return;
    void modal.open(AgendaMiniEditor, {
      mini: true,
      position: 'bottom',
      noBodyPadding: true,
      modalProps: { mode: 'edit', task, filePath },
    });
  };

  return { openCreate, openEdit };
};
