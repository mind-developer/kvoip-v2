import { Logger, Scope } from '@nestjs/common';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ChatAbandonmentService } from '../services/chat-abandonment.service';

@Processor({
  queueName: MessageQueue.cronQueue,
  scope: Scope.DEFAULT,
})
export class ChatMessageManagerSetAbandonedCronJob {
  private hasRunOnce: boolean = false;
  private readonly logger = new Logger(
    ChatMessageManagerSetAbandonedCronJob.name,
  );

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
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

    // Cancel the scheduled abandonment job
    await this.messageQueueService.removeCron({
      jobName: 'ChatMessageManagerSetAbandonedCronJob',
      jobId: chatId,
    });
    await this.chatAbandonmentService.handleChatAbandonment(
      chatId,
      workspaceId,
    );

    this.logger.log(
      `Chat ${chatId} marked as abandoned and cron job cancelled`,
    );
  }
}
