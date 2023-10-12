import { ModelsPublicUser, ModelsUserPersonalInfo } from 'src/generated/api';

export interface User extends ModelsPublicUser {
  isAnonymous?: boolean;
}

export interface PersonalInfo extends ModelsUserPersonalInfo {
  isAnonymous?: boolean;
}
