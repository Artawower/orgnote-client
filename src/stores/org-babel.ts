import { defineStore } from 'pinia';

import { ref } from 'vue';

export interface OrgBabel {
  executor: (code: string) => Promise<string> | string;
  languages?: string[];
}

export const useOrgBabelStore = defineStore('org-babel', () => {
  const orgBabels = ref<{ [lang: string]: OrgBabel }>();

  const execute = async (lang: string, code: string) => {
    const babel = orgBabels.value?.[lang];
    if (!babel) {
      throw new Error(`No babel registered for ${lang}`);
    }
    return babel.executor(code);
  };

  const register = (babel: OrgBabel) => {
    if (!babel.languages) {
      return;
    }
    babel.languages.forEach((lang) => {
      orgBabels.value = {
        ...orgBabels.value,
        [lang]: babel,
      };
    });
  };

  return {
    orgBabels,
    register,
    execute,
  };
});
