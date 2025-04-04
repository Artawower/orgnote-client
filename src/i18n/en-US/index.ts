import { I18N } from 'orgnote-api';

const eng: { [key in I18N]?: string } = {
  [I18N.LOADING_MESSAGE_1]: 'loading...',
  [I18N.LOADING_MESSAGE_2]: 'fetching data...',
  [I18N.LOADING_MESSAGE_3]: 'almost there...',
  [I18N.LOADING_MESSAGE_4]: 'compiling magic...',
  [I18N.LOADING_MESSAGE_5]: 'just a moment...',
  [I18N.SYSTEM]: 'system',
  [I18N.LANGUAGE]: 'language',
  [I18N.CLEAR_ALL_LOCAL_DATA]: 'clear all local data',
  [I18N.DELETE_ALL_NOTES]: 'delete all notes',
  [I18N.REMOVE_ACCOUNT]: 'remove account',
};

export default eng;
