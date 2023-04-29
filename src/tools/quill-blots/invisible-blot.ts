import Quill from 'quill';

const Inline = Quill.import('blots/inline');

export class InvisibleBlot extends Inline {
  static create() {
    const node = super.create();
    node.classList.add('invisible-symbol');
    return node;
  }

  static formats() {
    return true;
  }
}

InvisibleBlot.blotName = 'invisible';
InvisibleBlot.tagName = 'span';
