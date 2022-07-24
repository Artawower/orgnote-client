import { AxiosInstance } from 'axios';
// TODO: master add type export form second brain parser
import { Note } from 'second-brain-parser/dist/parser/models';
import { Token, User } from 'src/models';

export type OAuthProvider = 'github' | 'google';

// TODO: master add generic for response datatype
export interface Sdk {
  getNotes: (/* filters here*/) => Promise<{ data: Note[] }>; // Note type ere
  getNote: (arg0: string) => Promise<{ data: Note }>;
  login: (arg0: OAuthProvider) => Promise<{ data: { redirectUrl: string } }>;
  logout: (arg0: OAuthProvider) => Promise<void>;
  createToken: () => Promise<{ data: Token }>;
  deleteToken: (arg0: string) => Promise<void>;
  verifyUser: () => Promise<{ data: { data: User } }>;
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
      const rspns = await axios.get(`/auth/${provider}/login`, {
        params: {
          provider,
        },
      });
      return rspns.data;
    },
    logout: async (provider: OAuthProvider) => {
      await axios.get(`/auth/logout`, {
        params: {
          provider,
        },
      });
    },
    async createToken(): Promise<{ data: Token }> {
      const rspns = await axios.post<{ data: Token }>('/auth/token');
      return rspns.data;
    },

    async deleteToken(tokenId: string): Promise<void> {
      await axios.delete('/auth/token', {
        data: {
          tokenId,
        },
      });
    },
    async verifyUser(): Promise<{ data: { data: User } }> {
      const rspns = await axios.get('/auth/verify');
      return rspns.data;
    },
  };
};
