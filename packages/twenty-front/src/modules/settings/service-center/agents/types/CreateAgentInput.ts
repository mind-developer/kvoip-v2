export interface CreateAgentInput {
  isAdmin: boolean;
  isActive?: boolean;
  sectorId: string;
}

type InboxTarget = {
  inboxId: string;
  agentId: string;
};
