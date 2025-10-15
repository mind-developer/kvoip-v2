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
import { FileMetadataService } from 'src/engine/core-modules/file/services/file-metadata.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { FormattedWhatsAppMessage } from 'src/engine/core-modules/meta/whatsapp/types/FormattedWhatsAppMessage';

import { WhatsAppService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ChatMessageType } from 'twenty-shared/types';
import { v4 } from 'uuid';

@Controller('whatsapp')
export class WhatsappController {
  protected readonly logger = new Logger(WhatsappController.name);

  constructor(
    private twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly whatsappService: WhatsAppService,
    private readonly fileMetadataService: FileMetadataService,
    private readonly fileService: FileService,
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
    const integration = await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace(
        workspaceId,
        'whatsappIntegration',
        { shouldBypassPermissionChecks: true },
      )
    ).findOneBy({ id });

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
      if (body.entry[0].changes[0].statuses) {
        this.whatsappService.updateMessage(
          body.entry[0].changes[0].statuses[0].id,
          {
            deliveryStatus:
              body.entry[0].changes[0].statuses[0].status?.toUpperCase() ??
              null,
          },
          workspaceId,
        );
        return true;
      }

      const isReceiving = body.entry[0].changes[0].value.messages;
      const messages = body.entry[0].changes[0].value.messages;

      for (const msg of messages) {
        let mediaId: string | undefined;
        let fileUrl;

        msg.type = msg.type.toUpperCase();
        switch (msg.type) {
          case ChatMessageType.IMAGE:
            mediaId = msg.image.id;
            break;
          case ChatMessageType.AUDIO:
            mediaId = msg.audio.id;
            break;
          case ChatMessageType.DOCUMENT:
            mediaId = msg.document.id;
            break;
          case ChatMessageType.VIDEO:
            mediaId = msg.video.id;
            break;
          default:
            mediaId = undefined;
            break;
        }

        if (isReceiving) {
          this.logger.log('IS RECEIVING');
          // Novo fluxo: verifica se é mídia e se existe base64
          let isBase64Media = false;
          let base64String = '';
          let mimeType = '';

          if (
            ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'].includes(msg.type) &&
            msg.type &&
            msg[msg.type.toLowerCase()].base64
          ) {
            isBase64Media = true;
            base64String = msg[msg.type.toLowerCase()].base64;
            mimeType =
              msg[msg.type.toLowerCase()].mime_type ||
              'application/octet-stream';
          }

          if (isBase64Media) {
            try {
              base64String = base64String.replace('data:', '').split(',')[1];
              const buffer = Buffer.from(base64String, 'base64');
              let ext = '';

              if (mimeType && mimeType.includes('/')) {
                ext =
                  '.' +
                  mimeType.split('/')[1].split(';')[0].replace('jpeg', 'jpg');
              }

              fileUrl = this.fileService.signFileUrl({
                url: (
                  await this.fileMetadataService.createFile({
                    file: Buffer.from(buffer),
                    filename: v4() + ext,
                    mimeType,
                    workspaceId,
                  })
                ).fullPath,
                workspaceId,
              });
              console.log('http://localhost:3000/files/' + fileUrl);
            } catch (err) {
              throw new HttpException(
                'Erro ao salvar mídia base64: ' + (err?.message || err),
                HttpStatus.INTERNAL_SERVER_ERROR,
              );
            }
          } else if (mediaId) {
            // Fluxo normal: baixa a mídia
            fileUrl = await this.whatsappService.downloadMedia(
              mediaId,
              integrationId,
              msg.from,
              msg.type,
              workspaceId,
            );
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
          };
          console.log(message);

          await this.whatsappService.saveMessage(
            message,
            integrationId,
            workspaceId,
          );
        }
      }
    } catch (error) {
      this.logger.error('Erro ao processar mensagem:', error);
      throw new HttpException(
        'Erro ao processar mensagem',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
