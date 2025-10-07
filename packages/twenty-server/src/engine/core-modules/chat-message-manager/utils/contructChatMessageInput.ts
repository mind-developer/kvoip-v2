import {
  ClientChatMessageDeliveryStatusEnum,
  ClientChatMessageTypeEnum,
  ClientChatMessageWorkspaceEntity,
} from 'src/modules/chat-message/standard-objects/chat-message.workspace-entity';
import { ChatIntegrationSaveMessageInput } from 'twenty-shared/types';

export function constructChatMessageInput(
  input: ChatIntegrationSaveMessageInput['whatsapp'],
): Partial<ClientChatMessageWorkspaceEntity> {
  return {
    type: input.type as ClientChatMessageTypeEnum,
    textBody: input.message ?? null,
    caption: input.caption ?? null,
    attachmentUrl: input.fileId ?? null,
    to: input.to,
    from: input.from,
    deliveryStatus: ClientChatMessageDeliveryStatusEnum.SENT,
    providerMessageId: input.id ?? '',
    edited: false,
    chatId: input.chatId,
  };
}
