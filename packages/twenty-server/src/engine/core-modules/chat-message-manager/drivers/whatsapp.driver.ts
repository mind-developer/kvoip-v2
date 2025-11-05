/* @kvoip-woulz proprietary */
import { InternalServerErrorException } from '@nestjs/common';
import type { AxiosError } from 'axios';
import axios from 'axios';
import { execFile as _execFile } from 'child_process';
import { ffmpegPath, ffprobePath } from 'ffmpeg-ffprobe-static';
import FormData from 'form-data';
import { promises as fs } from 'fs';
import os from 'os';
import path from 'path';
import { ChatProviderDriver } from 'src/engine/core-modules/chat-message-manager/drivers/interfaces/chat-provider-driver-interface';
import { getMessageFields } from 'src/engine/core-modules/meta/whatsapp/utils/getMessageFields';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ClientChatMessageService } from 'src/modules/client-chat-message/client-chat-message.service';
import { ClientChatMessageWorkspaceEntity } from 'src/modules/client-chat-message/standard-objects/client-chat-message.workspace-entity';
import { ClientChatWorkspaceEntity } from 'src/modules/client-chat/standard-objects/client-chat.workspace-entity';
import { WhatsappIntegrationWorkspaceEntity } from 'src/modules/whatsapp-integration/standard-objects/whatsapp-integration.workspace-entity';
import {
  ChatMessageDeliveryStatus,
  ChatMessageType,
  ClientChatMessage,
} from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

