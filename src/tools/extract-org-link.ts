export function extractOrgLinkId(link: string): string {
  if (!link.startsWith('id:')) {
    return;
  }

  const linkId = link.slice(3);
  return linkId;
}

export function extractOrgLink(link: string): string {
  // TODO: master get URL from real router. Remove hardcode.
  const linkId = extractOrgLinkId(link);

  if (linkId) {
    return `${window.origin}/detail/${linkId}`;
  }

  return link;
}
