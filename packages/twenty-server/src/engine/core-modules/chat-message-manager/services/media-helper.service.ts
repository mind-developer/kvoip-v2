/* @kvoip-woulz proprietary */
import { Injectable } from '@nestjs/common';
import { execFile as _execFile } from 'child_process';
import { ffmpegPath, ffprobePath } from 'ffmpeg-ffprobe-static';
import { constants, promises as fs } from 'fs';
import { access } from 'fs/promises';
import os from 'os';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ConvertedMedia {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

@Injectable()
export class MediaHelperService {
  private async getFfmpegPath(): Promise<string | null> {
    const systemFfmpeg = '/usr/bin/ffmpeg';
    try {
      await access(systemFfmpeg, constants.F_OK);
      return systemFfmpeg;
    } catch {
      if (ffmpegPath) {
        try {
          await access(ffmpegPath, constants.F_OK);
          return ffmpegPath;
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  private async getFfprobePath(): Promise<string | null> {
    const systemFfprobe = '/usr/bin/ffprobe';
    try {
      await access(systemFfprobe, constants.F_OK);
      return systemFfprobe;
    } catch {
      if (ffprobePath) {
        try {
          await access(ffprobePath, constants.F_OK);
          return ffprobePath;
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  async convertMediaForWhatsApp(
    buffer: Buffer,
    contentType: string,
    filename: string,
  ): Promise<ConvertedMedia> {
    const execFile = (await import('node:util')).promisify(_execFile);
    const resolvedFfmpegPath = await this.getFfmpegPath();
    const resolvedFfprobePath = await this.getFfprobePath();

    let convertedBuffer = buffer;
    let convertedContentType = contentType;
    let convertedFilename = filename;

    // Convert WebM to MP4 (video) or OGG (audio)
    const isWebmContent =
      contentType.includes('webm') ||
      filename.toLowerCase().endsWith('.webm');

    if (isWebmContent && resolvedFfmpegPath && resolvedFfprobePath) {
      const result = await this.convertWebm(
        convertedBuffer,
        convertedFilename,
        resolvedFfmpegPath,
        resolvedFfprobePath,
        execFile,
      );
      convertedBuffer = result.buffer;
      convertedContentType = result.contentType;
      convertedFilename = result.filename;
    }

    // Convert images to JPEG
    const filenameLower = convertedFilename.toLowerCase();
    const isImageByContentType =
      convertedContentType.startsWith('image/') &&
      !convertedContentType.includes('jpeg') &&
      !convertedContentType.includes('jpg');
    const isImageByExtension =
      (filenameLower.endsWith('.png') ||
        filenameLower.endsWith('.gif') ||
        filenameLower.endsWith('.webp') ||
        filenameLower.endsWith('.bmp') ||
        filenameLower.endsWith('.tiff') ||
        filenameLower.endsWith('.tif')) &&
      !filenameLower.endsWith('.jpg') &&
      !filenameLower.endsWith('.jpeg');
    const isImageContent = isImageByContentType || isImageByExtension;

    if (isImageContent && resolvedFfmpegPath) {
      const result = await this.convertImageToJpeg(
        convertedBuffer,
        convertedFilename,
        resolvedFfmpegPath,
        execFile,
      );
      convertedBuffer = result.buffer;
      convertedContentType = result.contentType;
      convertedFilename = result.filename;
    }

    return {
      buffer: convertedBuffer,
      contentType: convertedContentType,
      filename: convertedFilename,
    };
  }

  private async convertWebm(
    buffer: Buffer,
    filename: string,
    ffmpegPath: string,
    ffprobePath: string,
    execFile: (
      file: string,
      args: string[],
    ) => Promise<{ stdout: string; stderr: string }>,
  ): Promise<ConvertedMedia> {
    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `${uuidv4()}.webm`);
    await fs.writeFile(inputPath, buffer);

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
      const { stdout } = await execFile(ffprobePath, probeArgs);
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
      await execFile(ffmpegPath, ffmpegArgs);
      const converted = await fs.readFile(outputPath);
      return {
        buffer: converted,
        contentType: outputMime,
        filename: filename.replace(/\.webm$/i, outputExt),
      };
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

  private async convertImageToJpeg(
    buffer: Buffer,
    filename: string,
    ffmpegPath: string,
    execFile: (
      file: string,
      args: string[],
    ) => Promise<{ stdout: string; stderr: string }>,
  ): Promise<ConvertedMedia> {
    const tmpDir = os.tmpdir();
    const inputExt = path.extname(filename) || '.png';
    const inputPath = path.join(tmpDir, `${uuidv4()}${inputExt}`);
    await fs.writeFile(inputPath, buffer);

    const outputPath = path.join(tmpDir, `${uuidv4()}.jpg`);

    const ffmpegArgs = ['-i', inputPath, '-q:v', '2', '-y', outputPath];

    try {
      await execFile(ffmpegPath, ffmpegArgs);
      const converted = await fs.readFile(outputPath);
      return {
        buffer: converted,
        contentType: 'image/jpeg',
        filename: filename.replace(/\.[^.]+$/i, '.jpg'),
      };
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
}

