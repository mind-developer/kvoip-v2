import { Injectable } from '@nestjs/common';
import { SendChatMessageJob } from 'src/engine/core-modules/chat-message-manager/jobs/chat-message-manager-send.job';
import { SendChatMessageQueueData } from 'src/engine/core-modules/chat-message-manager/types/sendChatMessageJobData';
import { MessageTypes } from 'src/engine/core-modules/chatbot-runner/types/MessageTypes';
import {
  NodeHandler,
  ProcessParams,
} from 'src/engine/core-modules/chatbot-runner/types/NodeHandler';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ChatIntegrationProviders } from 'twenty-shared/types';

@Injectable()
export class FileInputHandler implements NodeHandler {
  constructor(
    @InjectMessageQueue(MessageQueue.chatMessageManagerSendMessageQueue)
    private sendChatMessageQueue: MessageQueueService,
  ) {}

  async process(params: ProcessParams): Promise<string | null> {
    const { node, integrationId, sendTo, chatbotName, workspaceId } = params;

    const file =
      typeof node.data?.fileUrl === 'string' ? node.data.fileUrl : null;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (file) {
      const message = {
        integrationId: integrationId,
        to: sendTo,
        type: MessageTypes.DOCUMENT,
        fileId: file,
        from: chatbotName,
        fromMe: true,
      };
      console.log('sending', message.fileId);
      this.sendChatMessageQueue.add<SendChatMessageQueueData>(
        SendChatMessageJob.name,
        {
          chatType: ChatIntegrationProviders.WHATSAPP,
          sendMessageInput: message,
          workspaceId,
        },
      );
    }

    const nextId = node.data?.outgoingNodeId;

    return typeof nextId === 'string' ? nextId : null;
  }
}
