import { TDateFirestore } from '@/chat/internal/types/chat';
import { MessageStatus } from '../call-center/types/MessageStatus';

export type WhatsappDocument = {
  integrationId: string;
  agent?: string;
  sector?: string;
  client: IClient;
  messages: IMessage[];
  status: statusEnum;
  lastMessage: IMessage;
  timeline: ITimeline[];
  unreadMessages: number;
  isVisible: boolean;
  personId: string;
};

export interface IClient {
  phone?: string;
  name?: string;
  ppUrl?: string;
}

export enum statusEnum {
  Resolved = 'Resolved',
  InProgress = 'InProgress',
  Waiting = 'Waiting',
  OnHold = 'OnHold',
  Pending = 'Pending',
}

export enum ChatStatus {
  Mine = 'mine',
  Unassigned = 'unassigned',
  Abandoned = 'abandoned',
}

export interface IMessage {
  id?: string;
  from: string;
  fromMe: boolean;
  message: string;
  createdAt: TDateFirestore;
  status: MessageStatus;
  type: string;
}

export interface ITimeline {
  agent: string | undefined;
  date: TDateFirestore;
  event: string;
  transferTo?: string;
}
