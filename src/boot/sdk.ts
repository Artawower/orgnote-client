import { AxiosInstance, AxiosResponse } from 'axios';
// TODO: master add type export form second brain parser
import { Note } from 'second-brain-parser/dist/parser/models';

export interface Sdk {
  getNotes: (/* filters here*/) => Promise<{ data: Note[] }>; // Note type ere
}

export const buildSdk = (axios: AxiosInstance): Sdk => {
  return {
    getNotes: async (): Promise<{ data: Note[] }> => {
      const rspns = await axios.get<{ data: Note[] }>('/notes');
      return rspns.data;
    },
  };
};
