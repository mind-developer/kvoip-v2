import { UseGuards } from '@nestjs/common';
import { Args, Field, Mutation, ObjectType, Resolver } from '@nestjs/graphql';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { SendClientChatMessageInput } from 'src/engine/core-modules/chat-message-manager/dtos/send-client-chat-message.input';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ClientChatMessageWorkspaceEntity } from 'src/modules/client-chat-message/standard-objects/client-chat-message.workspace-entity';

@Resolver(() => ClientChatMessageWorkspaceEntity)
export class ChatMessageManagerResolver {
  constructor(
    private readonly chatMessageManagerService: ChatMessageManagerService,
  ) {}
  @Mutation(() => SendClientChatMessageResponse)
  @UseGuards(WorkspaceAuthGuard, UserAuthGuard)
  async sendClientChatMessage(
    @Args('input')
    input: SendClientChatMessageInput,
  ) {
    return {
      messageId: await this.chatMessageManagerService.sendMessage(
        input,
        input.workspaceId,
        input.providerIntegrationId,
      ),
    };
  }
}

@ObjectType()
export class SendClientChatMessageResponse {
  @Field(() => String)
  messageId: string;
}
