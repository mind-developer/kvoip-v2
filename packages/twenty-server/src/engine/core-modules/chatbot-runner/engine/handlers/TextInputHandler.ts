import { Injectable } from '@nestjs/common';
import { SendChatMessageQueueData } from 'src/engine/core-modules/chat-message-manager/types/sendChatMessageJobData';
import { MessageTypes } from 'src/engine/core-modules/chatbot-runner/types/MessageTypes';
import {
  NodeHandler,
  ProcessParams,
} from 'src/engine/core-modules/chatbot-runner/types/NodeHandler';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ChatIntegrationProvider } from 'twenty-shared/types';
import { SendChatMessageJob } from '../../../chat-message-manager/jobs/chat-message-manager-send.job';

@Injectable()
export class TextInputHandler implements NodeHandler {
  constructor(
    @InjectMessageQueue(MessageQueue.chatMessageManagerSendMessageQueue)
    private sendChatMessageQueue: MessageQueueService,
  ) {}

  async process(params: ProcessParams): Promise<string | null> {
    const { node, integrationId, sendTo, chatbotName, workspaceId } = params;
    const text = typeof node.data?.text === 'string' ? node.data.text : null;

    // eslint-disable-next-line @nx/workspace-explicit-boolean-predicates-in-if
    if (text) {
      const formattedText = text.replace(/\n{2,}/g, '\n\n').trim();
      const message = {
        integrationId: integrationId,
        to: sendTo,
        type: MessageTypes.TEXT,
        message: formattedText,
        from: chatbotName,
        fromMe: true,
      };
      console.log('sending', message.message);
      this.sendChatMessageQueue.add<SendChatMessageQueueData>(
        SendChatMessageJob.name,
        {
          chatType: ChatIntegrationProvider.WHATSAPP,
          sendMessageInput: message,
          workspaceId,
        },
      );
    }

    const nextId = node.data?.outgoingNodeId;

    return typeof nextId === 'string' ? nextId : null;
  }
}
