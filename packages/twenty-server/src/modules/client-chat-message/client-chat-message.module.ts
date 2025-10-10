import { Module } from '@nestjs/common';
import { ClientChatMessageService } from 'src/modules/client-chat-message/client-chat-message.service';

@Module({ imports: [], providers: [], exports: [ClientChatMessageService] })
export class ClientChatModule {}
