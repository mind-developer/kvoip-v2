import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import axios from 'axios';

import { statusEnum } from 'src/engine/core-modules/meta/types/statusEnum';
import { WhatsappIntegrationService } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.service';
import { WhatsappDocument } from 'src/engine/core-modules/meta/whatsapp/types/WhatsappDocument';
import { WhatsappService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';

@Controller('whatsapp')
export class WhatsappController {
  protected readonly logger = new Logger(WhatsappController.name);

  constructor(
    private whatsappIntegrationService: WhatsappIntegrationService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Get('/webhook/:workspaceId/:id')
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
  async handleIncomingMessage(
    @Param('workspaceId') workspaceId: string,
    @Param('id') id: string,
    // TO DO
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @Body() body: any,
  ) {
    this.logger.log(`${id} - Received incoming message`);
    console.log(body);

    if (body.entry[0].changes[0].statuses) {
      console.log('got update status:', body.entry[0].changes[0]);
      this.whatsappService.updateMessageAtFirebase({
        integrationId: id,
        id: body.entry[0].changes[0].statuses[0].id,
        clientPhoneNumber:
          body.entry[0].changes[0].statuses[0].baileysRecipientId.replace(
            '@s.whatsapp.net',
            '',
          ) ?? body.entry[0].changes[0].statuses[0].recipent_id,
        status: body.entry[0].changes[0].statuses[0].status ?? null,
      });
      return;
    }

    const isReceiving = !!body.entry[0].changes[0].value.messages;

    const messages = body.entry[0].changes[0].value.messages[0];

    let mediaId: string | undefined;
    let fileUrl;

    switch (messages.type) {
      case 'image':
        mediaId = messages.image.id;
        break;
      case 'audio':
        mediaId = messages.audio.id;
        break;
      case 'document':
        mediaId = messages.document.id;
        break;
      case 'video':
        mediaId = messages.video.id;
        break;
      default:
        mediaId = undefined;
        break;
    }

    if (isReceiving) {
      // Novo fluxo: verifica se é mídia e se existe base64
      let isBase64Media = false;
      let base64String = '';
      let mimeType = '';
      let fileName = '';

      if (
        ['image', 'video', 'audio', 'document'].includes(messages.type) &&
        messages[messages.type] &&
        messages[messages.type].base64
      ) {
        isBase64Media = true;
        base64String = messages[messages.type].base64;
        mimeType =
          messages[messages.type].mime_type || 'application/octet-stream';
        fileName = `${body.entry[0].changes[0].value.messages[0].from}_${Date.now()}`;
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
              '.' + mimeType.split('/')[1].split(';')[0].replace('jpeg', 'jpg');
          }
          const fileNameWithExt = `${body.entry[0].changes[0].value.messages[0].from}_${Date.now()}${ext}`;

          this.logger.log(
            `Nome do arquivo gerado para upload: ${fileNameWithExt}`,
          );
          this.logger.log(
            `Diretório do bucket: workspaceId=${workspaceId}, tipo=${messages.type}`,
          );
          const file = {
            originalname: fileNameWithExt,
            buffer,
            mimetype: mimeType,
          };

          fileUrl =
            await this.whatsappService.googleStorageService.uploadFileToBucket(
              workspaceId,
              messages.type,
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
          body.entry[0].changes[0].value.messages[0].from,
          messages.type,
          workspaceId,
        );
      }

      const lastMessage = {
        createdAt: new Date(),
        from: body.entry[0].changes[0].value.contacts[0].profile.name,
        message:
          mediaId || isBase64Media
            ? fileUrl
            : body.entry[0].changes[0].value.messages[0].text.body,
        type: body.entry[0].changes[0].value.messages[0].type,
        fromMe: body.entry[0].changes[0].value.messages[0].fromMe,
      };

      const whatsappIntegration: Omit<
        WhatsappDocument,
        'timeline' | 'unreadMessages' | 'isVisible'
      > = {
        integrationId: id,
        workspaceId: workspaceId,
        client: {
          phone: body.entry[0].changes[0].value.messages[0].from.replace(
            '@s.whatsapp.net',
            '',
          ),
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

      console.log(
        'Payload enviado ao Firestore:',
        JSON.stringify(whatsappIntegration, null, 2),
      );

      await this.whatsappService.saveMessageAtFirebase(
        whatsappIntegration,
        true,
      );
    }
  }

  @Post('start/:sessionId')
  async startSession(@Param('sessionId') sessionId: string, @Body() body: any) {
    return this.whatsappIntegrationService.startBaileysSession(sessionId, body);
  }

  @Delete('stop/:sessionId')
  async stopSession(@Param('sessionId') sessionId: string) {
    return this.whatsappIntegrationService.stopBaileysSession(sessionId);
  }

  @Get('status/:sessionId')
  async getStatus(@Param('sessionId') sessionId: string) {
    return this.whatsappIntegrationService.getBaileysStatus(sessionId);
  }

  @Get('qr/:sessionId')
  async getQr(@Param('sessionId') sessionId: string) {
    return this.whatsappIntegrationService.getBaileysQr(sessionId);
  }
}

// Controller separado para endpoints REST
@Controller('rest/whatsapp')
export class WhatsappRestController {
  protected readonly logger = new Logger(WhatsappRestController.name);

  constructor(
    private whatsappIntegrationService: WhatsappIntegrationService,
    private readonly whatsappService: WhatsappService,
  ) {}

  @Get('/qrold/:sessionId')
  async getQrCodeold(@Param('sessionId') sessionId: string) {
    try {
      this.logger.log(`=== INICIANDO REQUISIÇÃO QR CODE ===`);
      this.logger.log(`Session ID: ${sessionId}`);
      this.logger.log(
        `URL de destino: http://localhost:3002/api/session/${sessionId}/qr`,
      );

      const response = await axios.get(
        `http://localhost:3002/api/session/${sessionId}/qr`,
        {
          timeout: 10000, // 10 second timeout
        },
      );

      this.logger.log(`=== RESPOSTA RECEBIDA ===`);
      this.logger.log(`Status: ${response.status}`);
      this.logger.log(`Headers:`, response.headers);
      this.logger.log(`Data:`, response.data);

      return response.data;
    } catch (error) {
      this.logger.error(`=== ERRO NA REQUISIÇÃO ===`);
      this.logger.error(`Session ID: ${sessionId}`);
      this.logger.error(`Erro completo:`, error);

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        this.logger.error(`Status do erro: ${error.response.status}`);
        this.logger.error(`Dados do erro:`, error.response.data);
        throw new HttpException(
          `Baileys service error: ${error.response.status} - ${error.response.statusText}`,
          error.response.status,
        );
      } else if (error.request) {
        // The request was made but no response was received
        this.logger.error(`Nenhuma resposta recebida do Baileys service`);
        throw new HttpException(
          'Baileys service is not responding',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        this.logger.error(
          `Erro na configuração da requisição: ${error.message}`,
        );
        throw new HttpException(
          `Error setting up request: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  // NOVO ENDPOINT PROXY PARA STATUS
  @Get('/status/:sessionId')
  @UseGuards()
  async getStatus(@Param('sessionId') sessionId: string) {
    try {
      this.logger.log(`=== INICIANDO REQUISIÇÃO STATUS ===`);
      this.logger.log(`Session ID: ${sessionId}`);
      this.logger.log(
        `URL de destino: http://localhost:3002/api/session/status/${sessionId}`,
      );

      const response = await axios.get(
        `http://localhost:3002/api/session/status/${sessionId}`,
        {
          timeout: 10000, // 10 second timeout
        },
      );

      this.logger.log(`=== RESPOSTA RECEBIDA ===`);
      this.logger.log(`Status: ${response.status}`);
      this.logger.log(`Headers:`, response.headers);
      this.logger.log(`Data:`, response.data);

      return response.data;
    } catch (error) {
      this.logger.error(`=== ERRO NA REQUISIÇÃO STATUS ===`);
      this.logger.error(`Session ID: ${sessionId}`);
      this.logger.error(`Erro completo:`, error);

      if (error.response) {
        this.logger.error(`Status do erro: ${error.response.status}`);
        this.logger.error(`Dados do erro:`, error.response.data);
        throw new HttpException(error.response.data, error.response.status);
      } else if (error.request) {
        this.logger.error(`Nenhuma resposta recebida do Baileys service`);
        throw new HttpException(
          'Baileys service is not responding',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        this.logger.error(
          `Erro na configuração da requisição: ${error.message}`,
        );
        throw new HttpException(
          `Error setting up request: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}

// Controller separado para endpoints REST
@Controller('Whats-App-rest/whatsapp')
export class WhatsappRestController2 {
  protected readonly logger = new Logger(WhatsappRestController.name);

  constructor(
    private whatsappIntegrationService: WhatsappIntegrationService,
    private readonly whatsappService: WhatsappService,
  ) {}

  // NOVO ENDPOINT PROXY PARA STATUS
  @Get('/status/:sessionId')
  @UseGuards()
  async getStatus(@Param('sessionId') sessionId: string) {
    try {
      this.logger.log(`=== INICIANDO REQUISIÇÃO STATUS ===`);
      this.logger.log(`Session ID: ${sessionId}`);
      this.logger.log(
        `URL de destino: http://localhost:3002/api/session/status/${sessionId}`,
      );

      const response = await axios.get(
        `http://localhost:3002/api/session/status/${sessionId}`,
        {
          timeout: 10000, // 10 second timeout
        },
      );

      this.logger.log(`=== RESPOSTA RECEBIDA ===`);
      this.logger.log(`Status: ${response.status}`);
      this.logger.log(`Headers:`, response.headers);
      this.logger.log(`Data:`, response.data);

      return response.data;
    } catch (error) {
      this.logger.error(`=== ERRO NA REQUISIÇÃO STATUS ===`);
      this.logger.error(`Session ID: ${sessionId}`);
      this.logger.error(`Erro completo:`, error);

      if (error.response) {
        this.logger.error(`Status do erro: ${error.response.status}`);
        this.logger.error(`Dados do erro:`, error.response.data);
        throw new HttpException(error.response.data, error.response.status);
      } else if (error.request) {
        this.logger.error(`Nenhuma resposta recebida do Baileys service`);
        throw new HttpException(
          'Baileys service is not responding',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        this.logger.error(
          `Erro na configuração da requisição: ${error.message}`,
        );
        throw new HttpException(
          `Error setting up request: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get('/qr/:sessionId')
  async getQrCode(@Param('sessionId') sessionId: string) {
    try {
      this.logger.log(`=== INICIANDO REQUISIÇÃO QR CODE ===`);
      this.logger.log(`Session ID: ${sessionId}`);
      this.logger.log(
        `URL de destino: http://localhost:3002/api/session/${sessionId}/qr`,
      );

      const response = await axios.get(
        `http://localhost:3002/api/session/${sessionId}/qr`,
        {
          timeout: 10000, // 10 second timeout
        },
      );

      this.logger.log(`=== RESPOSTA RECEBIDA ===`);
      this.logger.log(`Status: ${response.status}`);
      this.logger.log(`Headers:`, response.headers);
      this.logger.log(`Data:`, response.data);

      return response.data;
    } catch (error) {
      this.logger.error(`=== ERRO NA REQUISIÇÃO ===`);
      this.logger.error(`Session ID: ${sessionId}`);
      this.logger.error(`Erro completo:`, error);

      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        this.logger.error(`Status do erro: ${error.response.status}`);
        this.logger.error(`Dados do erro:`, error.response.data);
        throw new HttpException(
          `Baileys service error: ${error.response.status} - ${error.response.statusText}`,
          error.response.status,
        );
      } else if (error.request) {
        // The request was made but no response was received
        this.logger.error(`Nenhuma resposta recebida do Baileys service`);
        throw new HttpException(
          'Baileys service is not responding',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      } else {
        // Something happened in setting up the request that triggered an Error
        this.logger.error(
          `Erro na configuração da requisição: ${error.message}`,
        );
        throw new HttpException(
          `Error setting up request: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }
}
