import { Logger } from '@nestjs/common';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChatMessageEvent,
  ClientChatStatus,
} from 'twenty-shared/types';
import { v4 } from 'uuid';
import { ChatAbandonmentService } from '../services/chat-abandonment.service';

@Processor(MessageQueue.cronQueue)
export class ChatMessageManagerSetAbandonedCronJob {
  private hasRunOnce: boolean = false;
  private readonly runChats: Set<string> = new Set();
  private readonly logger = new Logger(
    ChatMessageManagerSetAbandonedCronJob.name,
  );

  constructor(
    private readonly chatAbandonmentService: ChatAbandonmentService,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly chatMessageManagerService: ChatMessageManagerService,
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
    if (!this.runChats.has(chatId)) {
      this.logger.error(
        'Skipping first run of chat message manager set abandoned cron job',
        { chatId, workspaceId },
      );
      this.logger.error(
        'this.chatMessageManagerService',
        this.chatMessageManagerService,
      );
      this.runChats.add(chatId);
      return;
    }
    this.logger.error('Setting chat as abandoned', { chatId, workspaceId });

    //skip next run for this chat
    this.runChats.delete(chatId);

    try {
      const clientChatRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatWorkspaceEntity>(
          workspaceId,
          'clientChat',
          { shouldBypassPermissionChecks: true },
        );

      const clientChat = await clientChatRepository.findOne({
        where: { id: chatId },
        relations: ['person'],
      });

      if (!clientChat) {
        this.logger.error(`Client chat ${chatId} not found for abandonment`);
        return;
      }
      clientChat.status = ClientChatStatus.ABANDONED;
      await this.chatMessageManagerService.updateChat(
        chatId,
        clientChat,
        workspaceId,
      );

      const abandonmentMessage = {
        clientChatId: chatId,
        event: ClientChatMessageEvent.ABANDONED,
        from: clientChat.sectorId ?? '',
        fromType: ChatMessageFromType.SECTOR,
        to: clientChat.agentId ?? '',
        toType: ChatMessageToType.AGENT,
        textBody: null,
        type: ChatMessageType.EVENT,
        attachmentUrl: null,
        caption: null,
        deliveryStatus: ChatMessageDeliveryStatus.SENT,
        edited: false,
        provider: clientChat.whatsappIntegrationId
          ? ChatIntegrationProvider.WHATSAPP
          : ChatIntegrationProvider.WHATSAPP,
        providerMessageId: v4(),
        createdAt: new Date().toISOString(),
      };

      this.chatMessageManagerService.saveMessage(abandonmentMessage, chatId);

      this.logger.log(`Chat ${chatId} abandoned and message created`);
      await this.messageQueueService.removeCron({
        jobName: ChatMessageManagerSetAbandonedCronJob.name,
        jobId: chatId,
      });
      if (!this.chatMessageManagerService.removeJobFromActiveCronJobs(chatId)) {
        this.logger.error(
          `Failed to remove chat ${chatId} from active cron jobs`,
        );
      } else {
        this.logger.log(`Chat ${chatId} removed from active cron jobs`);
      }

      this.logger.log(
        `Chat ${chatId} marked as abandoned and cron job cancelled`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling chat abandonment for ${chatId}:`,
        error,
      );
    }
  }
}
