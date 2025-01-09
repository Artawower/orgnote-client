import type { SplashScreenConfig, SplashScreenGroupConfig, UseSplashScreen } from 'orgnote-api';
import { Loading } from 'quasar';
import SplashScreen from 'src/components/SplashScreen.vue';
import { useUiStore } from 'src/stores/ui';
import { h } from 'vue';

export const useSplashScreen: UseSplashScreen = () => {
  const ui = useUiStore();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const show = async (config?: SplashScreenConfig) => {
    await ui.setStatusBarBackground('violet');
    await ui.setBottomBarBackground('violet');

    Loading.show({
      spinner: h(SplashScreen, { message: 'Preparing your data...' }),
      backgroundColor: 'red',
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hide = async (config?: SplashScreenGroupConfig) => {
    await ui.setStatusBarBackground('bg');
    await ui.setBottomBarBackground('bg');

    Loading.hide();
  };

  return {
    show,
    hide,
  };
};
