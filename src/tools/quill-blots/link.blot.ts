import Quill from 'quill';
import { NodeType, OrgNode } from 'org-mode-ast';

const Link = Quill.import('formats/link');

const linkClass = 'link';

export class LinkBlot extends Link {
  static create({ orgNode }: { orgNode: OrgNode }): unknown {
    const node = super.create();

    if (orgNode.prev.is(NodeType.LinkUrl)) {
      node.setAttribute('href', orgNode.prev?.children.get(1).value);
    }
    node.setAttribute('target', '_blank');
    node.classList.add(linkClass);

    return node;
  }

  static formats(elem: HTMLElement) {
    return elem.classList.contains(linkClass);
  }
}

LinkBlot.blotName = 'link';
LinkBlot.tagName = 'a';
