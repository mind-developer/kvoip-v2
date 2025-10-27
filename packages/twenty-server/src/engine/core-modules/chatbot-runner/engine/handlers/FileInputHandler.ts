import { Injectable } from '@nestjs/common';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { ClientChatMessageNoBaseFields } from 'src/engine/core-modules/chat-message-manager/types/ClientChatMessageNoBaseFields';
import {
  NodeHandler,
  ProcessParams,
} from 'src/engine/core-modules/chatbot-runner/types/NodeHandler';
import {
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
} from 'twenty-shared/types';

@Injectable()
export class FileInputHandler implements NodeHandler {
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
    const file =
      typeof node.data?.fileUrl === 'string' ? node.data.fileUrl : null;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (file) {
      const message: Omit<ClientChatMessageNoBaseFields, 'providerMessageId'> =
        {
          clientChatId: clientChat.id,
          from: chatbotName,
          fromType: ChatMessageFromType.CHATBOT,
          to: clientChat.providerContactId,
          toType: ChatMessageToType.PERSON,
          provider: provider,
          type: ChatMessageType.DOCUMENT,
          textBody: null,
          caption: (node.data?.caption as string) ?? null,
          deliveryStatus: ChatMessageDeliveryStatus.DELIVERED,
          edited: false,
          attachmentUrl: file,
          event: null,
          reactions: null,
          repliesTo: null,
          templateId: null,
          templateLanguage: null,
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
