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
export class TextInputHandler implements NodeHandler {
  constructor(private chatMessageManagerService: ChatMessageManagerService) {}

  async process(params: ProcessParams): Promise<string | null> {
    const {
      node,
      providerIntegrationId,
      provider,
      chatbotName,
      workspaceId,
      clientChat,
    } = params;
    const text = typeof node.data?.text === 'string' ? node.data.text : null;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (text) {
      const formattedText = text.replace(/\n{2,}/g, '\n\n').trim();
      const message: Omit<ClientChatMessageNoBaseFields, 'providerMessageId'> =
        {
          clientChatId: clientChat.id,
          from: chatbotName,
          fromType: ChatMessageFromType.CHATBOT,
          to: clientChat.person.id,
          toType: ChatMessageToType.PERSON,
          provider: provider,
          type: ChatMessageType.TEXT,
          textBody: formattedText,
          caption: null,
          deliveryStatus: ChatMessageDeliveryStatus.DELIVERED,
          edited: false,
          attachmentUrl: null,
          event: null,
          reactions: null,
          repliesTo: null,
          templateId: null,
          templateLanguage: null,
        };
      console.log('text input handler sending message', message);
      this.chatMessageManagerService.sendMessage(
        message,
        workspaceId,
        providerIntegrationId,
      );
    }

    const nextId = node.data?.outgoingNodeId;

    return typeof nextId === 'string' ? nextId : null;
  }
}
