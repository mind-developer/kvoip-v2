import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import axios from 'axios';
// Controller separado para endpoints REST
@Controller('Whats-App-rest/whatsapp')
export class WhatsappRestController {
  protected readonly logger = new Logger(WhatsappRestController.name);

  constructor() {}

  @Post('/session/:sessionId')
  async createSession(
    @Param('sessionId') sessionId: string,
    @Body() body: { webhook: string; workspaceID: string; canalID: string },
  ) {
    const { webhook, workspaceID, canalID } = body;
    await axios.post(`http://localhost:3002/api/session/${sessionId}`, {
      webhook,
      workspaceID,
      canalID,
    });
    return {
      message: `Session ${sessionId} created or recovered successfully.`,
    };
  }

  // NOVO ENDPOINT PROXY PARA STATUS
  @Get('/status/:sessionId')
  @UseGuards()
  async getStatus(@Param('sessionId') sessionId: string) {
    try {
      const response = await axios.get(
        `http://localhost:3002/api/session/status/${sessionId}`,
        {
          timeout: 10000, // 10 second timeout
        },
      );

      return response.data;
    } catch (error) {
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
