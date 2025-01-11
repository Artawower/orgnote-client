import { mobileOnly } from 'src/utils/platform-specific';
import { StatusBar, Style } from '@capacitor/status-bar';
import { getCssVar } from 'src/utils/css-utils';
import { NavigationBar } from '@hugotomazi/capacitor-navigation-bar';
import { useSettingsStore } from 'src/stores/settings';
import type { BackgroundSettings } from 'orgnote-api';

export const useBackgroundSettings = () => {
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

  const setBackground = async (bgColor?: string) => {
    setThemeColor(bgColor);
    await Promise.all([setStatusBarBackground(bgColor), setBottomBarBackground(bgColor)]);
  };

  function setThemeColor(bgColor?: string): void {
    const backgroundColor = getCssVar(bgColor ?? 'bg');
    if (!backgroundColor) {
      return;
    }

    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.setAttribute('content', backgroundColor);
      return;
    }

    const newMeta = document.createElement('meta');
    newMeta.name = 'theme-color';
    newMeta.content = backgroundColor;
    document.head.appendChild(newMeta);
  }

  const bgSettings: BackgroundSettings = {
    setBottomBarBackground: mobileOnly(setBottomBarBackground),
    setStatusBarBackground: mobileOnly(setStatusBarBackground),
    setBackground: mobileOnly(setBackground),
  };

  return bgSettings;
};
