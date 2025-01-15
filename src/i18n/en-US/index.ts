import {
  TXT_LOADING_MESSAGE_1,
  TXT_LOADING_MESSAGE_2,
  TXT_LOADING_MESSAGE_3,
  TXT_LOADING_MESSAGE_4,
  TXT_LOADING_MESSAGE_5,
  TXT_SYSTEM,
  TXT_LANGUAGE,
  type I18NKeys,
  TXT_CLEAR_ALL_LOCAL_DATA,
  TXT_REMOVE_ACCOUNT,
  TXT_DELETE_ALL_NOTES,
} from 'orgnote-api';

const eng: { [key in I18NKeys]?: string } = {
  [TXT_LOADING_MESSAGE_1]: 'loading...',
  [TXT_LOADING_MESSAGE_2]: 'fetching data...',
  [TXT_LOADING_MESSAGE_3]: 'almost there...',
  [TXT_LOADING_MESSAGE_4]: 'compiling TXT_magic...',
  [TXT_LOADING_MESSAGE_5]: 'just a moment...',
  [TXT_SYSTEM]: 'system',
  [TXT_LANGUAGE]: 'language',
  [TXT_CLEAR_ALL_LOCAL_DATA]: 'clear all local data',
  [TXT_DELETE_ALL_NOTES]: 'delete all notes',
  [TXT_REMOVE_ACCOUNT]: 'remove account',
};

export default eng;
