import { Logger } from '@nestjs/common';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { SaveChatMessageJob } from 'src/engine/core-modules/chat-message-manager/jobs/chat-message-manager-save.job';
import { ChatIntegrationProviders } from 'src/engine/core-modules/chat-message-manager/types/integrationProviders';
import { SaveChatMessageJobData } from 'src/engine/core-modules/chat-message-manager/types/saveChatMessageJobData';
import { SendChatMessageQueueData } from 'src/engine/core-modules/chat-message-manager/types/sendChatMessageJobData';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import {
  SendWhatsAppMessageInput,
  SendWhatsAppTemplateInput,
} from 'src/engine/core-modules/meta/whatsapp/dtos/send-whatsapp-message.input';

@Processor(MessageQueue.chatMessageManagerSendMessageQueue)
export class SendChatMessageJob {
  protected readonly logger = new Logger(SendChatMessageJob.name);
  constructor(
    private readonly chatMessageManagerService: ChatMessageManagerService,
    @InjectMessageQueue(MessageQueue.chatMessageManagerSaveMessageQueue)
    private readonly saveMessageQueue: MessageQueueService,
  ) {}

  @Process(SendChatMessageJob.name)
  async handle(data: SendChatMessageQueueData): Promise<void> {
    await this[data.chatType](data);
  }

  async whatsApp(data: SendChatMessageQueueData) {
    console.log('sending', data.sendMessageInput.message);
    const d: [
      Omit<SendWhatsAppMessageInput | SendWhatsAppTemplateInput, 'personId'>,
      string,
    ] = [data.sendMessageInput, data.workspaceId];
    switch (data.sendMessageInput.type) {
      case 'template':
        const template =
          await this.chatMessageManagerService.sendWhatsAppTemplate(
            ...(d as [SendWhatsAppTemplateInput, string]),
          );
        break;
      //more cases here in the future if needed
      default:
        const response =
          await this.chatMessageManagerService.sendWhatsAppMessage(...d);
        if (response) {
          //message id is returned in response object
          this.logger.log(
            '(sendWhatsAppMessage): Sent message: ',
            JSON.stringify(data.sendMessageInput),
          );
          this.saveMessageQueue.add<SaveChatMessageJobData>(
            SaveChatMessageJob.name,
            {
              chatType: ChatIntegrationProviders.WhatsApp,
              saveMessageInput: {
                ...data.sendMessageInput,
                id: response.messages[0]?.id ?? null,
                fromMe: !!data.sendMessageInput.fromMe,
                recipientPpUrl: null,
              },
              workspaceId: data.workspaceId,
            },
          );
        }
    }
    return true;
  }
}
