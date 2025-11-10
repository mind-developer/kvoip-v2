import { SendWhatsAppMessageInput } from 'src/engine/core-modules/meta/whatsapp/dtos/send-whatsapp-message.input';
import { SendWhatsAppMessageResponse } from 'src/engine/core-modules/meta/whatsapp/types/SendWhatsAppMessageResponse';

export enum ChatIntegrationProviders {
  WhatsApp = 'whatsApp',
  Messenger = 'messenger',
  Telegram = 'telegram',
}

export type ChatIntegrationSendMessageInput = {
  [ChatIntegrationProviders.WhatsApp]: Omit<
    SendWhatsAppMessageInput,
    'personId'
  > & {
    id?: string | null;
    personId?: string | undefined;
  };
  // [ChatIntegrationProviders.Messenger]: SendMessengerMessageInput;
  // [ChatIntegrationProviders.Telegram]: SendTelegramMessageInput;
};

export type ChatIntegrationSaveMessageInput = {
  [ChatIntegrationProviders.WhatsApp]: Omit<
    SendWhatsAppMessageInput,
    'personId'
  > & {
    id: string | null;
    fromMe: boolean;
    recipientPpUrl: string | null;
    personId?: string | undefined;
  };
  // [ChatIntegrationProviders.Messenger]: SendMessengerMessageInput;
  // [ChatIntegrationProviders.Telegram]: SendTelegramMessageInput;
};

export type ChatIntegrationSendMessageResponse = {
  [ChatIntegrationProviders.WhatsApp]: SendWhatsAppMessageResponse;
};
