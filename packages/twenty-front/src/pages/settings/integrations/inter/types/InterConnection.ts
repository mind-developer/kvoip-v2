type IInterIntegration = {
  id: string;
  crtFileUrl: string;
  keyFileUrl: string;
  workspaceId: string;
  workspace: {
    id: string;
  };
};

export type UpdateInterIntegrationInput = Omit<
  IInterIntegration,
  'workspaceId' | 'workspace'
>;
