import Quill from 'quill';

const Inline = Quill.import('blots/inline');

const headlineClass = 'headline';

export class HeadlineBlot extends Inline {
  static create({ level }: { level: number }) {
    const node = super.create();

    if (!level) {
      return node;
    }

    const headlineTagLevel = level;
    node.classList.add(headlineClass);

    const headlineLevelClass = `text-h${headlineTagLevel}`;
    node.classList.add(headlineLevelClass);
    node.classList.add('headline');

    return node;
  }

  static formats(elem: HTMLElement) {
    return elem.classList.contains(headlineClass);
  }
}

HeadlineBlot.blotName = 'headline';
HeadlineBlot.tagName = 'span';
