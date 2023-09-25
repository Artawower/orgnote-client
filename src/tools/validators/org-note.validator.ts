import { OrgNode } from 'org-mode-ast';

const requiredFields = ['id'];
export function getOrgNodeValidationErrors(orgTree: OrgNode): string[] {
  const errors = [];

  for (const field of requiredFields) {
    if (!orgTree.meta[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  if (!errors.length) {
    return;
  }

  return errors;
}
