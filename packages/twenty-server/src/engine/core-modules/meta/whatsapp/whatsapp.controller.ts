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
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { FileMetadataService } from 'src/engine/core-modules/file/services/file-metadata.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { FormattedWhatsAppMessage } from 'src/engine/core-modules/meta/whatsapp/types/FormattedWhatsAppMessage';
import {
  extractBase64MediaInfo,
  extractMediaId,
  processBase64Media,
} from 'src/engine/core-modules/meta/whatsapp/utils/mediaUtils';
import { normalizePhoneNumber } from 'twenty-shared/utils';

import { parseAddressingMode } from 'src/engine/core-modules/meta/whatsapp/utils/parseAddressingMode';
import { WhatsAppService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WhatsappIntegrationWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';
import { v4 } from 'uuid';

@Controller('whatsapp')
export class WhatsappController {
  protected readonly logger = new Logger(WhatsappController.name);
  private SERVER_URL: string;

  constructor(
    private twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly whatsappService: WhatsAppService,
    private readonly fileMetadataService: FileMetadataService,
    private readonly fileService: FileService,
    private readonly chatMessageManagerService: ChatMessageManagerService,
    private readonly environmentService: TwentyConfigService,
  ) {
    this.SERVER_URL = this.environmentService.get('SERVER_URL');
  }

  @Get('/webhook/:workspaceId/:id')
  @UseGuards(PublicEndpointGuard)
  async handleVerification(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    @Query('hub.mode') mode: string,
    @Query('hub.challenge') challenge: string,
    @Query('hub.verify_token') verifyToken: string,
  ) {
    const whatsappIntegrationRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'whatsappIntegration',
        { shouldBypassPermissionChecks: true },
      );
    const integration = await whatsappIntegrationRepository.findOne({
      where: { id },
    });

    if (mode && verifyToken) {
      if (mode === 'subscribe' && verifyToken === integration?.verifyToken) {
        this.logger.log('Webhook verified successfully');

        return challenge;
      } else {
        throw new HttpException(
          'Verification failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    throw new HttpException('Invalid request', HttpStatus.BAD_REQUEST);
  }

  @Post('/webhook/:workspaceId/:integrationId')
  @UseGuards(PublicEndpointGuard)
  async handleIncomingMessage(
    @Param('workspaceId') workspaceId: string,
    @Param('integrationId') integrationId: string,
    // TO DO
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Body() body: any,
  ) {
    try {
      const whatsappIntegrationRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
          workspaceId,
          'whatsappIntegration',
          { shouldBypassPermissionChecks: true },
        );
      const integration = await whatsappIntegrationRepository.findOne({
        where: { id: integrationId },
      });
      const messages = body.entry[0]?.changes[0]?.value?.messages ?? null;
      const statuses = body.entry[0]?.changes[0]?.value?.statuses ?? null;

      if (statuses) {
        for (const status of statuses) {
          try {
            await this.chatMessageManagerService.updateMessage(
              status.id,
              {
                deliveryStatus: status.status?.toUpperCase() ?? null,
              },
              workspaceId,
            );
          } catch (error) {
            this.logger.error('Error updating message:', error);
          }
        }
        return true;
      }

      if (!messages) {
        this.logger.warn('No messages found in body');
        return;
      }

      for (const msg of messages) {
        try {
          msg.type = msg.type.toUpperCase();

          const mediaId = extractMediaId(msg);
          const { isBase64Media, base64String, mimeType } =
            extractBase64MediaInfo(msg);

          let fileUrl: string | null = null;

          if (mediaId?.id) {
            fileUrl =
              (await this.whatsappService.downloadMedia(
                mediaId.id,
                integrationId,
                msg.from,
                workspaceId,
              )) ?? null;
          }

          if (isBase64Media) {
            this.logger.warn(`Processing base64 media, mimeType: ${mimeType}`);
            const buffer = await processBase64Media(
              base64String,
              mimeType,
              workspaceId,
              this.fileMetadataService,
              this.fileService,
            );
            let ext = mimeType
              .split('/')[1]
              .split(';')[0]
              .replace('jpeg', 'jpg');
            ext = '.' + ext;

            fileUrl = (
              await this.fileMetadataService.createFile({
                file: Buffer.from(buffer),
                filename: v4() + ext,
                mimeType,
                workspaceId,
              })
            ).fullPath;
          }
          let phoneNumber = '';
          if (integration?.apiType === 'MetaAPI') {
            phoneNumber =
              '+' +
              normalizePhoneNumber(msg.from).primaryPhoneCallingCode +
              normalizePhoneNumber(msg.from).primaryPhoneNumber;
          } else {
            phoneNumber = parseAddressingMode(msg.from).phoneNumber;
          }
          const message: FormattedWhatsAppMessage = {
            id: msg.id,
            remoteJid: msg.from,
            fromMe: !!msg.fromMe,
            senderAvatarUrl:
              body.entry[0].changes[0].value?.contacts[0]?.profile?.ppUrl,
            contactName:
              body.entry[0].changes[0].value?.contacts[0]?.profile?.name ??
              null,
            textBody: msg.text?.body ?? null,
            attachmentUrl: mediaId || isBase64Media ? (fileUrl ?? null) : null,
            caption: null,
            type: msg.type,
            deliveryStatus: msg.status,
            //baileys uses a non standardized phone number format
            senderPhoneNumber: phoneNumber,
            repliesTo: msg.context?.id ?? null,
          };

          await this.whatsappService.saveMessage(
            message,
            integrationId,
            workspaceId,
          );
          this.logger.log(`Successfully processed message: ${msg.id}`);
        } catch (error) {
          this.logger.error(
            `Error processing individual message ${msg.id}:`,
            error,
          );
          this.logger.error(`Message data: ${JSON.stringify(msg, null, 2)}`);
          throw error;
        }
      }
      this.logger.log(
        `Successfully processed all messages for workspace: ${workspaceId}, integration: ${integrationId}`,
      );
    } catch (error) {
      this.logger.error(
        `Error handling incoming WhatsApp message for workspace: ${workspaceId}, integration: ${integrationId}`,
        error,
      );
      this.logger.error(
        `Error stack: ${error instanceof Error ? error.stack : 'No stack trace available'}`,
      );
      throw error;
    }
  }
}
