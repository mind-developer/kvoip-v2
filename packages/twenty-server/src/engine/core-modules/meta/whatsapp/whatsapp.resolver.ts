/* eslint-disable @nx/workspace-graphql-resolvers-should-be-guarded */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { SendMessageJob } from 'src/engine/core-modules/chat-message-manager/jobs/chat-message-manager-send.job';
import { ChatMessageQueueData } from 'src/engine/core-modules/chat-message-manager/types/chatMessageQueueData';
import { ChatIntegrationProviders } from 'src/engine/core-modules/chat-message-manager/types/integrationProviders';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { statusEnum } from 'src/engine/core-modules/meta/types/statusEnum';
import {
  SendEventMessageInput,
  SendWhatsAppMessageInput,
  SendWhatsAppTemplateInput,
} from 'src/engine/core-modules/meta/whatsapp/dtos/send-whatsapp-message.input';
import { UpdateWhatsAppMessageDataInput } from 'src/engine/core-modules/meta/whatsapp/dtos/update-whatsapp-message-data-input';
import { WhatsappDocument } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';
import { WhatsappTemplatesResponse } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappTemplate';
import { WhatsappService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';

@Resolver('Whatsapp')
export class WhatsappResolver {
  constructor(
    private readonly chatMessageManagerService: ChatMessageManagerService,
    private readonly whatsappService: WhatsappService,
    @InjectMessageQueue(MessageQueue.whatsappChatQueue)
    private chatMessageManagerQueue: MessageQueueService,
  ) {}

  @Mutation(() => Boolean)
  async sendWhatsAppTemplate(
    @Args('sendWhatsAppTemplateInput')
    sendWhatsAppTemplateInput: SendWhatsAppTemplateInput,
    @AuthWorkspace() workspace: Workspace,
  ) {
    const sendTemplateConfirmation =
      await this.chatMessageManagerService.sendWhatsAppTemplate(
        sendWhatsAppTemplateInput,
        workspace.id,
      );

    if (sendTemplateConfirmation) {
      const today = new Date();
      const messageEvent = `${sendWhatsAppTemplateInput.agent?.name} started the service (${today.toISOString().split('T')[0].replace(/-/g, '/')} - ${today.getHours()}:${(today.getMinutes() < 10 ? '0' : '') + today.getMinutes()})`;

      const lastMessage = {
        createdAt: today,
        from: 'system',
        message: sendWhatsAppTemplateInput.message,
        type: 'template',
      };

      const timeline = {
        agent: `${sendWhatsAppTemplateInput.agent?.name}`,
        date: today,
        event: 'started',
      };

      const whatsappIntegration: Omit<
        WhatsappDocument,
        'unreadMessages' | 'isVisible'
      > = {
        integrationId: sendWhatsAppTemplateInput.integrationId,
        client: {
          phone: sendWhatsAppTemplateInput.to.slice(1),
          name: sendWhatsAppTemplateInput.to.slice(1),
        },
        personId: sendWhatsAppTemplateInput.personId,
        messages: [
          {
            ...lastMessage,
          },
        ],
        status: statusEnum.InProgress,
        timeline: [timeline],
        agent: sendWhatsAppTemplateInput.agent?.id,
        sector: 'empty',
        lastMessage,
      };

      await this.whatsappService.saveMessageAtFirebase(
        whatsappIntegration,
        false,
        workspace.id,
      );

      return await this.whatsappService.saveEventMessageAtFirebase({
        ...whatsappIntegration,
        messages: [
          {
            ...lastMessage,
            message: messageEvent,
            type: 'started',
          },
        ],
      });
    }

    return false;
  }

  @Mutation(() => Boolean)
  async sendWhatsAppMessage(
    @Args('sendWhatsAppMessageInput')
    sendWhatsAppMessageInput: SendWhatsAppMessageInput,
    @AuthWorkspace() workspace: Workspace,
  ) {
    // this.chatMessageManagerService.sendWhatsAppMessage(
    //   sendMessageInput,
    //   workspace.id,
    // );

    this.chatMessageManagerQueue.add<ChatMessageQueueData>(
      SendMessageJob.name,
      {
        chatType: ChatIntegrationProviders.WhatsApp,
        sendMessageInput: sendWhatsAppMessageInput,
        workspaceId: workspace.id,
      },
    );

    return true;

    // if (sendMessageConfirmation) {
    //   const lastMessage = {
    //     createdAt: new Date(),
    //     from: sendMessageInput.from,
    //     fromMe: sendMessageInput.fromMe,
    //     message: sendMessageInput.fileId
    //       ? sendMessageInput.fileId
    //       : sendMessageInput.message || '',
    //     type: sendMessageInput.type,
    //     id: sendMessageConfirmation.messages[0].id,
    //     status: 'pending',
    //   };

    //   const whatsappIntegration: Omit<
    //     WhatsappDocument,
    //     'timeline' | 'unreadMessages' | 'isVisible'
    //   > = {
    //     integrationId: sendMessageInput.integrationId,
    //     client: {
    //       phone: sendMessageInput.to,
    //     },
    //     personId: sendMessageInput.personId,
    //     messages: [
    //       {
    //         ...lastMessage,
    //       },
    //     ],
    //     status: statusEnum.Waiting,
    //     lastMessage,
    //   };

    //   return await this.whatsappService.saveMessageAtFirebase(
    //     whatsappIntegration,
    //     false,
    //     workspace.id,
    //   );
    // }

    return false;
  }

  @Mutation(() => Boolean)
  async updateMessageData(
    @Args('updateMessageInput')
    updateMessageInput: UpdateWhatsAppMessageDataInput,
  ) {
    return await this.whatsappService.updateMessageAtFirebase(
      updateMessageInput,
    );
  }

  @Mutation(() => Boolean)
  async sendEventMessage(
    @Args('sendEventMessageInput') sendEventMessageInput: SendEventMessageInput,
  ) {
    const timeline =
      sendEventMessageInput.eventStatus === 'transfer'
        ? {
            agent: `${sendEventMessageInput.from}`,
            date: new Date(),
            event: sendEventMessageInput.eventStatus,
            transferTo: sendEventMessageInput.agent
              ? `${sendEventMessageInput.agent.name}`
              : sendEventMessageInput.sector?.name,
          }
        : {
            agent: `${sendEventMessageInput.from}`,
            date: new Date(),
            event: sendEventMessageInput.eventStatus,
          };

    const whatsappIntegration: Omit<
      WhatsappDocument,
      'unreadMessages' | 'lastMessage' | 'isVisible'
    > = {
      integrationId: sendEventMessageInput.integrationId,
      client: {
        phone: sendEventMessageInput.to,
      },
      personId: sendEventMessageInput.personId,
      messages: [
        {
          createdAt: new Date(),
          from: sendEventMessageInput?.from || 'system',
          message: sendEventMessageInput.message || '',
          type: sendEventMessageInput.eventStatus,
        },
      ],
      status: sendEventMessageInput.status as statusEnum,
      timeline: [timeline],
      agent: sendEventMessageInput.agent
        ? sendEventMessageInput.agent.id
        : 'empty',
      sector: sendEventMessageInput.sector
        ? sendEventMessageInput.sector.id
        : 'empty',
    };

    return await this.whatsappService.saveEventMessageAtFirebase(
      whatsappIntegration,
    );
  }

  @Query(() => WhatsappTemplatesResponse)
  getWhatsappTemplates(
    @Args('integrationId') integrationId: string,
    @AuthWorkspace() workspace: Workspace,
  ) {
    return this.whatsappService.getWhatsappTemplates(
      integrationId,
      workspace.id,
    );
  }
}
