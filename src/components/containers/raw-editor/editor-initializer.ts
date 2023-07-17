import Quill from 'quill';
import {
  headingSize,
  HeadlineBlot,
  InvisibleBlot,
  LinkBlot,
  textSize,
} from 'src/tools';
import hljs from 'highlight.js';

const allFontSizes = [...headingSize, ...textSize];

function registerEditorDependencies(): void {
  Quill.register(InvisibleBlot, true);
  Quill.register(HeadlineBlot, true);
  Quill.register(LinkBlot, true);

  const fontSizeStyle = Quill.import('attributors/style/size');
  fontSizeStyle.whitelist = allFontSizes;
  Quill.register(fontSizeStyle, true);
}
export function mountRawEditor(): Quill {
  registerEditorDependencies();
  const quill = new Quill('#editor', {
    theme: 'snow',
    formats: [
      'size',
      'bold',
      'color',
      'code',
      'code-block',
      'italic',
      'strike',
      InvisibleBlot.blotName,
      HeadlineBlot.blotName,
      LinkBlot.blotName,
    ],
    modules: {
      toolbar: false,
      syntax: {
        highlight: (text: string) => hljs.highlightAuto(text).value,
      },
    },
  });

  return quill;
}
