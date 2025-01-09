import { defineStore } from 'pinia';
import type { UiStore } from 'orgnote-api';
import { mobileOnly } from 'src/utils/platform-specific';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useSettingsStore } from './settings';
import { getCssVar } from 'src/utils/css-utils';
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';

export const useUiStore = defineStore<'ui-store', UiStore>('ui-store', () => {
  const { config } = useSettingsStore();

  const setStatusBarBackground = async (bgColor?: string) => {
    const backgroundColor = getCssVar(bgColor ?? 'bg');
    if (!backgroundColor) {
      return;
    }
    const style = config.ui.theme === 'dark' ? Style.Dark : Style.Light;
    await StatusBar.setBackgroundColor({ color: backgroundColor });
    StatusBar.setStyle({ style });
  };

  const setBottomBarBackground = async (bgColor?: string) => {
    const backgroundColor = getCssVar(bgColor ?? 'bg');
    if (!backgroundColor) {
      return;
    }

    await NavigationBar.setColor({
      color: backgroundColor,
    });
  };

  const store: UiStore = {
    setBottomBarBackground: mobileOnly(setBottomBarBackground),
    setStatusBarBackground: mobileOnly(setStatusBarBackground),
  };

  return store;
});
