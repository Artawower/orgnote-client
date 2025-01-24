import { getNumericCssVar } from 'src/utils/css-utils';
import { ref, onMounted, onUnmounted, computed } from 'vue';

// TODO: feat/stable-beta add to API
export function useScreenDetection() {
  const screenWidth = ref(window.innerWidth);

  const breakpoints = {
    tablet: getNumericCssVar('--tablet'),
    desktop: getNumericCssVar('--desktop'),
  };

  const desktopAbove = computed(() => screenWidth.value > breakpoints.desktop);
  const desktopBelow = computed(() => screenWidth.value < breakpoints.desktop);
  const tabletBelow = computed(() => screenWidth.value < breakpoints.tablet);
  const tabletAbove = computed(() => screenWidth.value >= breakpoints.tablet);
  const mobile = computed(() => screenWidth.value < breakpoints.tablet);

  const updateScreenWidth = () => {
    screenWidth.value = window.innerWidth;
  };

  onMounted(() => {
    window.addEventListener('resize', updateScreenWidth);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', updateScreenWidth);
  });

  return {
    screenWidth,
    desktopAbove,
    desktopBelow,
    tabletBelow,
    tabletAbove,
    mobile,
  };
}
