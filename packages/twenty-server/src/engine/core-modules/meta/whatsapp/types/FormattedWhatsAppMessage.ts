import {
  ChatMessageDeliveryStatus,
  ChatMessageType,
} from 'twenty-shared/types';

export type FormattedWhatsAppMessage = {
  id: string;
  fromPhoneNumber: string;
  toPhoneNumber: string;
  fromMe: boolean;
  senderAvatarUrl: string | null;
  contactName: string | null;
  textBody: string;
  caption: string | null;
  type: ChatMessageType;
  deliveryStatus: ChatMessageDeliveryStatus;
  fileUrl: string | null;
};
