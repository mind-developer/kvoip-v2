import { Logger } from '@nestjs/common';
import { SaveClientChatMessageJobData } from 'src/engine/core-modules/chat-message-manager/types/saveChatMessageJobData';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ClientChatMessageWorkspaceEntity } from 'src/modules/client-chat-message/standard-objects/client-chat-message.workspace-entity';
import { ChatMessageType } from 'twenty-shared/types';

@Processor(MessageQueue.chatMessageManagerSaveMessageQueue)
export class SaveClientChatMessageJob {
  protected readonly logger = new Logger(SaveClientChatMessageJob.name);
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  @Process(SaveClientChatMessageJob.name)
  async handle(data: SaveClientChatMessageJobData): Promise<void> {
    await this[data.chatMessage.provider](data);
  }

  async whatsapp(data: SaveClientChatMessageJobData) {
    switch (data.chatMessage.type) {
      case ChatMessageType.TEMPLATE:
        //TODO: IMPLEMENT
        break;
      //more cases here in the future if needed
      default:
        await (console.log(data.chatMessage),
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatMessageWorkspaceEntity>(
          data.workspaceId,
          'clientChatMessage',
        )).save(data.chatMessage);
        return true;
    }
    return false;
  }

  async messenger(data: SaveClientChatMessageJobData) {
    //TODO: IMPLEMENT
  }

  async telegram(data: SaveClientChatMessageJobData) {
    //TODO: IMPLEMENT
  }
}
