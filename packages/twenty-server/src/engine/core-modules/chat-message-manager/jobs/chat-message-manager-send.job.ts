import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { ChatMessageQueueData } from 'src/engine/core-modules/chat-message-manager/types/chatMessageQueueData';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor(MessageQueue.whatsappChatQueue)
export class SendMessageJob {
  constructor(
    private readonly chatMessageManagerService: ChatMessageManagerService,
  ) {}

  @Process(SendMessageJob.name)
  async handle(data: ChatMessageQueueData): Promise<void> {
    console.log(data);
  }
}