export class WhatsAppDriver implements ChatProviderDriver {
  private readonly META_API_URL: string;

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly environmentService: TwentyConfigService,
    private readonly clientChatMessageManagerService: ClientChatMessageService,
  ) {
    this.META_API_URL = this.environmentService.get('META_API_URL');
  }

  private inferMimeFromFilename(filename: string): string {
    const lower = filename.toLowerCase();
    if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
    if (lower.endsWith('.png')) return 'image/png';
    if (lower.endsWith('.gif')) return 'image/gif';
    if (lower.endsWith('.pdf')) return 'application/pdf';
    if (lower.endsWith('.mp3')) return 'audio/mpeg';
    if (lower.endsWith('.wav')) return 'audio/wav';
    if (lower.endsWith('.mp4')) return 'video/mp4';
    if (lower.endsWith('.mov')) return 'video/quicktime';
    if (lower.endsWith('.webm')) return 'audio/webm';
    return 'application/octet-stream';
  }

  private async uploadMediaAndGetId(
    link: string,
    integration: WhatsappIntegrationWorkspaceEntity,
  ): Promise<string> {
    const downloadResponse = await axios.get(link, {
      responseType: 'arraybuffer',
    });

    const fallbackMime = this.inferMimeFromFilename(link);
    const contentType =
      (downloadResponse.headers?.['content-type'] as string | undefined) ||
      fallbackMime;

    let filenameFromUrl = (() => {
      try {
        const url = new URL(link);
        const last = url.pathname.split('/').filter(Boolean).pop();
        return last || 'file';
      } catch {
        return 'file';
      }
    })();

    let uploadBuffer = Buffer.from(downloadResponse.data);
    let uploadContentType = contentType;

    const isWebmContent =
      uploadContentType.includes('webm') ||
      filenameFromUrl.toLowerCase().endsWith('.webm');

    if (isWebmContent && ffmpegPath && ffprobePath) {
      const execFile = (await import('node:util')).promisify(_execFile);

      const tmpDir = os.tmpdir();
      const inputPath = path.join(tmpDir, `${uuidv4()}.webm`);
      await fs.writeFile(inputPath, uploadBuffer);

      const probeArgs = [
        '-v',
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=codec_type',
        '-of',
        'json',
        inputPath,
      ];
      let hasVideo = false;
      try {
        const { stdout } = await execFile(ffprobePath as string, probeArgs);
        const json = JSON.parse(stdout || '{}');
        hasVideo = Array.isArray(json.streams) && json.streams.length > 0;
      } catch {
        hasVideo = false;
      }

      const outputExt = hasVideo ? '.mp4' : '.ogg';
      const outputMime = hasVideo ? 'video/mp4' : 'audio/ogg; codecs=opus';
      const outputPath = path.join(tmpDir, `${uuidv4()}${outputExt}`);

      const ffmpegArgs = hasVideo
        ? [
            '-i',
            inputPath,
            '-c:v',
            'libx264',
            '-c:a',
            'aac',
            '-movflags',
            '+faststart',
            outputPath,
          ]
        : [
            '-i',
            inputPath,
            '-vn',
            '-c:a',
            'libopus',
            '-b:a',
            '96k',
            '-vbr',
            'on',
            '-application',
            'voip',
            outputPath,
          ];

      try {
        await execFile(ffmpegPath as string, ffmpegArgs);
        const converted = await fs.readFile(outputPath);
        uploadBuffer = converted;
        uploadContentType = outputMime;
        filenameFromUrl = filenameFromUrl.replace(/\.webm$/i, outputExt);
      } finally {
        // cleanup
        try {
          await fs.unlink(inputPath);
        } catch {}
        try {
          await fs.unlink(outputPath);
        } catch {}
      }
    }

    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');
    formData.append('file', uploadBuffer, {
      filename: filenameFromUrl,
      contentType: uploadContentType,
    });

    const uploadUrl = `${this.META_API_URL}/${integration.phoneId}/media`;
    const uploadResponse = await axios.post(uploadUrl, formData, {
      headers: {
        Authorization: `Bearer ${integration.accessToken}`,
        ...formData.getHeaders(),
      },
    });

    return uploadResponse.data.id as string;
  }

  async sendMessage(
    clientChatMessage: ClientChatMessage,
    workspaceId: string,
    providerIntegrationId: string,
    clientChat: ClientChatWorkspaceEntity,
  ) {
    console.log('clientChatMessage', clientChatMessage);
    const integration = await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
        workspaceId,
        'whatsappIntegration',
      )
    ).findOne({ where: { id: providerIntegrationId } });

    if (!integration) {
      throw new InternalServerErrorException('WhatsApp integration not found');
    }
    const metaUrl = `${this.META_API_URL}/${integration.phoneId}/messages`;
    const baileysUrl = `http://localhost:3002/api/session/${integration.name}/send`;

    const apiType = integration?.apiType || 'MetaAPI';

    const headers = {
      Authorization: `Bearer ${integration.accessToken}`,
      'Content-Type': 'application/json',
    };

    const fields = await getMessageFields(clientChatMessage, clientChat);
    console.log('fields', JSON.stringify(fields, null, 2));

    try {
      // Se houver mídia por link, fazer upload para o Meta e trocar por id
      if (
        fields?.type &&
        ['image', 'video', 'audio', 'document'].includes(fields.type) &&
        fields[fields.type]?.link &&
        apiType === 'MetaAPI'
      ) {
        const mediaId = await this.uploadMediaAndGetId(
          fields[fields.type].link,
          integration,
        );

        const caption = fields[fields.type]?.caption;
        fields[fields.type] = { id: mediaId, ...(caption ? { caption } : {}) };
      }
      const primaryAddressingMode = fields.to
        .split('&')[0]
        .replace('primary=', '');
      fields.to = primaryAddressingMode;
      if (clientChatMessage.repliesTo) {
        const repliesToMessage = await (
          await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatMessageWorkspaceEntity>(
            workspaceId,
            'clientChatMessage',
          )
        ).findOne({ where: { id: clientChatMessage.repliesTo } });

        if (apiType === 'MetaAPI') {
          if (repliesToMessage) {
            fields.context = {
              message_id: repliesToMessage.providerMessageId,
            };
          }
          const response = await axios.post(metaUrl, fields, { headers });
          return response.data.messages[0].id;
        }
        if (repliesToMessage) {
          fields.quoted = {
            key: {
              remoteJid: primaryAddressingMode,
              fromMe: false,
              id: repliesToMessage.providerMessageId,
              type: repliesToMessage.type,
            },
            message: {
              conversation: clientChatMessage.textBody,
            },
          };
        }
      }

      if (apiType === 'MetaAPI') {
        const response = await axios.post(metaUrl, fields, { headers });
        return response.data.messages[0].id;
      }

      const response = await axios.post(baileysUrl, { fields });
      return response.data.messages[0].id;
    } catch (error) {
      throw new InternalServerErrorException(JSON.stringify(error, null, 2));
    }
  }

  async sendTemplateMessage(
    clientChatMessage: ClientChatMessage,
    workspaceId: string,
    providerIntegrationId: string,
  ) {
    const primaryAddressingMode = clientChatMessage.to
      .split('&')[0]
      .replace('primary=', '');
    const clientChat = await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatWorkspaceEntity>(
        workspaceId,
        'clientChat',
      )
    ).findOne({ where: { id: clientChatMessage.clientChatId } });
    if (!clientChat) {
      throw new Error('Client chat not found');
    }
    clientChatMessage.to = primaryAddressingMode;
    const integration = await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WhatsappIntegrationWorkspaceEntity>(
        workspaceId,
        'whatsappIntegration',
      )
    ).findOne({ where: { id: providerIntegrationId } });

    if (!integration) {
      throw new Error('WhatsApp integration not found');
    }

    const templates = await axios.get(
      `${this.META_API_URL}/${integration.businessAccountId}/message_templates`,
      {
        headers: {
          Authorization: `Bearer ${integration.accessToken}`,
        },
      },
    );

    const template = templates.data.data.find(
      (template: any) => template.name === clientChatMessage.templateName,
    );

    if (!template) {
      throw new Error('Template not found');
    }
    const message = {
      ...clientChatMessage,
      textBody: template.components
        .map((component: any) => component.text)
        .join(' '),
      type: ChatMessageType.TEXT,
      deliveryStatus: ChatMessageDeliveryStatus.DELIVERED,
    };

    await (
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ClientChatMessageWorkspaceEntity>(
        workspaceId,
        'clientChatMessage',
      )
    ).save(message);

    await this.clientChatMessageManagerService.publishMessageCreated(
      {
        ...message,
        createdAt: new Date().toISOString(),
      },
      clientChatMessage.clientChatId,
      workspaceId,
    );

    const fields: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: clientChat.providerContactId,
      type: 'template',
      template: {
        name: clientChatMessage.templateName,
        language: {
          code: clientChatMessage.templateLanguage,
        },
      },
    };

    const url = `${this.META_API_URL}/${integration.phoneId}/messages`;
    const headers = {
      Authorization: `Bearer ${integration.accessToken}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(url, fields, { headers });
      return response.data.messages[0].id;
    } catch (error) {
      const axiosErr = error as AxiosError<any>;
      const details = {
        status: axiosErr.response?.status,
        statusText: axiosErr.response?.statusText,
        data: axiosErr.response?.data,
        message: axiosErr.message,
      };
      throw new InternalServerErrorException(
        `Failed to send template message: ${JSON.stringify(details)}`,
      );
    }
  }
}
