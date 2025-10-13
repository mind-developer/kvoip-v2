import { Module } from '@nestjs/common';
import { ClientChatMessageController } from './client-chat-message.controller';
import { ClientChatMessageService } from './client-chat-message.service';

@Module({
  imports: [],
  providers: [ClientChatMessageService, ClientChatMessageController],
  exports: [ClientChatMessageService],
})
export class ClientChatMessageModule {}
