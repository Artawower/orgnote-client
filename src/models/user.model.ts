import {
  ModelsPublicUser,
  ModelsUserPersonalInfo,
} from 'orgnote-api/remote-api';

export interface User extends ModelsPublicUser {
  isAnonymous?: boolean;
}

export interface PersonalInfo extends ModelsUserPersonalInfo {
  isAnonymous?: boolean;
}
