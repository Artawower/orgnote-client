import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const useNavBarStore = defineStore('nav-bar', () => {
  const router = useRouter();
  const title = ref<string>(router.currentRoute.value.meta?.title as string);
  const backTitle = ref<string>('');

  const setTitle = (newTitle: string) => {
    title.value = newTitle;
  };

  router.afterEach((to, from) => {
    backTitle.value = from.meta?.title as string;
    title.value = to.meta?.title as string;
  });

  return {
    title,
    backTitle,
    setTitle,
  };
});
