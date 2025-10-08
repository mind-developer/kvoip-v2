export enum ChatIntegrationProvider {
  WHATSAPP = 'whatsapp',
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
};

export type ChatIntegrationSendMessageResponse = {
  [ChatIntegrationProvider.WHATSAPP]: { id: string; providerMessageId: string };
};
