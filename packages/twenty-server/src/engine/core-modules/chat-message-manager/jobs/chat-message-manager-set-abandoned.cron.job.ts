import { Logger } from '@nestjs/common';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { ChatAbandonmentService } from '../services/chat-abandonment.service';

@Processor(MessageQueue.cronQueue)
export class ChatMessageManagerSetAbandonedCronJob {
  private hasRunOnce: boolean = false;
  private readonly logger = new Logger(
    ChatMessageManagerSetAbandonedCronJob.name,
  );

  constructor(
    private readonly chatAbandonmentService: ChatAbandonmentService,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  @Process(ChatMessageManagerSetAbandonedCronJob.name)
  async handle({
    chatId,
    workspaceId,
  }: {
    chatId: string;
    workspaceId: string;
  }) {
    //skip first run
    if (!this.hasRunOnce) {
      this.hasRunOnce = true;
      return;
    }

    await this.chatAbandonmentService.handleChatAbandonment(
      chatId,
      workspaceId,
    );
    // Cancel the scheduled abandonment job
    await this.messageQueueService.removeCron({
      jobName: 'ChatMessageManagerSetAbandonedCronJob',
      jobId: chatId,
    });

    this.logger.log(
      `Chat ${chatId} marked as abandoned and cron job cancelled`,
    );
  }
}
