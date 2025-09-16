import {
  SendWhatsAppMessageInput,
  SendWhatsAppTemplateInput,
} from 'src/engine/core-modules/meta/whatsapp/dtos/send-whatsapp-message.input';

export enum ChatIntegrationProviders {
  WhatsApp = 'whatsApp',
  Messenger = 'messenger',
  Telegram = 'telegram',
}

export type ChatIntegrationSendMessageInput = {
  [ChatIntegrationProviders.WhatsApp]:
    | SendWhatsAppMessageInput
    | SendWhatsAppTemplateInput;
  // [ChatIntegrationProviders.Messenger]: SendMessengerMessageInput;
  // [ChatIntegrationProviders.Telegram]: SendTelegramMessageInput;
};
