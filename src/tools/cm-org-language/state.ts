import { StateEffect, StateField } from '@codemirror/state';
import { OrgNode } from 'org-mode-ast';

// TODO: master doesn't work. Check why.
const OrgUpdatedEffect = StateEffect.define<OrgNode>();

const orgNodeField = StateField.define<OrgNode>({
  create() {
    return null;
  },

  update(orgNode, transaction) {
    transaction.effects.forEach((effect) => {
      if (effect.is(OrgUpdatedEffect)) {
        orgNode = effect.value;
      }
    });
    return orgNode;
  },
});

export { orgNodeField, OrgUpdatedEffect };
