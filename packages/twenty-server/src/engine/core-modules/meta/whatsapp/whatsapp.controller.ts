import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { statusEnum } from 'src/engine/core-modules/meta/types/statusEnum';
import { WhatsappIntegrationService } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.service';
import { WhatsappDocument } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';
import { WhatsappService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller('whatsapp')
export class WhatsappController {
  protected readonly logger = new Logger(WhatsappController.name);

  constructor(
    private whatsappIntegrationService: WhatsappIntegrationService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Get('/webhook/:workspaceId/:id')
  @UseGuards(PublicEndpointGuard)
  async handleVerification(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') verifyToken: string,
  ) {
    const integration = await this.whatsappIntegrationService.findById(
      id,
      workspaceId,
    );

    if (mode && verifyToken) {
      if (mode === 'subscribe' && verifyToken === integration?.verifyToken) {
        this.logger.log('Webhook verified successfully');

        return challenge;
      } else {
        throw new HttpException('Verification failed', HttpStatus.FORBIDDEN);
      }
    }

    throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
  }

  @Post('/webhook/:workspaceId/:id')
  @UseGuards(PublicEndpointGuard)
  async handleIncomingMessage(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    // TO DO
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Body() body: any,
  ) {
    this.logger.log(`${id} - Received incoming message`);

    const isReceiving = !!body.entry[0].changes[0].value.messages;

    const messages = body.entry[0].changes[0].value.messages || [];

    for (const msg of messages) {
      let mediaId: string | undefined;
      let fileUrl;

      switch (msg.type) {
        case 'image':
          mediaId = msg.image.id;
          break;
        case 'audio':
          mediaId = msg.audio.id;
          break;
        case 'document':
          mediaId = msg.document.id;
          break;
        case 'video':
          mediaId = msg.video.id;
          break;
        default:
          mediaId = undefined;
          break;
      }

      if (isReceiving) {
        if (mediaId) {
          fileUrl = await this.whatsappService.downloadMedia(
            mediaId,
            id,
            msg.from,
            msg.type,
            workspaceId,
          );
        }

        const lastMessage = {
          createdAt: new Date(),
          from: body.entry[0].changes[0].value.contacts[0].profile.name,
          message: mediaId ? fileUrl : msg.text?.body,
          type: msg.type,
        };

        const whatsappIntegration: Omit<
          WhatsappDocument,
          'timeline' | 'unreadMessages' | 'isVisible'
        > = {
          integrationId: id,
          workspaceId: workspaceId,
          client: {
            phone: msg.from,
            name: body.entry[0].changes[0].value.contacts[0].profile.name,
          },
          messages: [
            {
              ...lastMessage,
            },
          ],
          status: statusEnum.Waiting,
          lastMessage,
        };

        await this.whatsappService.saveMessageAtFirebase(
          whatsappIntegration,
          true,
        );
      }
    }
  }
}
