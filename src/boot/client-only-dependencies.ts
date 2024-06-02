import { boot } from 'quasar/wrappers';
import { tinykeys } from 'tinykeys';

export default boot(() => {
  window.tinykeys = tinykeys;
});
