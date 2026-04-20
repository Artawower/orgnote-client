import { mount } from '@vue/test-utils';
import { test, expect, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import OrgSrcBlock from './OrgSrcBlock.vue';
import { getSrcBlockCode } from './src-block-node';

vi.mock('./src-block-node', () => ({
  getSrcBlockCode: vi.fn(() => 'mocked source code'),
}));

const AppCodeStub = defineComponent({
  name: 'AppCode',
  props: ['code'],
  render() {
    return h('div', { class: 'app-code-stub' }, this.code ?? '');
  },
});

const createMockNode = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  rawValue: 'default code',
  children: [],
  ...overrides,
});

const mountOrgSrcBlock = (props: Record<string, unknown>) =>
  mount(OrgSrcBlock, {
    props: props as any,
    global: {
      components: {
        AppCode: AppCodeStub,
      },
    },
  });

test('OrgSrcBlock renders code content through AppCode', () => {
  const mockNode = createMockNode();
  const wrapper = mountOrgSrcBlock({ node: mockNode });

  const appCode = wrapper.findComponent(AppCodeStub);
  expect(appCode.exists()).toBe(true);
  expect(getSrcBlockCode).toHaveBeenCalledWith(mockNode);
  expect(appCode.props('code')).toBe('mocked source code');
});

test('OrgSrcBlock uses nodeGetter when provided', () => {
  const fallbackNode = createMockNode();
  const dynamicNode = createMockNode({ rawValue: 'dynamic code' });
  const nodeGetter = () => dynamicNode;

  mountOrgSrcBlock({ node: fallbackNode, nodeGetter });

  expect(getSrcBlockCode).toHaveBeenCalledWith(dynamicNode);
});
