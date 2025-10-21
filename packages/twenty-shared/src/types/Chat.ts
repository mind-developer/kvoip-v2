import { ChatIntegrationProvider } from '@/types/ChatIntegrationProviders';
import { ChatMessageType } from '@/types/ChatMessage';

export type ClientChat = {
  id: string;
  provider: ChatIntegrationProvider;
  providerContactId: string;
  whatsappIntegrationId: string | null;
  messengerIntegrationId: string | null;
  telegramIntegrationId: string | null;
  agentId: string | null;
  agent: {
    id: string;
  };
  sectorId: string | null;
  personId: string;
  person: {
    id: string;
    avatarUrl: string;
    name: {
      firstName: string;
      lastName: string;
    } | null;
  };
  lastMessageType: ChatMessageType;
  lastMessageDate: Date;
  lastMessagePreview: string | null;
  unreadMessagesCount: number;
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
  ASSIGNED = 'ASSIGNED',
  ABANDONED = 'ABANDONED',
  CANCELLED = 'CANCELLED',
  FINISHED = 'FINISHED',
  CHATBOT = 'CHATBOT',
}
