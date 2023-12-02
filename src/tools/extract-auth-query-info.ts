import { PersonalInfo } from 'src/models';

export function extractAuthQueryInfo(
  query: Record<string, string>
): PersonalInfo {
  return {
    avatarUrl: query.avatarUrl,
    email: query.email,
    nickName: query.username,
    profileUrl: query.profileUrl,
    id: query.id,
    spaceLimit: +query.spaceLimit,
    usedSpace: +query.usedSpace,
    active: query.active,
  };
}
