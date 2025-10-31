export type Agent = {
  __typename: 'Agent';
  id: string;
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
  inboxes: string[] | null;
};
