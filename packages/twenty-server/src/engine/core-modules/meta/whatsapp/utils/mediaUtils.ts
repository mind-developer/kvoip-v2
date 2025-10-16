import { InternalServerErrorException } from '@nestjs/common';
import { FileMetadataService } from 'src/engine/core-modules/file/services/file-metadata.service';
import { FileService } from 'src/engine/core-modules/file/services/file.service';

export type Base64MediaInfo = {
  isBase64Media: boolean;
  base64String: string;
  mimeType: string;
};

export type ProcessedMediaResult = {
  fileUrl: string | null;
  mediaId?: string;
};

/**
 * Extracts base64 media information from a WhatsApp message
 */
export const extractBase64MediaInfo = (msg: any): Base64MediaInfo => {
  const isBase64Media =
    ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT'].includes(msg.type) &&
    msg.type &&
    msg[msg.type.toLowerCase()].base64;

  const base64String = isBase64Media ? msg[msg.type.toLowerCase()].base64 : '';

  const mimeType = isBase64Media
    ? msg[msg.type.toLowerCase()].mime_type || 'application/octet-stream'
    : '';

  return {
    isBase64Media,
    base64String,
    mimeType,
  };
};

/**
 * Processes base64 media and creates a file URL
 */
export const processBase64Media = async (
  base64String: string,
  mimeType: string,
  workspaceId: string,
  fileMetadataService: FileMetadataService,
  fileService: FileService,
): Promise<Buffer<ArrayBuffer>> => {
  try {
    const cleanBase64 = base64String.replace('data:', '').split(',')[1];
    const buffer = Buffer.from(cleanBase64, 'base64');

    let ext = mimeType.split('/')[1].split(';')[0].replace('jpeg', 'jpg');
    ext = '.' + ext;

    return buffer;
  } catch (err) {
    throw new InternalServerErrorException(
      'Error saving base64 media: ' + (err?.message || err),
    );
  }
};

export const extractMediaId = (msg: any): string | undefined => {
  const msgType = msg.type.toUpperCase();

  switch (msgType) {
    case 'IMAGE':
      return msg.image.id;
    case 'AUDIO':
      return msg.audio.id;
    case 'DOCUMENT':
      return msg.document.id;
    case 'VIDEO':
      return msg.video.id;
    default:
      return undefined;
  }
};
