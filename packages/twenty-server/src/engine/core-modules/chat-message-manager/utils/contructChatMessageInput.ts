import {
  ClientChatMessageDeliveryStatusEnum,
  ClientChatMessageTypeEnum,
  ClientChatMessageWorkspaceEntity,
} from 'src/modules/client-chat-message/standard-objects/client-chat-message.workspace-entity';
import { ChatIntegrationSaveMessageInput } from 'twenty-shared/types';

export function constructChatMessageInput(
  input: ChatIntegrationSaveMessageInput['whatsapp'],
): Partial<ClientChatMessageWorkspaceEntity> {
  return {
    type: input.type as ClientChatMessageTypeEnum,
    textBody: input.message ?? null,
    caption: input.caption ?? null,
    attachmentUrl: input.fileId ?? null,
    toId: input.to,
    fromId: input.from,
    deliveryStatus: ClientChatMessageDeliveryStatusEnum.SENT,
    providerMessageId: input.id ?? '',
    edited: false,
    chatId: input.chatId,
  };
}
