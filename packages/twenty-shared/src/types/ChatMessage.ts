import { ChatIntegrationProvider } from '@/types/ChatIntegrationProviders';

export type ChatMessage = {
  from: string; //done
  fromType: ChatMessageFromType; //done
  to: string; //done
  toType: ChatMessageToType; //done
  provider: ChatIntegrationProvider; //done
  providerMessageId: string; //done
  type: ChatMessageType; //done
  textBody: string | null; //done
  caption: string | null; //done;
  deliveryStatus: ChatMessageDeliveryStatus; //done
  edited: boolean | null; //done
  attachmentUrl: string | null; //done
  createdAt?: string; // ISO string timestamp
  updatedAt?: string; // ISO string timestamp
  reactions: Reaction[] | null;
  repliesTo: string | null;
};

export type Reaction = {
  reaction: string;
  from: string;
  fromType: ChatMessageFromType;
  to: string;
  toType: ChatMessageToType;
};

export type InternalChatMessage = Omit<
  ChatMessage,
  'chatId' | 'fromType' | 'toType' | 'provider' | 'providerMessageId' | 'event'
> & { internalChatId: string };

export type ClientChatMessage = ChatMessage & {
  clientChatId: string;
  event: ClientChatMessageEvent | null;
};

export enum ChatMessageFromType {
  //a client sent a message
  PERSON = 'PERSON',
  //an agent sent a message
  AGENT = 'AGENT',
  //a sector sent a message
  SECTOR = 'SECTOR',
  //a workspace member sent a message (internal chats only)
  WORKSPACE_MEMBER = 'WORKSPACE_MEMBER',
  //a chatbot sent a message
  CHATBOT = 'CHATBOT',
  //a message was sent directly through the integration (e.g. WhatsApp on mobile, Telegram, etc.)
  PROVIDER_INTEGRATION = 'PROVIDER_INTEGRATION',
}

export enum ChatMessageToType {
  PERSON = 'PERSON',
  AGENT = 'AGENT',
  SECTOR = 'SECTOR',
  PROVIDER_INTEGRATION = 'PROVIDER_INTEGRATION',
  WORKSPACE_MEMBER = 'WORKSPACE_MEMBER',
}
export enum ChatMessageType {
  TEXT = 'TEXT',
  TEMPLATE = 'TEMPLATE',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
  STICKER = 'STICKER',
  EVENT = 'EVENT',
}
export enum ChatMessageDeliveryStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}
export enum ClientChatMessageEvent {
  CHATBOT_START = 'CHATBOT_START',
  CHATBOT_END = 'CHATBOT_END',

  START = 'START',
  END = 'END',
  ABANDONED = 'ABANDONED',

  TRANSFER_TO_AGENT = 'TRANSFER_TO_AGENT',
  TRANSFER_TO_SECTOR = 'TRANSFER_TO_SECTOR',

  ONHOLD = 'ONHOLD',
}
