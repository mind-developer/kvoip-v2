import {
  ChatIntegrationProvider,
  ChatMessageFromType,
  ChatMessageToType,
  ClientChatMessage,
} from 'twenty-shared/types';

import { FormattedWhatsAppMessage } from 'src/engine/core-modules/meta/whatsapp/types/WhatsAppMessage';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';

export const whatsAppMessageToClientChatMessage = (
  whatsappMessage: FormattedWhatsAppMessage,
  clientChat: ClientChatWorkspaceEntity,
): ClientChatMessage => {
  if (!clientChat.whatsappIntegration) {
    throw new Error(
      'This should never happen: client chat has no WhatsApp integration',
    );
  }
  return {
    chatId: clientChat.id,

    // If message is not coming from the client, this means the chat is assigned to an agent
    // (since you can't send messages unless you are assigned to a chat),
    // which is who sent it
    from: whatsappMessage.fromMe ? clientChat.agent!.id : clientChat.person.id,

    fromType: whatsappMessage.fromMe
      ? ChatMessageFromType.AGENT
      : ChatMessageFromType.PERSON,

    to: whatsappMessage.fromMe
      ? clientChat.person.id
      : (clientChat.agent?.id ??
        clientChat.sector?.id ??
        clientChat.whatsappIntegration!.id),
    toType: whatsappMessage.fromMe
      ? ChatMessageToType.PERSON
      : // Message is not fromMe: client is sending to an agent or sector
        // Chat has agent assigned: message goes to agent
        // Chat has sector but no agent assigned: message goes to sector
        // Chat has no agent or sector assigned: message falls back to provider integration (default inbox)
        clientChat.agent?.id
        ? ChatMessageToType.AGENT
        : clientChat.sector
          ? ChatMessageToType.SECTOR
          : ChatMessageToType.PROVIDER_INTEGRATION,

    provider: ChatIntegrationProvider.WHATSAPP,
    providerMessageId: whatsappMessage.id,
    type: whatsappMessage.type,
    textBody: whatsappMessage.textBody,
    caption: null, // TODO: IMPLEMENT
    attachmentUrl: whatsappMessage.fileUrl ?? null,
    deliveryStatus: whatsappMessage.deliveryStatus,
    edited: false,
    event: null,
  };
};
