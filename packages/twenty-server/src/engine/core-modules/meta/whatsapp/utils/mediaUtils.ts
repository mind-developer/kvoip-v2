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
    ['IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'STICKER'].includes(msg.type) &&
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

export const extractMediaId = (
  msg: any,
): { id: string; mimeType: string; fileExtension: string } | undefined => {
  const msgType = msg.type.toUpperCase();

  switch (msgType) {
    case 'IMAGE':
      return {
        id: msg.image.id,
        mimeType: msg.image.mime_type || 'image/jpeg',
        fileExtension: '.jpg',
      };
    case 'AUDIO':
      return {
        id: msg.audio.id,
        mimeType: msg.audio.mime_type || 'audio/mpeg',
        fileExtension: '.mp3',
      };
    case 'DOCUMENT':
      return {
        id: msg.document.id,
        mimeType: msg.document.mime_type || 'application/pdf',
        fileExtension: '.pdf',
      };
    case 'VIDEO':
      return {
        id: msg.video.id,
        mimeType: msg.video.mime_type || 'video/mp4',
        fileExtension: '.mp4',
      };
    case 'STICKER':
      return {
        id: msg.sticker.id,
        mimeType: msg.sticker.mime_type || 'image/webp',
        fileExtension: '.webp',
      };
    default:
      return undefined;
  }
};
