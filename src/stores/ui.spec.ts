import { createTestingPinia } from '@pinia/testing';
import { createPinia, setActivePinia } from 'pinia';
import { useUiStore } from 'src/stores/ui';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';
import type { Mock } from 'vitest';
import { vi, test, expect, beforeEach } from 'vitest';
import { getCssVar } from 'src/utils/css-utils';

vi.mock('@capacitor/status-bar', () => {
  console.log('Mock for StatusBar applied');
  return {
    StatusBar: {
      setBackgroundColor: vi.fn(),
      setStyle: vi.fn(),
    },
    Style: {
      Dark: 'DARK',
      Light: 'LIGHT',
    },
  };
});

vi.mock('@hugotomazi/capacitor-navigation-bar', () => ({
  NavigationBar: {
    setColor: vi.fn(),
  },
}));

vi.mock('quasar', () => ({
  Platform: {
    is: {
      nativeMobile: true,
      android: false,
      mobile: false,
    },
  },
}));

vi.mock('./settings', () => ({
  useSettingsStore: vi.fn(() => ({
    config: {
      ui: {
        theme: 'dark',
      },
    },
  })),
}));

vi.mock('src/utils/css-utils', () => ({
  getCssVar: vi.fn((name) => (name === 'bg' ? '#FFFFFF' : null)),
}));

beforeEach(() => {
  setActivePinia(createPinia());
  process.env.CLIENT = 'true';
  vi.clearAllMocks();
});

test('setStatusBarBackground sets the background color and style for dark theme', async () => {
  const uiStore = useUiStore();

  await uiStore.setStatusBarBackground('custom-color');

  expect(StatusBar.setBackgroundColor).toHaveBeenCalledWith({ color: '#FFFFFF' });
  expect(StatusBar.setStyle).toHaveBeenCalledWith({ style: Style.Dark });
});

test('setStatusBarBackground does nothing if color is not found', async () => {
  const mockedGetCssVar = getCssVar as Mock;
  mockedGetCssVar.mockReturnValueOnce(null);

  const uiStore = useUiStore();

  await uiStore.setStatusBarBackground('custom-color');

  expect(StatusBar.setBackgroundColor).not.toHaveBeenCalled();
  expect(StatusBar.setStyle).not.toHaveBeenCalled();
});

test('setBottomBarBackground sets the navigation bar color', async () => {
  const uiStore = useUiStore();

  vi.mock('src/utils/css-utils', () => ({
    getCssVar: vi.fn(() => '#FFFFFF'),
  }));

  await uiStore.setBottomBarBackground('custom-color');

  expect(NavigationBar.setColor).toHaveBeenCalledWith({ color: '#FFFFFF' });
});

test('setBottomBarBackground does nothing if color is not found', async () => {
  const mockedGetCssVar = getCssVar as Mock;
  mockedGetCssVar.mockReturnValueOnce(null);

  const uiStore = useUiStore();

  await uiStore.setBottomBarBackground('custom-color');

  expect(NavigationBar.setColor).not.toHaveBeenCalled();
});
