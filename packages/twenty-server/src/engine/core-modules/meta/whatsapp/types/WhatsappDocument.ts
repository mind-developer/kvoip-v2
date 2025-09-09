import { statusEnum } from 'src/engine/core-modules/meta/types/statusEnum';

export type WhatsappDocument = {
  integrationId: string;
  workspaceId?: string;
  agent?: string;
  sector?: string;
  client: IClient; //deprecate
  personId: string;
  messages: IMessage[];
  status: statusEnum;
  lastMessage: IMessage;
  timeline: ITimeline[];
  unreadMessages: number;
  isVisible: boolean;
};

type IClient = {
  phone: string;
  name?: string;
  ppUrl?: string | null;
};

export type IMessage = {
  id?: string;
  from: string;
  message: string;
  createdAt: Date;
  type: string;
  sent?: boolean;
  received?: boolean;
  read?: boolean;
  edited?: boolean;
  fromMe?: boolean;
};

type ITimeline = {
  agent: string;
  date: Date;
  event: string;
  transferTo?: string;
};
