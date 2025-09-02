import { MessageType } from '@/chat/types/MessageType';

export interface SendMessageInputBase {
  integrationId: string;
  to: string;
  message?: string;
  type: MessageType;
  fileId?: string;
  fromMe?: boolean;
}

export interface SendEventMessageInput extends SendMessageInputBase {
  eventStatus: MessageType;
  status: string;
  from: string;
  agent?: {
    name?: string;
    id?: string;
  };
  sector?: {
    name?: string;
    id?: string;
  };
}

export interface SendMessageInput extends SendMessageInputBase {
  from: string;
}
