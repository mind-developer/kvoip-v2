import {
  ChatMessageDeliveryStatus,
  ChatMessageType,
} from 'twenty-shared/types';

export type FormattedWhatsAppMessage = {
  id: string;
  remoteJid: string;
  senderPhoneNumber: string | null;
  fromMe: boolean;
  senderAvatarUrl: string | null;
  contactName: string | null;
  textBody: string | null;
  caption: string | null;
  type: ChatMessageType;
  deliveryStatus: ChatMessageDeliveryStatus;
  attachmentUrl: string | null;
};
