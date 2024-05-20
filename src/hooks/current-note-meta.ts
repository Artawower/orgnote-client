import { computed, onBeforeUnmount } from 'vue';
import { useAppMeta } from './app-meta';
import { useCurrentNoteStore } from 'src/stores/current-note';
import { watch } from 'vue';
import { MetaOptions } from 'quasar/dist/types/meta';
import { buildMediaFilePath, getNotePublicUrl } from 'src/tools';

export function useCurrentNoteMeta() {
  const currentNoteStore = useCurrentNoteStore();

  const meta = computed(() => {
    if (!currentNoteStore.currentNote) {
      return;
    }
    const metaOptions: MetaOptions = {
      title: currentNoteStore.currentNote.meta.title,
      meta: {
        ogTitle: {
          property: 'og:title',
          content: currentNoteStore.currentNote.meta.title,
        },
      },
    };

    const currentNote = currentNoteStore.currentNote;
    if (currentNote?.meta.description) {
      metaOptions.meta.description = {
        name: 'description',
        content: currentNote.meta.description,
      };
    }
    if (currentNote?.meta.fileTags) {
      metaOptions.meta.keywords = {
        name: 'keywords',
        content: currentNote.meta.fileTags.join(', '),
      };
    }

    if (currentNote?.meta?.images?.length) {
      metaOptions.meta.ogImage = {
        property: 'og:image',
        content: buildMediaFilePath(
          currentNote.meta.images[0],
          currentNote.author.id
        ),
      };
    }

    const publicUrl = getNotePublicUrl(currentNote);
    if (publicUrl) {
      metaOptions.meta.ogUrl = {
        property: 'og:url',
        content: publicUrl,
      };
    }

    return metaOptions;
  });

  const { setMeta, useDefaultMeta } = useAppMeta(meta.value);

  watch(
    () => currentNoteStore.currentNote,
    () => {
      if (!currentNoteStore.currentNote) {
        return;
      }
      setMeta(meta.value);
    }
  );

  onBeforeUnmount(() => {
    useDefaultMeta();
  });
}
