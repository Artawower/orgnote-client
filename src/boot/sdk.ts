import { AxiosInstance } from 'axios';
// TODO: master add type export form second brain parser
import {
  Note,
  NoteGraph,
  NotesFilter,
  Paginated,
  RawNote,
  Token,
  User,
} from 'src/models';
import { mapRawNoteToNote } from 'src/tools/note-mapper';

export type OAuthProvider = 'github' | 'google';

// TODO: replace with swagger codegen after swaggo has generic types
// TODO: master add generic for response datatype
export interface Sdk {
  getNotes: (filters?: NotesFilter) => Promise<Paginated<Note>>; // Note type ere
  getNote: (arg0: string) => Promise<Note>;
  login: (arg0: OAuthProvider) => Promise<{ data: { redirectUrl: string } }>;
  logout: (arg0: OAuthProvider) => Promise<void>;
  createToken: () => Promise<{ data: Token }>;
  deleteToken: (arg0: string) => Promise<void>;
  verifyUser: () => Promise<{ data: User }>;
  getApiTokens: () => Promise<{ data: Token[] }>;
  // TODO: add graph type
  getGraph: () => Promise<{ data: NoteGraph }>;
}

export const buildSdk = (axios: AxiosInstance): Sdk => {
  return {
    getNotes: async (notesFilter?: NotesFilter): Promise<Paginated<Note>> => {
      const rspns = await axios.get<Paginated<RawNote>>('/notes', {
        params: notesFilter,
      });
      return {
        ...rspns.data,
        data: rspns.data.data.map(mapRawNoteToNote),
      };
    },
    getNote: async (id: string): Promise<Note> => {
      const rspns = await axios.get<{ data: RawNote }>(`/notes/${id}`);
      return mapRawNoteToNote(rspns.data.data);
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
      await axios.get('/auth/logout', {
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
    async verifyUser(): Promise<{ data: User }> {
      const rspns = await axios.get('/auth/verify');
      return rspns.data;
    },
    async getApiTokens(): Promise<{ data: Token[] }> {
      const rspns = await axios.get<{ data: Token[] }>('/auth/api-tokens');
      return rspns.data;
    },
    async getGraph(): Promise<{ data: NoteGraph }> {
      const rspns = await axios.get('/notes/graph');
      return rspns.data;
    },
  };
};
