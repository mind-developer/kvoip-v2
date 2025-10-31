import { Injectable } from '@nestjs/common';
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
import { SendChatMessageJob } from '../../../chat-message-manager/jobs/chat-message-manager-send.job';

@Injectable()
export class ImageInputHandler implements NodeHandler {
  constructor(
    @InjectMessageQueue(MessageQueue.chatMessageManagerSendMessageQueue)
    private sendChatMessageQueue: MessageQueueService,
  ) {}

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
      this.sendChatMessageQueue.add<SendChatMessageQueueData>(
        SendChatMessageJob.name,
        {
          clientChatMessage: message,
          providerIntegrationId,
          workspaceId,
        },
      );

      const nextId = node.data?.outgoingNodeId;

      return typeof nextId === 'string' ? nextId : null;
    }
    return null;
  }
}
