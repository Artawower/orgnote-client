import type { SplashScreenConfig, SplashScreenGroupConfig, UseSplashScreen } from 'orgnote-api';
import { Loading } from 'quasar';
import SplashScreen from 'src/components/SplashScreen.vue';
import { h } from 'vue';

export const useSplashScreen: UseSplashScreen = () => {
  const show = (config?: SplashScreenConfig) => {
    console.log('✎: [line 8][BOOT] config: ', config);
    Loading.show({
      spinner: h(SplashScreen, { message: 'Preparing your data...' }),
      backgroundColor: 'red',
      // message: 'Initializing...',
      // spinnerSize: 140,
      // spinnerColor: 'white', // Задайте цвет спиннера
      // backgroundColor: '#4CAF50', // Цвет фона
    });
  };

  const hide = (config?: SplashScreenGroupConfig) => {
    console.log('✎: [line 20][BOOT] config: ', config);
    Loading.hide();
  };

  return {
    show,
    hide,
  };
};
