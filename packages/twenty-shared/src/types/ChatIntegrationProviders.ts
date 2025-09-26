export enum ChatIntegrationProviders {
  WHATSAPP = 'whatsApp',
  MESSENGER = 'messenger',
  TELEGRAM = 'telegram',
}

export type ChatIntegrationSendMessageInput = {
  [ChatIntegrationProviders.WHATSAPP]: Omit<
    import('./WhatsAppTypes').SendWhatsAppMessageInput,
    'personId'
  > & {
    id?: string | null;
    personId?: string | undefined;
  };
  // [ChatIntegrationProviders.Messenger]: SendMessengerMessageInput;
  // [ChatIntegrationProviders.Telegram]: SendTelegramMessageInput;
};

export type ChatIntegrationSaveMessageInput = {
  [ChatIntegrationProviders.WHATSAPP]: Omit<
    import('./WhatsAppTypes').SendWhatsAppMessageInput,
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
  [ChatIntegrationProviders.WHATSAPP]: import('./WhatsAppTypes').SendWhatsAppMessageResponse;
};
