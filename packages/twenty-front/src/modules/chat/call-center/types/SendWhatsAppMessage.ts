import { MessageType } from '@/chat/types/MessageType';

export interface SendWhatsAppMessageInputBase {
  integrationId: string;
  to: string;
  message?: string;
  type: MessageType;
  fileId?: string;
  fromMe?: boolean;
  personId: string;
}

export interface SendWhatsAppEventMessageInput
  extends SendWhatsAppMessageInputBase {
  eventStatus: MessageType;
  status: string;
  from: string;
  personId: string;
  agent?: {
    name?: string;
    id?: string;
  };
  sector?: {
    name?: string;
    id?: string;
  };
}

export interface SendWhatsAppMessageInput extends SendWhatsAppMessageInputBase {
  from: string;
}
