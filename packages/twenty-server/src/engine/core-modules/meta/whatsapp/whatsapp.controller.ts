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
    if (body.entry[0].changes[0].statuses) {
      return await this.whatsappService.updateMessageAtFirebase({
        integrationId: id,
        id: body.entry[0].changes[0].statuses[0].id,
        clientPhoneNumber:
          body.entry[0].changes[0].statuses[0].baileysRecipientId.replace(
            '@s.whatsapp.net',
            '',
          ) ?? body.entry[0].changes[0].statuses[0].recipent_id,
        status: body.entry[0].changes[0].statuses[0].status ?? null,
      });
    }

    const isReceiving = body.entry[0].changes[0].value.messages;
    const messages = body.entry[0].changes[0].value.messages[0];

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
            id,
            msg.from,
            msg.type,
            workspaceId,
          );
        }

        const lastMessage = {
          createdAt: new Date(),
          id: msg.id,
          from: body.entry[0].changes[0].value.contacts[0].profile.name,
          message: mediaId || isBase64Media ? fileUrl : msg.text.body,
          type: msg.type,
          fromMe: msg.fromMe,
        };

        const whatsappIntegration: Omit<
          WhatsappDocument,
          'personId' | 'timeline' | 'unreadMessages' | 'isVisible'
        > = {
          integrationId: id,
          workspaceId: workspaceId,
          client: {
            phone: msg.from.replace('@s.whatsapp.net', ''),
            name: body.entry[0].changes[0].value.contacts[0].profile.name,
            ppUrl: body.entry[0].changes[0].value.contacts[0].profile.ppUrl,
          },
          messages: [
            {
              ...lastMessage,
            },
          ],
          status: statusEnum.Waiting,
          lastMessage,
        };

        this.logger.log(
          'Payload enviado ao Firestore:',
          JSON.stringify(whatsappIntegration, null, 2),
        );

        await this.whatsappService.saveMessageAtFirebase(
          whatsappIntegration,
          true,
          workspaceId,
        );
      }
    }
  }
}
