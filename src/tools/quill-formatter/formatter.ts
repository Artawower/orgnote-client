import Quill from 'quill';

export const clearQuillFormat = (quill: Quill): void => {
  quill.removeFormat(0, quill.getLength() - 1, 'api');
};
