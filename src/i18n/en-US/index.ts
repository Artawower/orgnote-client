import {
  LOADING_MESSAGE_1,
  LOADING_MESSAGE_2,
  LOADING_MESSAGE_3,
  LOADING_MESSAGE_4,
  LOADING_MESSAGE_5,
  type I18NKeys,
} from 'orgnote-api';

const eng: { [key in I18NKeys]: string } = {
  [LOADING_MESSAGE_1]: 'loading...',
  [LOADING_MESSAGE_2]: 'fetching data...',
  [LOADING_MESSAGE_3]: 'almost there...',
  [LOADING_MESSAGE_4]: 'compiling magic...',
  [LOADING_MESSAGE_5]: 'just a moment...',
};

export default eng;
