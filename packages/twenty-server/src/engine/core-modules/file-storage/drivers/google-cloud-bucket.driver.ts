import { Bucket, File, Storage } from '@google-cloud/storage';
import fs from 'fs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { StorageDriver } from 'src/engine/core-modules/file-storage/drivers/interfaces/storage-driver.interface';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

export class GoogleCloudBucketDriver implements StorageDriver {
  storage: Storage;
  bucket: Bucket;

  constructor(
    private projectId: string,
    private keyFilename: string,
    private bucketName: string,
  ) {
    this.storage = new Storage({
      projectId: this.projectId,
      keyFilename: this.keyFilename,
    });
    this.bucket = this.storage.bucket(this.bucketName);
  }

  async write(params: {
    file: Buffer | Uint8Array | string;
    name: string;
    folder: string;
    mimeType: string | undefined;
  }): Promise<void> {
    await this.bucket
      .file(`${params.folder}/${params.name}`)
      .save(params.file, { contentType: params.mimeType });
  }

  async move(params: {
    from: { folderPath: string; filename: string };
    to: { folderPath: string; filename: string };
  }): Promise<void> {
    await this.bucket
      .file(`${params.from.folderPath}/${params.from.filename}`)
      .move(`${params.to.folderPath}/${params.to.filename}`);
  }

  extractFolderAndFilePaths(file: File) {
    const result = /(?<folderPath>.*)\/(?<filename>.*)/.exec(
      file.baseUrl ?? '',
    );
    const fromFolderPath = result?.groups?.folderPath;
    const filename = result?.groups?.folderPath;
    return { fromFolderPath, filename };
  }

  async copy(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    const { from, to } = params;
    if (!from.filename && to.filename) {
      throw new Error('Cannot copy folder to file');
    }
    if (from.filename) {
      await this.bucket
        .file(`${from.folderPath}/${from.filename}`)
        .copy(`${to.folderPath}/${to.filename}`);
      return;
    }
    const [files] = await this.bucket.getFiles({
      prefix: from.folderPath,
    });
    for (const file of files) {
      const { fromFolderPath, filename } = this.extractFolderAndFilePaths(file);
      const toFolderPath = fromFolderPath?.replace(
        params.from.folderPath,
        params.to.folderPath,
      );
      if (!fromFolderPath || !filename || !toFolderPath) continue;
      await this.copy({
        from: {
          folderPath: fromFolderPath,
          filename,
        },
        to: { folderPath: toFolderPath, filename },
      });
    }
    return;
  }

  async delete(params: {
    folderPath: string;
    filename?: string;
  }): Promise<void> {
    if (!params.filename) {
      await this.bucket.deleteFiles({ prefix: params.folderPath });
      return;
    }
    await this.bucket.file(`${params.folderPath}/${params.filename}`).delete();
    return;
  }

  async read(params: {
    folderPath: string;
    filename: string;
  }): Promise<Readable> {
    return this.bucket
      .file(`${params.folderPath}/${params.filename}`)
      .createReadStream();
  }

  async download(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void> {
    if (params.from.filename) {
      try {
        const dir = params.to.folderPath;

        await mkdir(dir, { recursive: true });

        const fileStream = await this.read({
          folderPath: params.from.folderPath,
          filename: params.from.filename,
        });

        const toPath = join(
          params.to.folderPath,
          params.to.filename || params.from.filename,
        );

        await pipeline(fileStream, fs.createWriteStream(toPath));

        return;
      } catch (error) {
        if (error.name === 'NotFound') {
          throw new FileStorageException(
            'File not found',
            FileStorageExceptionCode.FILE_NOT_FOUND,
          );
        }
        throw error;
      }
    }
    const [files] = await this.bucket.getFiles({
      prefix: params.from.folderPath,
    });
    if (files.length === 0) return;
    for (const file of files) {
      const { fromFolderPath, filename } = this.extractFolderAndFilePaths(file);

      const toFolderPath = fromFolderPath?.replace(
        params.from.folderPath,
        params.to.folderPath,
      );

      if (!fromFolderPath || !filename || !toFolderPath) continue;

      await this.download({
        from: {
          folderPath: fromFolderPath,
          filename,
        },
        to: { folderPath: toFolderPath, filename },
      });
    }
    return;
  }

  async checkFileExists(params: {
    folderPath: string;
    filename: string;
  }): Promise<boolean> {
    return !!this.bucket.file(`${params.folderPath}/${params.filename}`).get();
  }
}
