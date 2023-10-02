import { OrgBabel } from 'src/stores';

export const jsBabel: OrgBabel = {
  languages: ['js', 'javascript'],
  executor: (code: string) => {
    return eval(code);
  },
};
