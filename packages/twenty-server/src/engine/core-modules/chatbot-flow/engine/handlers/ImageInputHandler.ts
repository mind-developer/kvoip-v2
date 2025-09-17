import { Injectable } from '@nestjs/common';
import { ChatIntegrationProviders } from 'src/engine/core-modules/chat-message-manager/types/integrationProviders';
import { SendChatMessageQueueData } from 'src/engine/core-modules/chat-message-manager/types/sendChatMessageJobData';
import { MessageTypes } from 'src/engine/core-modules/chatbot-flow/types/MessageTypes';
import {
  NodeHandler,
  ProcessParams,
} from 'src/engine/core-modules/chatbot-flow/types/NodeHandler';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { SendChatMessageJob } from '../../../chat-message-manager/jobs/chat-message-manager-send.job';

@Injectable()
export class ImageInputHandler implements NodeHandler {
  constructor(
    @InjectMessageQueue(MessageQueue.chatMessageManagerSaveMessageQueue)
    private sendChatMessageQueue: MessageQueueService,
  ) {}

  async process(params: ProcessParams): Promise<string | null> {
    const { node, integrationId, sendTo, chatbotName, personId, workspaceId } =
      params;
    const image =
      typeof node.data?.imageUrl === 'string' ? node.data.imageUrl : null;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (image) {
      const message = {
        integrationId,
        to: sendTo,
        type: MessageTypes.IMAGE,
        fileId: image,
        from: chatbotName,
        fromMe: true,
        personId: personId,
      };
      this.sendChatMessageQueue.add<SendChatMessageQueueData>(
        SendChatMessageJob.name,
        {
          chatType: ChatIntegrationProviders.WhatsApp,
          sendMessageInput: message,
          workspaceId,
        },
      );

      const nextId = node.data?.outgoingNodeId;

      return typeof nextId === 'string' ? nextId : null;
    }
    return null;
  }
}
