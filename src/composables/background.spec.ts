import { createPinia, setActivePinia } from 'pinia';
import { useBackgroundSettings } from './background';
import { StatusBar } from '@capacitor/status-bar';
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
  const bgSettings = useBackgroundSettings();
  await bgSettings.setStatusBarBackground('bg');
  expect(StatusBar.setBackgroundColor).toHaveBeenCalledWith({ color: '#FFFFFF' });
});

test('setStatusBarBackground does nothing if color is not found', async () => {
  const mockedGetCssVar = getCssVar as Mock;
  mockedGetCssVar.mockReturnValueOnce(null);

  const bgSettings = useBackgroundSettings();

  await bgSettings.setStatusBarBackground('bg');

  expect(StatusBar.setBackgroundColor).not.toHaveBeenCalled();
  expect(StatusBar.setStyle).not.toHaveBeenCalled();
});

test('setBottomBarBackground sets the navigation bar color', async () => {
  const bgSettings = useBackgroundSettings();
  await bgSettings.setBottomBarBackground('bg');
  expect(NavigationBar.setColor).toHaveBeenCalledWith({ color: '#FFFFFF' });
});

test('setBottomBarBackground does nothing if color is not found', async () => {
  const mockedGetCssVar = getCssVar as Mock;
  mockedGetCssVar.mockReturnValueOnce(null);

  const bgSettings = useBackgroundSettings();

  await bgSettings.setBottomBarBackground('custom-color');

  expect(NavigationBar.setColor).not.toHaveBeenCalled();
});

vi.mock('src/utils/css-utils', () => ({
  getCssVar: vi.fn((name) => (name === 'bg' ? '#FFFFFF' : null)),
}));

let themeMeta: HTMLMetaElement;

beforeEach(() => {
  vi.clearAllMocks();

  // Очистка мета-тегов перед каждым тестом
  document.head.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());

  // Создание базового мета-тега для тестов
  themeMeta = document.createElement('meta');
  themeMeta.name = 'theme-color';
  document.head.appendChild(themeMeta);
});

test('setThemeColor updates existing meta tag with the correct color', () => {
  const bgSettings = useBackgroundSettings();
  bgSettings.setBackground('bg');

  expect(getCssVar).toHaveBeenCalledWith('bg');
  expect(themeMeta.getAttribute('content')).toBe('#FFFFFF');
});

test('setThemeColor creates a new meta tag if it does not exist', () => {
  document.head.querySelector('meta[name="theme-color"]').remove();

  const bgSettings = useBackgroundSettings();
  bgSettings.setBackground('bg');

  const newMeta = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement;

  expect(getCssVar).toHaveBeenCalledWith('bg');
  expect(newMeta).toBeTruthy();
  expect(newMeta.getAttribute('content')).toBe('#FFFFFF');
});

test('setThemeColor does nothing if color is not found', () => {
  const mockedGetCssVar = getCssVar as Mock;
  mockedGetCssVar.mockReturnValueOnce(null);

  const bgSettings = useBackgroundSettings();
  bgSettings.setBackground('bg');

  expect(document.querySelector('meta[name="theme-color"]')).toBeTruthy();
  expect(themeMeta.getAttribute('content')).toBeNull();
});
