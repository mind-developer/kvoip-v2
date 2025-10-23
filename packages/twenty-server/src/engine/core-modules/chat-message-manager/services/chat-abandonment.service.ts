/* @kvoip-woulz proprietary */
import { Injectable, Logger } from '@nestjs/common';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ClientChatMessageService } from 'src/modules/client-chat-message/client-chat-message.service';

@Injectable()
export class ChatAbandonmentService {
  private readonly logger = new Logger(ChatAbandonmentService.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly clientChatMessageService: ClientChatMessageService,
    private readonly chatMessageManagerService: ChatMessageManagerService,
  ) {}

  async setChatAsAbandoned(
    chatId: string,
    workspaceId: string,
  ): Promise<void> {}
}
