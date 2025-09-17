import {
  SendWhatsAppMessageInput,
  SendWhatsAppTemplateInput,
} from 'src/engine/core-modules/meta/whatsapp/dtos/send-whatsapp-message.input';
import { SendWhatsAppMessageResponse } from 'src/engine/core-modules/meta/whatsapp/types/SendWhatsAppMessageResponse';

export enum ChatIntegrationProviders {
  WhatsApp = 'whatsApp',
  Messenger = 'messenger',
  Telegram = 'telegram',
}

export type ChatIntegrationSendMessageInput = {
  [ChatIntegrationProviders.WhatsApp]:
    | (SendWhatsAppMessageInput & { id?: string })
    | (SendWhatsAppTemplateInput & { id?: string });
  // [ChatIntegrationProviders.Messenger]: SendMessengerMessageInput;
  // [ChatIntegrationProviders.Telegram]: SendTelegramMessageInput;
};

export type ChatIntegrationSendMessageResponse = {
  [ChatIntegrationProviders.WhatsApp]: SendWhatsAppMessageResponse;
};
