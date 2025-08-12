import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export const transformCoreWorkspaceToWorkspaces = (workspace: Workspace) => ({
  coreWorkspaceId: workspace.id,
  name: workspace.displayName,
  ownerEmail: workspace.creatorEmail,
});
