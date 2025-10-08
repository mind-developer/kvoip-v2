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
import { FormattedWhatsAppMessage } from 'src/engine/core-modules/meta/whatsapp/types/WhatsAppMessage';

import { WhatsAppService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ChatMessageType } from 'twenty-shared/types';

@Controller('whatsapp')
export class WhatsappController {
  protected readonly logger = new Logger(WhatsappController.name);

  constructor(
    private twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly whatsappService: WhatsAppService,
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
    if (body.entry[0].changes[0].statuses) {
      // return await this.whatsappService.updateMessageAtFirebase({
      //   integrationId: id,
      //   id: body.entry[0].changes[0].statuses[0].id,
      //   clientPhoneNumber:
      //     body.entry[0].changes[0].statuses[0].baileysRecipientId.replace(
      //       '@s.whatsapp.net',
      //       '',
      //     ) ?? body.entry[0].changes[0].statuses[0].recipent_id,
      //   status: body.entry[0].changes[0].statuses[0].status ?? null,
      // });
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
        let fileName = '';

        if (
          ['image', 'video', 'audio', 'document'].includes(msg.type) &&
          msg.type &&
          msg.type.base64
        ) {
          isBase64Media = true;
          base64String = messages[messages.type].base64;
          mimeType = msg[msg.type].mime_type || 'application/octet-stream';
          fileName = `${msg.from}_${Date.now()}`;
        }

        if (isBase64Media) {
          try {
            this.logger.log('Recebendo mídia em base64');
            // Remove prefixo se existir
            if (base64String.startsWith('data:')) {
              base64String = base64String.split(',')[1];
              this.logger.log('Prefixo data: removido do base64');
            }
            const buffer = Buffer.from(base64String, 'base64');

            this.logger.log(`Tamanho do buffer gerado: ${buffer.length} bytes`);
            // Gera extensão correta
            let ext = '';

            if (mimeType && mimeType.includes('/')) {
              ext =
                '.' +
                mimeType.split('/')[1].split(';')[0].replace('jpeg', 'jpg');
            }
            const fileNameWithExt = `${msg.from}_${Date.now()}${ext}`;

            this.logger.log(
              `Nome do arquivo gerado para upload: ${fileNameWithExt}`,
            );
            this.logger.log(
              `Diretório do bucket: workspaceId=${workspaceId}, tipo=${msg.type}`,
            );
            const file = {
              originalname: fileNameWithExt,
              buffer,
              mimetype: mimeType,
            };

            fileUrl =
              await this.whatsappService.googleStorageService.uploadFileToBucket(
                workspaceId,
                msg.type,
                file,
                false,
              );
            this.logger.log('Upload base64 concluído com sucesso:', fileUrl);
          } catch (err) {
            this.logger.error('Erro ao salvar mídia base64:', err);
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
          from: msg.from,
          to: msg.to,
          fromMe: !!msg.fromMe,
          senderAvatarUrl:
            body.entry[0].changes[0].value.contacts[0].profile.ppUrl,
          contactName:
            body.entry[0].changes[0].value.contacts[0].profile.name ?? null,
          textBody: msg.text.body,
          fileUrl: mediaId || isBase64Media ? (fileUrl ?? null) : null,
          caption: null,
          type: msg.type,
          deliveryStatus: msg.status,
        };

        await this.whatsappService.saveMessage(
          message,
          integrationId,
          workspaceId,
        );
      }
    }
  }
}
