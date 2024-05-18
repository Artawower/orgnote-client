import { OrgBabel } from 'src/stores/org-babel';

export const jsBabel: OrgBabel = {
  languages: ['js', 'javascript'],
  executor: (code: string) => {
    return eval(code);
  },
};
