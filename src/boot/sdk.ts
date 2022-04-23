import { AxiosInstance } from 'axios';

export interface Sdk {
  getNotes: (/* filters here*/) => any; // Note type ere
}

export const buildSdk = (axios: AxiosInstance): Sdk => {
  return {
    getNotes: (): any => {
      return axios.get('/notes');
    },
  };
};
