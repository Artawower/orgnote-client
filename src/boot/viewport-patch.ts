import { defineBoot } from '@quasar/app-vite/wrappers';
import { Keyboard, KeyboardResize } from '@capacitor/keyboard';
import { iosOnly } from 'src/utils/platform-specific';

export default defineBoot(async () => {
  await iosOnly(Keyboard.setResizeMode)({ mode: KeyboardResize.Native });
  await iosOnly(Keyboard.setScroll)({ isDisabled: true });
});
