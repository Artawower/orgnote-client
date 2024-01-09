import { defineStore } from 'pinia';

import { ref } from 'vue';

interface Sponsor {
  name: string;
  link?: string;
}

export const useSponsorsStore = defineStore('sponsors', () => {
  const sponsors = ref<Sponsor[]>([]);

  const loadSponsors = async () => {
    try {
      const rspns = await fetch('/sponsors.json');
      const data = await rspns.json();
      sponsors.value = data;
    } catch (e) {
      if (e instanceof TypeError) {
        return;
      }
      throw e;
    }
  };

  return { loadSponsors, sponsors };
});
