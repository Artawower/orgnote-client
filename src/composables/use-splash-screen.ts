import type { SplashScreenConfig, SplashScreenGroupConfig, UseSplashScreen } from 'orgnote-api';
import { Loading } from 'quasar';
import SplashScreen from 'src/components/SplashScreen.vue';
import { h } from 'vue';
import { useBackgroundSettings } from './background';

export const useSplashScreen: UseSplashScreen = () => {
  const bg = useBackgroundSettings();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const show = async (config?: SplashScreenConfig) => {
    await bg.setStatusBarBackground('violet');
    await bg.setBottomBarBackground('violet');

    Loading.show({
      spinner: h(SplashScreen, { message: 'Preparing your data...' }),
      backgroundColor: 'red',
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hide = async (config?: SplashScreenGroupConfig) => {
    await bg.setStatusBarBackground('bg');
    await bg.setBottomBarBackground('bg');

    Loading.hide();
  };

  return {
    show,
    hide,
  };
};
