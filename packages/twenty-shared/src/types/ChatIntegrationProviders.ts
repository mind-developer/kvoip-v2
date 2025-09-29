export enum ChatIntegrationProvider {
  WHATSAPP = 'whatsApp',
  MESSENGER = 'messenger',
  TELEGRAM = 'telegram',
}

export type ChatIntegrationSendMessageInput = {
  [ChatIntegrationProvider.WHATSAPP]: Omit<
    import('./WhatsAppTypes').SendWhatsAppMessageInput,
    'personId'
  > & {
    id?: string | null;
    personId?: string | undefined;
  };
  // [ChatIntegrationProvider.Messenger]: SendMessengerMessageInput;
  // [ChatIntegrationProvider.Telegram]: SendTelegramMessageInput;
};

export type ChatIntegrationSaveMessageInput = {
  [ChatIntegrationProvider.WHATSAPP]: Omit<
    import('./WhatsAppTypes').SendWhatsAppMessageInput,
    'personId'
  > & {
    id: string | null;
    fromMe: boolean;
    recipientPpUrl: string | null;
    personId?: string | undefined;
  };
  // [ChatIntegrationProvider.Messenger]: SendMessengerMessageInput;
  // [ChatIntegrationProvider.Telegram]: SendTelegramMessageInput;
};

export type ChatIntegrationSendMessageResponse = {
  [ChatIntegrationProvider.WHATSAPP]: import('./WhatsAppTypes').SendWhatsAppMessageResponse;
};
