import { Logger } from '@nestjs/common';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { SaveClientChatMessageJob } from 'src/engine/core-modules/chat-message-manager/jobs/chat-message-manager-save.job';
import { SaveClientChatMessageJobData } from 'src/engine/core-modules/chat-message-manager/types/saveChatMessageJobData';
import { SendChatMessageQueueData } from 'src/engine/core-modules/chat-message-manager/types/sendChatMessageJobData';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ClientChatMessageService } from 'src/modules/client-chat-message/client-chat-message.service';
import { ChatMessageType } from 'twenty-shared/types';

@Processor(MessageQueue.chatMessageManagerSendMessageQueue)
export class SendChatMessageJob {
  protected readonly logger = new Logger(SendChatMessageJob.name);
  constructor(
    private readonly chatMessageManagerService: ChatMessageManagerService,
    @InjectMessageQueue(MessageQueue.chatMessageManagerSaveMessageQueue)
    private readonly saveMessageQueue: MessageQueueService,
    private readonly clientChatMessageService: ClientChatMessageService,
  ) {}

  @Process(SendChatMessageJob.name)
  async handle(data: SendChatMessageQueueData): Promise<void> {
    await this[data.clientChatMessage.provider](data);
  }

  async whatsapp(data: SendChatMessageQueueData) {
    switch (data.clientChatMessage.type) {
      case ChatMessageType.TEMPLATE:
        //TODO: IMPLEMENT
        break;
      //more cases here in the future if needed
      default:
        const response = await this.chatMessageManagerService.sendMessage(
          data.clientChatMessage,
          data.providerIntegrationId,
          data.workspaceId,
        );
        if (response) {
          //message id is returned in response object
          await this.clientChatMessageService.publishMessageCreated(
            {
              ...data.clientChatMessage,
              providerMessageId: response,
            },
            data.clientChatMessage.clientChatId,
          );
          this.saveMessageQueue.add<SaveClientChatMessageJobData>(
            SaveClientChatMessageJob.name,
            {
              chatMessage: {
                ...data.clientChatMessage,
                providerMessageId: response,
              },
              workspaceId: data.workspaceId,
            },
          );
        }
    }
    return true;
  }
  async messenger(data: SendChatMessageQueueData) {
    //TODO: IMPLEMENT
  }
  async telegram(data: SendChatMessageQueueData) {
    //TODO: IMPLEMENT
  }
}
