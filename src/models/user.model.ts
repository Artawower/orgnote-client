import { ModelsPublicUser } from 'src/generated/api';

export interface User extends ModelsPublicUser {
  isAnonymous?: boolean;
}
