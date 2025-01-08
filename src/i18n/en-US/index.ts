// This is just an example,
// so you can safely delete all default props below

import type { I18NKeys } from 'orgnote-api';

const eng: { [key in I18NKeys]: string } = {
  loadingMessage1: 'loading...',
  loadingMessage2: 'fetching data...',
  loadingMessage3: 'almost there...',
  loadingMessage4: 'compiling magic...',
  loadingMessage5: 'just a moment...',
};

export default eng;
