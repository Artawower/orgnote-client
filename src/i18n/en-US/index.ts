import {
  LOADING_MESSAGE_1,
  LOADING_MESSAGE_2,
  LOADING_MESSAGE_3,
  LOADING_MESSAGE_4,
  LOADING_MESSAGE_5,
  SYSTEM,
  LANGUAGE,
  type I18NKeys,
  CLEAR_ALL_LOCAL_DATA,
  REMOVE_ACCOUNT,
  DELETE_ALL_NOTES,
} from 'orgnote-api';

const eng: { [key in I18NKeys]?: string } = {
  [LOADING_MESSAGE_1]: 'loading...',
  [LOADING_MESSAGE_2]: 'fetching data...',
  [LOADING_MESSAGE_3]: 'almost there...',
  [LOADING_MESSAGE_4]: 'compiling magic...',
  [LOADING_MESSAGE_5]: 'just a moment...',
  [SYSTEM]: 'system',
  [LANGUAGE]: 'language',
  [CLEAR_ALL_LOCAL_DATA]: 'clear all local data',
  [DELETE_ALL_NOTES]: 'delete all notes',
  [REMOVE_ACCOUNT]: 'remove account',
};

export default eng;
