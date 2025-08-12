import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export const transformWorkspaceMemberToOwner = (
  member: WorkspaceMemberWorkspaceEntity,
) => ({
  name: member.name,
  phone: member.userPhone?.primaryPhoneNumber,
  phones: member.userPhone,
  avatarUrl: member.avatarUrl,
  userId: member.userId,
});
