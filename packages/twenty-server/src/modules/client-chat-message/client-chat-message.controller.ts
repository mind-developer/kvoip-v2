import { Args, Resolver, Subscription } from '@nestjs/graphql';
import { ClientChatMessageService } from './client-chat-message.service';
import { CllientChatEventDTO } from './dtos/on-chat-event.dto';
import { ClientMessageEventDTO } from './dtos/on-client-message-event.dto';

@Resolver()
export class ClientChatMessageController {
  constructor(
    private readonly clientChatMessageService: ClientChatMessageService,
  ) {}

  @Subscription(() => ClientMessageEventDTO, {
    filter: (payload, variables) => {
      return payload.chatId === variables.chatId;
    },
  })
  async onClientMessageEvent(
    @Args('chatId') chatId: string,
  ): Promise<AsyncIterator<ClientMessageEventDTO>> {
    const chatIdChannel = `client-message-${chatId}`;
    return this.clientChatMessageService.pubSub.asyncIterator(chatIdChannel);
  }

  @Subscription(() => CllientChatEventDTO, {
    filter: (payload, variables) => {
      return payload.sectorId === variables.sectorId;
    },
  })
  async onClientChatEvent(
    @Args('sectorId') sectorId: string,
  ): Promise<AsyncIterator<CllientChatEventDTO>> {
    const sectorIdChannel = `client-chat-${sectorId}`;
    return this.clientChatMessageService.pubSub.asyncIterator(sectorIdChannel);
  }
}
