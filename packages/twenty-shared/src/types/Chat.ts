import { ClientChatMessage } from '@/types/ChatMessage';

export type ClientChat = {
  id: string;
  providerContactId: string;
  whatsappIntegrationId: string | null;
  messengerIntegrationId: string | null;
  telegramIntegrationId: string | null;
  agentId: string | null;
  sectorId: string | null;
  personId: string;
  person: {
    id: string;
    avatarUrl: string;
    firstName: string;
    lastName: string;
  };
  lastMessage: Partial<ClientChatMessage>;
  status: ClientChatStatus;
};

export type InternalChat = Omit<
  ClientChat,
  | 'whatsappIntegrationId'
  | 'messengerIntegrationId'
  | 'telegramIntegrationId'
  | 'agentId'
  | 'sectorId'
  | 'personId'
  | 'status'
  | 'providerContactId'
> & { internalChatTargets: { id: string }[] };

export enum ClientChatStatus {
  UNASSIGNED = 'UNASSIGNED',
  ASSIGNED_TO_AGENT = 'ASSIGNED_TO_AGENT',
  ASSIGNED_TO_SECTOR = 'ASSIGNED_TO_SECTOR',
  ABANDONED = 'ABANDONED',
  RESOLVED = 'RESOLVED',
  CHATBOT = 'CHATBOT',
}
