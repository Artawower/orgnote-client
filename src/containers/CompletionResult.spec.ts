import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, reactive, ref, type PropType } from 'vue';
import { beforeEach, expect, test, vi } from 'vitest';
import type { Completion, CompletionCandidate } from 'orgnote-api';

type ItemsGetter = (from: number, size: number) => readonly unknown[];

const scrollTo = vi.fn();
const search = vi.fn();
const activeCompletion = ref<Completion<unknown>>();
const showGroup = ref(false);

const completionStore = reactive({
  activeCompletion,
  search,
});

const configStore = reactive({
  config: reactive({
    completion: {
      defaultCompletionLimit: 20,
      showGroup,
    },
  }),
});

vi.mock('src/boot/api', () => ({
  api: {
    core: {
      useCompletion: () => completionStore,
      useConfig: () => configStore,
    },
  },
}));

const QVirtualScrollStub = defineComponent({
  name: 'QVirtualScroll',
  props: {
    itemsFn: { type: Function as PropType<ItemsGetter>, required: true },
    itemsSize: { type: Number, required: true },
  },
  setup(_props, { expose }) {
    expose({ scrollTo });
    return () => h('div');
  },
});

const createCandidates = (count: number): CompletionCandidate[] =>
  Array.from({ length: count }, (_, index) => ({
    title: `Candidate ${index}`,
    data: index,
    commandHandler: vi.fn(),
  }));

const mountCompletionResult = async () => {
  const { default: CompletionResult } = await import('./CompletionResult.vue');
  return mount(CompletionResult, {
    global: {
      stubs: {
        QVirtualScroll: QVirtualScrollStub,
        AsyncItemContainer: true,
        CompletionResultItem: true,
      },
    },
  });
};

beforeEach(() => {
  scrollTo.mockClear();
  search.mockReset();
  showGroup.value = false;
  const candidates = createCandidates(25);
  activeCompletion.value = {
    type: 'choice',
    candidates,
    total: candidates.length,
    selectedCandidateIndex: 0,
    searchQuery: '',
    itemsGetter: () => ({ result: candidates, total: candidates.length }),
    result: Promise.resolve(),
  };
});

test('CompletionResult scrolls to the candidate selected with keyboard navigation', async () => {
  const wrapper = await mountCompletionResult();

  activeCompletion.value!.selectedCandidateIndex = 20;
  await nextTick();
  await nextTick();

  expect(scrollTo).toHaveBeenCalledWith(20);
  wrapper.unmount();
});

test('CompletionResult accounts for group headers when scrolling to a candidate', async () => {
  showGroup.value = true;
  const candidates: CompletionCandidate[] = [
    { title: 'First', data: 1, group: 'Primary', commandHandler: vi.fn() },
    { title: 'Second', data: 2, group: 'Secondary', commandHandler: vi.fn() },
  ];
  activeCompletion.value = {
    type: 'choice',
    candidates,
    total: candidates.length,
    selectedCandidateIndex: 0,
    searchQuery: '',
    itemsGetter: () => ({ result: candidates, total: candidates.length }),
    result: Promise.resolve(),
  };
  const wrapper = await mountCompletionResult();

  activeCompletion.value.selectedCandidateIndex = 1;
  await nextTick();
  await nextTick();

  expect(scrollTo).toHaveBeenCalledWith(3);
  wrapper.unmount();
});
