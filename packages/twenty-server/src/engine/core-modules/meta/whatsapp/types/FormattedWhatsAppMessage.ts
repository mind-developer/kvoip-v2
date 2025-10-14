import {
  ChatMessageDeliveryStatus,
  ChatMessageType,
} from 'twenty-shared/types';

export type FormattedWhatsAppMessage = {
  id: string;
  remoteJid: string;
  fromMe: boolean;
  senderAvatarUrl: string | null;
  contactName: string | null;
  textBody: string | null;
  caption: string | null;
  type: ChatMessageType;
  deliveryStatus: ChatMessageDeliveryStatus;
  fileUrl: string | null;
};
