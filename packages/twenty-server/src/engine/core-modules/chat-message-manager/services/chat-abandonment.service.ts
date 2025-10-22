/* @kvoip-woulz proprietary */
import { Injectable, Logger } from '@nestjs/common';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ClientChatMessageService } from 'src/modules/client-chat-message/client-chat-message.service';
import { ClientChatMessageWorkspaceEntity } from 'src/modules/client-chat-message/standard-objects/client-chat-message.workspace-entity';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';
import {
  ChatIntegrationProvider,
  ChatMessageDeliveryStatus,
  ChatMessageFromType,
  ChatMessageToType,
  ChatMessageType,
  ClientChatMessageEvent,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

@Injectable()
export class ChatAbandonmentService {
  private readonly logger = new Logger(ChatAbandonmentService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly clientChatMessageService: ClientChatMessageService,
    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async handleChatAbandonment(
    chatId: string,
    workspaceId: string,
  ): Promise<void> {
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

      this.clientChatMessageService.publishChatUpdated(
        clientChat,
        clientChat.sectorId,
      );

      // Create abandonment message
      const messageRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatMessageWorkspaceEntity>(
          workspaceId,
          'clientChatMessage',
          { shouldBypassPermissionChecks: true },
        );

      const abandonmentMessage = await messageRepository.save({
        clientChatId: chatId,
        event: ClientChatMessageEvent.ABANDONED,
        from: clientChat.agentId ?? '',
        fromType: ChatMessageFromType.AGENT,
        to: clientChat.sectorId ?? '',
        toType: ChatMessageToType.SECTOR,
        textBody: null,
        type: ChatMessageType.TEXT,
        attachmentUrl: null,
        caption: null,
        deliveryStatus: ChatMessageDeliveryStatus.SENT,
        edited: false,
        provider: clientChat.whatsappIntegrationId
          ? ChatIntegrationProvider.WHATSAPP
          : ChatIntegrationProvider.WHATSAPP,
        providerMessageId: v4(),
        createdAt: new Date().toISOString(),
      });

      // Publish the message
      this.clientChatMessageService.publishMessageCreated(
        abandonmentMessage,
        chatId,
      );

      this.logger.log(`Chat ${chatId} abandoned and message created`);

      // Cancel the scheduled abandonment job
      await this.messageQueueService.removeCron({
        jobName: 'ChatMessageManagerSetAbandonedCronJob',
        jobId: chatId,
      });
    } catch (error) {
      this.logger.error(
        `Error handling chat abandonment for ${chatId}:`,
        error,
      );
    }
  }
}
