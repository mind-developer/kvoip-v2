/* eslint-disable @nx/workspace-graphql-resolvers-should-be-guarded */
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { SendChatMessageJob } from 'src/engine/core-modules/chat-message-manager/jobs/chat-message-manager-send.job';
import { statusEnum } from 'src/engine/core-modules/meta/types/statusEnum';
import {
  SendWhatsAppEventMessageInput,
  SendWhatsAppMessageInput,
  SendWhatsAppTemplateInput,
} from 'src/engine/core-modules/meta/whatsapp/dtos/send-whatsapp-message.input';
import { UpdateWhatsAppMessageDataInput } from 'src/engine/core-modules/meta/whatsapp/dtos/update-whatsapp-message-data-input';
import { WhatsAppDocument } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';
import { WhatsappTemplatesResponse } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappTemplate';
import { WhatsAppService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { ChatIntegrationProvider } from 'twenty-shared/types';

@Resolver('Whatsapp')
export class WhatsappResolver {
  constructor(private readonly whatsappService: WhatsAppService) {}

  @Mutation(() => Boolean)
  async sendWhatsAppTemplate(
    @Args('sendWhatsAppTemplateInput')
    input: SendWhatsAppTemplateInput,
    @AuthWorkspace() workspace: Workspace,
  ) {
    this.whatsappService.sendMessage(SendChatMessageJob.name, {
      chatType: ChatIntegrationProvider.WHATSAPP,
      sendMessageInput: input,
      workspaceId: workspace.id,
    });
    return true;
    // const sendTemplateConfirmation =
    //   await this.chatMessageManagerService.sendWhatsAppTemplate(
    //     input,
    //     workspace.id,
    //   );

    // if (sendTemplateConfirmation) {
    //   const today = new Date();
    //   const messageEvent = `${input.agent?.name} started the service (${today.toISOString().split('T')[0].replace(/-/g, '/')} - ${today.getHours()}:${(today.getMinutes() < 10 ? '0' : '') + today.getMinutes()})`;

    //   const lastMessage = {
    //     createdAt: today,
    //     from: 'system',
    //     message: input.message,
    //     type: 'template',
    //   };

    //   const timeline = {
    //     agent: `${input.agent?.name}`,
    //     date: today,
    //     event: 'started',
    //   };

    //   const whatsappIntegration: Omit<
    //     WhatsAppDocument,
    //     'unreadMessages' | 'isVisible'
    //   > = {
    //     integrationId: input.integrationId,
    //     client: {
    //       phone: input.to.slice(1),
    //       name: input.to.slice(1),
    //     },
    //     personId: input.personId,
    //     messages: [
    //       {
    //         ...lastMessage,
    //       },
    //     ],
    //     status: statusEnum.InProgress,
    //     timeline: [timeline],
    //     agent: input.agent?.id,
    //     sector: 'empty',
    //     lastMessage,
    //   };

    //   await this.whatsappService.saveMessageAtFirebase(
    //     whatsappIntegration,
    //     false,
    //     workspace.id,
    //   );

    //   return await this.whatsappService.saveEventMessageAtFirebase({
    //     ...whatsappIntegration,
    //     messages: [
    //       {
    //         ...lastMessage,
    //         message: messageEvent,
    //         type: 'started',
    //       },
    //     ],
    //   });
    // }

    // return false;
  }

  @Mutation(() => Boolean)
  async sendWhatsAppMessage(
    @Args('sendWhatsAppMessageInput')
    input: SendWhatsAppMessageInput,
    @AuthWorkspace() workspace: Workspace,
  ) {
    console.log('running resolver');
    this.whatsappService.sendMessage(SendChatMessageJob.name, {
      chatType: ChatIntegrationProvider.WHATSAPP,
      sendMessageInput: input,
      workspaceId: workspace.id,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async updateWhatsAppMessageData(
    @Args('updateWhatsAppMessageInput')
    updateWhatsAppMessageInput: UpdateWhatsAppMessageDataInput,
  ) {
    return await this.whatsappService.updateMessageAtFirebase(
      updateWhatsAppMessageInput,
    );
  }

  @Mutation(() => Boolean)
  async sendWhatsAppEventMessage(
    @Args('sendWhatsAppEventMessageInput')
    input: SendWhatsAppEventMessageInput,
  ) {
    const timeline =
      input.eventStatus === 'transfer'
        ? {
            agent: `${input.from}`,
            date: new Date(),
            event: input.eventStatus,
            transferTo: input.agent
              ? `${input.agent.name}`
              : input.sector?.name,
          }
        : {
            agent: `${input.from}`,
            date: new Date(),
            event: input.eventStatus,
          };

    const whatsappIntegration: Omit<
      WhatsAppDocument,
      'unreadMessages' | 'lastMessage' | 'isVisible'
    > = {
      integrationId: input.integrationId,
      client: {
        phone: input.to,
      },
      personId: input.personId,
      messages: [
        {
          createdAt: new Date(),
          from: input?.from || 'system',
          message: input.message || '',
          type: input.eventStatus,
        },
      ],
      status: input.status as statusEnum,
      timeline: [timeline],
      agent: input.agent ? input.agent.id : 'empty',
      sector: input.sector ? input.sector.id : 'empty',
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
