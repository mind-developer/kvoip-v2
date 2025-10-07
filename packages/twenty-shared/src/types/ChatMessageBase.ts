export type IMessage = {
  chatId: string;
  id?: string | null;
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

export type MessageInput = {
  integrationId: string;
  to: string;
  message?: string;
  fromMe?: boolean;
  personId: string;
};

export type MessageAgent = {
  name: string;
  id: string;
};

export type MessageSector = MessageAgent;
