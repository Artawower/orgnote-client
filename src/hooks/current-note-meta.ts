import { computed, onBeforeUnmount, watch } from 'vue';
import { useAppMeta } from './app-meta';
import { useCurrentNoteStore } from 'src/stores/current-note';
import { MetaOptions } from 'quasar/dist/types/meta';
import { buildMediaFilePath, getNotePublicUrl } from 'src/tools';
import { Note } from 'orgnote-api';

enum MetaProperties {
  OG_TITLE = 'og:title',
  OG_TYPE = 'og:type',
  DESCRIPTION = 'description',
  KEYWORDS = 'keywords',
  ARTICLE_TAG = 'article:tag',
  OG_IMAGE = 'og:image',
  PROFILE_USERNAME = 'profile:username',
  ARTICLE_AUTHOR = 'article:author',
  OG_URL = 'og:url',
}

function buildBasicMeta(currentNote: Note): MetaOptions {
  const { title, description } = currentNote.meta;
  return {
    title,
    meta: {
      [MetaProperties.OG_TITLE]: {
        property: MetaProperties.OG_TITLE,
        content: title,
      },
      [MetaProperties.OG_TYPE]: {
        property: MetaProperties.OG_TYPE,
        content: 'article',
      },
      ...(description && {
        [MetaProperties.DESCRIPTION]: {
          name: MetaProperties.DESCRIPTION,
          content: description,
        },
      }),
    },
  };
}

function buildKeywordsMeta(currentNote: Note): Record<string, object> {
  const { fileTags } = currentNote.meta;
  if (!fileTags) return {};

  const tagsMeta = fileTags.reduce(
    (acc, tag) => ({
      ...acc,
      [tag]: { property: MetaProperties.ARTICLE_TAG, content: tag },
    }),
    {}
  );

  return {
    [MetaProperties.KEYWORDS]: {
      name: MetaProperties.KEYWORDS,
      content: fileTags.join(', '),
    },
    ...tagsMeta,
  };
}

function buildImageMeta(currentNote: Note): Record<string, object> {
  const { images } = currentNote.meta;
  if (!images?.length) return {};

  return {
    [MetaProperties.OG_IMAGE]: {
      property: MetaProperties.OG_IMAGE,
      content: buildMediaFilePath(images[0], currentNote.author?.id),
    },
  };
}

function buildAuthorMeta(currentNote: Note): Record<string, object> {
  const { nickName } = currentNote.author || {};
  if (!nickName) return {};

  return {
    [MetaProperties.PROFILE_USERNAME]: {
      property: MetaProperties.PROFILE_USERNAME,
      content: nickName,
    },
    [MetaProperties.ARTICLE_AUTHOR]: {
      property: MetaProperties.ARTICLE_AUTHOR,
      content: nickName,
    },
  };
}

function buildUrlMeta(currentNote: Note): Record<string, object> {
  const publicUrl = getNotePublicUrl(currentNote);
  if (!publicUrl) return {};

  return {
    [MetaProperties.OG_URL]: {
      property: MetaProperties.OG_URL,
      content: publicUrl,
    },
  };
}

function buildMetaOptions(currentNote: Note): MetaOptions {
  return {
    ...buildBasicMeta(currentNote),
    meta: {
      ...buildBasicMeta(currentNote).meta,
      ...buildKeywordsMeta(currentNote),
      ...buildImageMeta(currentNote),
      ...buildAuthorMeta(currentNote),
      ...buildUrlMeta(currentNote),
    },
  };
}

function useMetaUpdater(
  currentNoteStore: ReturnType<typeof useCurrentNoteStore>,
  meta: ReturnType<typeof computed>
) {
  const { setMeta, useDefaultMeta } = useAppMeta(meta.value);

  watch(
    () => currentNoteStore.currentNote,
    (newNote) => {
      if (!newNote) return;
      setMeta(meta.value);
    }
  );

  onBeforeUnmount(() => {
    useDefaultMeta();
  });
}

export function useCurrentNoteMeta() {
  const currentNoteStore = useCurrentNoteStore();

  const meta = computed(() => {
    const currentNote = currentNoteStore.currentNote;
    return currentNote ? buildMetaOptions(currentNote) : ({} as MetaOptions);
  });

  useMetaUpdater(currentNoteStore, meta);
}
