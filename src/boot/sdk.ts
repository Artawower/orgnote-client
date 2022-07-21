import { AxiosInstance } from 'axios';
// TODO: master add type export form second brain parser
import { Note } from 'second-brain-parser/dist/parser/models';

export type OAuthProvider = 'github' | 'google';

export interface Sdk {
  getNotes: (/* filters here*/) => Promise<{ data: Note[] }>; // Note type ere
  getNote: (arg0: string) => Promise<{ data: Note }>;
  login: (arg0: OAuthProvider) => Promise<{ data: { redirectUrl: string } }>;
}

export const buildSdk = (axios: AxiosInstance): Sdk => {
  return {
    getNotes: async (): Promise<{ data: Note[] }> => {
      const rspns = await axios.get<{ data: Note[] }>('/notes');
      return rspns.data;
    },
    getNote: async (id: string): Promise<{ data: Note }> => {
      const rspns = await axios.get<{ data: Note }>(`/notes/${id}`);
      return rspns.data;
    },
    login: async (provider: OAuthProvider) => {
      const rspns = await axios.get('/auth/github/login', {
        params: {
          provider,
        },
      });
      return rspns.data;
    },
  };
};
