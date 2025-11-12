import { Logger, Scope } from '@nestjs/common';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { ChatMessageManagerSetAbandonedCronJobData } from 'src/engine/core-modules/chat-message-manager/types/ChatMessageManagerSetAbandonedCronJobData';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';

@Processor({ queueName: MessageQueue.cronQueue, scope: Scope.DEFAULT })
export class ChatMessageManagerSetAbandonedCronJob {
  private hasRunOnce = false;
  private readonly logger = new Logger(
    ChatMessageManagerSetAbandonedCronJob.name,
  );
  constructor(
    private readonly chatMessageManagerService: ChatMessageManagerService,
  ) {}

  @Process(ChatMessageManagerSetAbandonedCronJob.name)
  async handle({
    clientChatId,
    workspaceId,
  }: ChatMessageManagerSetAbandonedCronJobData) {
    if (!this.hasRunOnce) {
      this.hasRunOnce = true;
      this.logger.warn(
        'skipping first run of chat message manager set abandoned cron job',
      );
      return;
    }
    this.chatMessageManagerService.executeAbandonment(
      clientChatId,
      workspaceId,
    );
    this.logger.warn(`Chat ${clientChatId} marked as abandoned`);
  }
}
