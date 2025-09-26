import type { IMessage, MessageAgent, MessageInput, MessageSector } from './ChatMessageBase';

export interface SendWhatsAppMessageInput extends MessageInput {
  type: string;
  fileId?: string;
  from: string;
}

export interface SendWhatsAppEventMessageInput extends MessageInput {
  eventStatus: string;
  status: string;
  from: string;
  type: string;
  agent?: MessageAgent;
  sector?: MessageSector;
}

export interface SendWhatsAppTemplateInput {
  integrationId: string;
  to: string;
  from: string;
  type: string;
  templateName: string;
  language: string;
  message: string;
  agent?: MessageAgent;
  personId: string;
}

export type SendWhatsAppMessageResponse = Partial<SendWhatsAppMessageInput> & {
  messages: Partial<IMessage[]>;
};


