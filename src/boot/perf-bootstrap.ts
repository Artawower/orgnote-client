import { defineBoot } from '@quasar/app-vite/wrappers';
import { bootTimer, setupPerformanceObserver } from 'src/boot/perf-timer';

export default defineBoot(() => {
  setupPerformanceObserver();
  bootTimer.start('total');
});
