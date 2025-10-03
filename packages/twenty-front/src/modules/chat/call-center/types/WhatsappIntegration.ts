type IWhatsappIntegration = {
  id: string;
  name: string;
  phoneId: string;
  businessAccountId: string;
  accessToken: string;
  appId: string;
  appKey: string;
  disabled: boolean;
  sla: number;
  apiType: string;
  inboxId?: string; // Deprecated: use inbox relation instead
  inbox?: Array<{ id: string; name: string }>;
};

export type CreateWhatsappIntegrationInput = Omit<
  IWhatsappIntegration,
  'id' | 'workspaceId' | 'disabled' | 'workspace' | 'sla'
>;

export type FindWhatsappIntegration = Omit<IWhatsappIntegration, 'workspaceId'>;

export type WhatsappIntegration = Omit<
  IWhatsappIntegration,
  'workspaceId' | 'workspace'
>;

export type UpdateWhatsappIntegrationInput = Omit<
  IWhatsappIntegration,
  'disabled' | 'workspaceId' | 'workspace'
>;
