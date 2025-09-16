import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

export class ChatMessageManagerQueue {
  constructor(
    @InjectMessageQueue(MessageQueue.whatsappChatQueue)
    private queue: MessageQueueService,
    private readonly chatMessageManagerService: ChatMessageManagerService,
  ) {
    this.initWorker();
  }

  async initWorker() {
    // await this.queue.work(
    //   async ({ id, data }: { id: string; data: ChatMessageQueueData }) => {
    //     //will run whatsApp if chat.type is "whatsApp" or telegram() if chat.type is "telegram" and pass the corresponding data into it
    //     //if adding a new provider, make sure to add it to ChatIntegrationProviders enum.
    //     await this[data.chatType](data);
    //   },
    // );
  }

  // async whatsApp(data: ChatMessageQueueData) {
  //   const d: [SendWhatsAppMessageInput | SendWhatsAppTemplateInput, string] = [
  //     data.sendMessageInput,
  //     data.workspaceId,
  //   ];
  //   if (data.sendMessageInput.type !== 'template')
  //     await this.chatMessageManagerService.sendWhatsAppMessage(...d);
  //   await this.chatMessageManagerService.sendWhatsAppTemplate(
  //     ...(d as [SendWhatsAppTemplateInput, string]),
  //   );
  // }
}
