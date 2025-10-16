import { Injectable } from '@nestjs/common';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import {
  NodeHandler,
  ProcessParams,
} from 'src/engine/core-modules/chatbot-runner/types/NodeHandler';
import {
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChatMessage,
} from 'twenty-shared/types';

@Injectable()
export class ImageInputHandler implements NodeHandler {
  constructor(private chatMessageManagerService: ChatMessageManagerService) {}

  async process(params: ProcessParams): Promise<string | null> {
    const {
      node,
      providerIntegrationId,
      provider,
      clientChat,
      chatbotName,
      workspaceId,
    } = params;
    const image =
      typeof node.data?.imageUrl === 'string' ? node.data.imageUrl : null;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (image) {
      const message: Omit<ClientChatMessage, 'providerMessageId'> = {
        clientChatId: clientChat.id,
        from: chatbotName,
        fromType: ChatMessageFromType.CHATBOT,
        to: clientChat.person.id,
        toType: ChatMessageToType.PERSON,
        provider: provider,
        type: ChatMessageType.IMAGE,
        textBody: null,
        caption: null,
        deliveryStatus: ChatMessageDeliveryStatus.DELIVERED,
        edited: false,
        attachmentUrl: image,
        event: null,
      };
      this.chatMessageManagerService.sendMessage(
        message,
        workspaceId,
        providerIntegrationId,
      );

      const nextId = node.data?.outgoingNodeId;

      return typeof nextId === 'string' ? nextId : null;
    }
    return null;
  }
}
