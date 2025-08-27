/* eslint-disable @nx/workspace-rest-api-methods-should-be-guarded */
import { Body, Controller, Logger, Param, Post } from '@nestjs/common';

import axios from 'axios';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import {
  FocusNFeWebhookBody,
  FocusNFeWebhookBodyNFCom,
  FocusNFeWebhookBodyNFSe,
} from 'src/modules/focus-nfe/types/FocusNFeWebhookBody.type';
import { NfStatus } from 'src/modules/focus-nfe/types/NfStatus';
import { NfType } from 'src/modules/focus-nfe/types/NfType';
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';

@Controller('focus-nfe')
export class FocusNfeController {
  private readonly logger = new Logger(FocusNfeController.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post('/webhook/:workspaceId/:integrationId/:type')
  async handleWebhook(
    @Param('workspaceId') workspaceId: string,
    @Param('integrationId') integrationId: string,
    @Param('type') type: string,
    @Body() body: FocusNFeWebhookBody,
  ) {
    this.logger.log(
      `[${type}] ${integrationId} - Received incoming Focus NFe data`,
    );

    const notaFiscalRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<NotaFiscalWorkspaceEntity>(
        workspaceId,
        'notaFiscal',
        { shouldBypassPermissionChecks: true },
    );

    const notaFiscal = await notaFiscalRepository.findOne({
      where: { id: body.ref },
    });

    if (!notaFiscal) {
      this.logger.warn(
        `Invoice with id (ref) ${body.ref} not found in workspace ${workspaceId}`,
      );

      this.logger.log(`NF NOT FOUND: ${body.ref}`);

      return;
    }

    if (body.status === 'erro_autorizacao') {
      notaFiscal.nfStatus = NfStatus.DRAFT;

      this.logger.log(`NF erro_autorizacao: ${notaFiscal.nfStatus}`);

      await notaFiscalRepository.save(notaFiscal);

      return;
    }

    if (notaFiscal.nfStatus === NfStatus.ISSUED) {
      this.logger.log(
        `NF ${notaFiscal.id} já está emitida. Ignorando novo processamento de anexos.`
      );
      return;
    }

    if (body.status === 'autorizado') {

      const attachmentRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<AttachmentWorkspaceEntity>(
          workspaceId,
          'attachment',
          { shouldBypassPermissionChecks: true },
        );

      const attachments: AttachmentWorkspaceEntity[] = [];

      this.logger.log(`type: ${type}`);

      if (type === NfType.NFCOM) {
        // const nfcom = body as FocusNFeWebhookBodyNFCom;

        // notaFiscal.nfStatus = NfStatus.ISSUED;

        // if (nfcom.caminho_xml) {
        //   const xmlResponse = await axios.get(nfcom.caminho_xml, {
        //     responseType: 'arraybuffer',
        //   });

        //   const xmlBuffer = Buffer.from(xmlResponse.data);
        //   const xmlFilename = `nfcom-${notaFiscal.id}.xml`;

        //   const { files } = await this.fileUploadService.uploadFile({
        //     file: xmlBuffer,
        //     fileFolder: FileFolder.Invoice,
        //     workspaceId,
        //     filename: xmlFilename,
        //     mimeType: 'application/xml',
        //   });

        //   const path = this.extractFullPathFromFilePath(files[0].path);

        //   attachments.push(
        //     attachmentRepository.create({
        //       name: `XML NFCom - ${notaFiscal.id}`,
        //       fullPath: path,
        //       type: 'application/xml',
        //       notaFiscal: notaFiscal,
        //     }),
        //   );
        // }

        // if (nfcom.caminho_danfecom) {
        //   const pdfResponse = await axios.get(nfcom.caminho_danfecom, {
        //     responseType: 'arraybuffer',
        //   });

        //   const pdfBuffer = Buffer.from(pdfResponse.data);
        //   const pdfFilename = `danfecom-${notaFiscal.id}.pdf`;

        //   const { files } = await this.fileUploadService.uploadFile({
        //     file: pdfBuffer,
        //     fileFolder: FileFolder.Invoice,
        //     workspaceId,
        //     filename: pdfFilename,
        //     mimeType: 'application/pdf',
        //   });

        //   const path = this.extractFullPathFromFilePath(files[0].path);

        //   attachments.push(
        //     attachmentRepository.create({
        //       name: `DANFE-COM - ${notaFiscal.id}`,
        //       fullPath: path,
        //       type: 'application/pdf',
        //       notaFiscal: notaFiscal,
        //     }),
        //   );
        // }

        // if (attachments.length > 0) {
        //   await attachmentRepository.save(attachments);
        // }

        // await notaFiscalRepository.save(notaFiscal);

      //   this.logger.log(
      //     `[${NfType.NFCOM}] ref: ${notaFiscal.id} - issued and attachments saved successfully`,
      //   );

      //   return;
      }

      if (type === NfType.NFSE) {

        const nfse = body as FocusNFeWebhookBodyNFSe;

        notaFiscal.nfStatus = NfStatus.ISSUED;

        if (nfse.numero_rps && nfse.data_emissao) {
          notaFiscal.numeroRps = nfse.numero_rps;
          notaFiscal.dataEmissao = new Date(nfse.data_emissao).toISOString();
        }

        if (nfse.caminho_xml_nota_fiscal) {

          const xmlUrl = this.getXmlUrl(nfse);

          if (xmlUrl) {
            const xmlResponse = await axios.get(xmlUrl, { responseType: 'arraybuffer' });

            const xmlBuffer = Buffer.from(xmlResponse.data);
            const xmlFilename = `nfse-${notaFiscal.id}.xml`;
  
            const { files } = await this.fileUploadService.uploadFile({
              file: xmlBuffer,
              fileFolder: FileFolder.Invoice,
              workspaceId,
              filename: xmlFilename,
              mimeType: 'application/xml',
            });
  
            const path = this.extractFullPathFromFilePath(files[0].path);
  
            this.logger.log(
              `[${NfType.NFSE}] CHEGOU AQUI: ${path}`,
            );
            
            attachments.push(
              attachmentRepository.create({
                name: `XML NFSe - ${notaFiscal.id}`,
                fullPath: path,
                type: 'application/xml',
                notaFiscal: { id: notaFiscal.id } as any,
              }),
            );
          } else {
            this.logger.log(
              `[${NfType.NFSE}] Não foi possivel salvar o arquivo XML para a NF ${notaFiscal.id}`,
            );
          }
        }

        if (nfse.url_danfse) {
          const pdfResponse = await axios.get(nfse.url_danfse, {
            responseType: 'arraybuffer',
          });

          const pdfBuffer = Buffer.from(pdfResponse.data);
          const pdfFilename = `danfse-${notaFiscal.id}.pdf`;

          const { files } = await this.fileUploadService.uploadFile({
            file: pdfBuffer,
            fileFolder: FileFolder.Invoice,
            workspaceId,
            filename: pdfFilename,
            mimeType: 'application/pdf',
          });

          const path = this.extractFullPathFromFilePath(files[0].path);

          attachments.push(
            attachmentRepository.create({
              name: `DANFESe - ${notaFiscal.id}`,
              fullPath: path,
              type: 'application/pdf',
              notaFiscal: { id: notaFiscal.id } as any,
            }),
          );
        }

        if (attachments.length > 0) {
          await attachmentRepository.save(attachments);
        }

        await notaFiscalRepository.save(notaFiscal);

        return;
      }
    }
  }

  private extractFullPathFromFilePath(path: string) {
    const matchRegex = /([^?]+)/;

    return path.match(matchRegex)?.[1];
  }

  private getXmlUrl(nfse: FocusNFeWebhookBodyNFSe): string | null {
    if (!nfse.caminho_xml_nota_fiscal) return null;
  
    // se já for URL completa
    if (nfse.caminho_xml_nota_fiscal.startsWith('http')) {
      return nfse.caminho_xml_nota_fiscal;
    }
  
    // se for só path, monta a partir do url_danfse
    if (nfse.url_danfse) {
      try {
        const baseUrl = new URL(nfse.url_danfse);
        return `${baseUrl.origin}${nfse.caminho_xml_nota_fiscal}`;
      } catch (e) {
        this.logger.error(`Erro ao extrair base URL de ${nfse.url_danfse}: ${e}`);
        return null;
      }
    }
  
    return null;
  }
}
