export type Agent = {
  __typename?: 'Agent';
  isAdmin: boolean;
  isActive?: boolean;
  sectorId?: string;
};

export type CreateAgent = {
  __typename?: 'Agent';
  isAdmin: boolean;
  isActive: boolean;
  sectorId: string | null;
  workspaceMemberId: string | null;
  inboxId: string | null;
};
