import { Injectable } from '@nestjs/common';
import { SendChatMessageJob } from 'src/engine/core-modules/chat-message-manager/jobs/chat-message-manager-send.job';
import { SendChatMessageQueueData } from 'src/engine/core-modules/chat-message-manager/types/sendChatMessageJobData';
import {
  NodeHandler,
  ProcessParams,
} from 'src/engine/core-modules/chatbot-runner/types/NodeHandler';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChatMessage,
} from 'twenty-shared/types';

@Injectable()
export class TextInputHandler implements NodeHandler {
  constructor(
    @InjectMessageQueue(MessageQueue.chatMessageManagerSendMessageQueue)
    private sendClientChatMessageQueue: MessageQueueService,
  ) {}

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
      const message: Omit<ClientChatMessage, 'providerMessageId'> = {
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
      };
      this.sendClientChatMessageQueue.add<SendChatMessageQueueData>(
        SendChatMessageJob.name,
        {
          clientChatMessage: message,
          providerIntegrationId,
          workspaceId,
        },
      );
    }

    const nextId = node.data?.outgoingNodeId;

    return typeof nextId === 'string' ? nextId : null;
  }
}
