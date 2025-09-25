/* eslint-disable @nx/workspace-rest-api-methods-should-be-guarded */
import { Body, Controller, Logger, Param, Post } from '@nestjs/common';

import axios from 'axios';

import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

import { FileUploadService } from 'src/engine/core-modules/file/file-upload/services/file-upload.service';
import { addCompanyFinancialClosingExecutionLog } from 'src/engine/core-modules/financial-closing/utils/financial-closing-utils';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CompanyFinancialClosingExecutionWorkspaceEntity } from 'src/modules/company-financial-closing-execution/standard-objects/company-financial-closing-execution.workspace-entity';
import {
    FocusNFeWebhookBody,
    FocusNFeWebhookBodyNFCom,
    FocusNFeWebhookBodyNFSe,
} from 'src/modules/focus-nfe/types/FocusNFeWebhookBody.type';
import { NfStatus } from 'src/modules/focus-nfe/types/NfStatus';
import { getNfTypeLabel, NfType } from 'src/modules/focus-nfe/types/NfType';
import { InvoiceWorkspaceEntity } from 'src/modules/invoice/standard-objects/invoice.workspace.entity';
import { Repository } from 'typeorm';

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

    this.logger.log(`BODY: ${JSON.stringify(body, null, 2)}`);

    const invoiceRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<InvoiceWorkspaceEntity>(
        workspaceId,
        'invoice',
        { shouldBypassPermissionChecks: true },
      );

    const invoice = await invoiceRepository.findOne({
      where: { id: body.ref },
      relations: ['company', 'companyFinancialClosingExecution'],
    });

    if (!invoice) {
      this.logger.warn(
        `Invoice with id (ref) ${body.ref} not found in workspace ${workspaceId}`,
      );

      this.logger.log(`NF NOT FOUND: ${body.ref}`);

      return;
    }

    // Buscar repositório para logs de execução da empresa
    let companyFinancialClosingExecutionsRepository:
      | Repository<CompanyFinancialClosingExecutionWorkspaceEntity>
      | undefined;
    if (invoice.companyFinancialClosingExecutionId) {
      companyFinancialClosingExecutionsRepository =
        (await this.twentyORMGlobalManager.getRepositoryForWorkspace<CompanyFinancialClosingExecutionWorkspaceEntity>(
          workspaceId,
          'companyFinancialClosingExecution',
          { shouldBypassPermissionChecks: true },
        )) as Repository<CompanyFinancialClosingExecutionWorkspaceEntity>;
    }

    if (body.status === 'erro_autorizacao') {
      invoice.nfStatus = NfStatus.DRAFT;

      this.logger.log(`NF erro_autorizacao: ${invoice.nfStatus}`);

      // Log de erro na execução da empresa
      if (
        invoice.companyFinancialClosingExecution &&
        companyFinancialClosingExecutionsRepository
      ) {
        await addCompanyFinancialClosingExecutionLog(
          invoice.companyFinancialClosingExecution,
          companyFinancialClosingExecutionsRepository,
          `Erro na autorização da nota fiscal (${getNfTypeLabel(invoice.nfType as NfType)}): ${body.status} ${body.mensagem_sefaz && ' - ' + body.mensagem_sefaz}`,
          'error',
        );
      }

      await invoiceRepository.save(invoice);

      return;
    }

    if (invoice.nfStatus === NfStatus.ISSUED) {
      this.logger.log(
        `NF ${invoice.id} já está emitida. Ignorando novo processamento de anexos.`,
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
        this.logger.log(`ENTROU NA NFCOM`);

        const nfcom = body as FocusNFeWebhookBodyNFCom;

        invoice.nfStatus = NfStatus.ISSUED;

        // Log de sucesso na execução da empresa
        if (
          invoice.companyFinancialClosingExecution &&
          companyFinancialClosingExecutionsRepository
        ) {
          await addCompanyFinancialClosingExecutionLog(
            invoice.companyFinancialClosingExecution,
            companyFinancialClosingExecutionsRepository,
            `Nota fiscal (${getNfTypeLabel(invoice.nfType as NfType)}) autorizada com sucesso`,
            'info',
            undefined,
            invoice.company ?? undefined,
            { completedInvoiceIssuance: true },
          );
        }

        if (nfcom.caminho_xml) {
          const xmlUrl = this.getXmlUrl(nfcom, 'url_danfcom');

          if (xmlUrl) {
            const xmlResponse = await axios.get(xmlUrl, {
              responseType: 'arraybuffer',
            });
            const xmlBuffer = Buffer.from(xmlResponse.data);
            const xmlFilename = `nfcom-${invoice.id}.xml`;

            const { files } = await this.fileUploadService.uploadFile({
              file: xmlBuffer,
              fileFolder: FileFolder.Invoice,
              workspaceId,
              filename: xmlFilename,
              mimeType: 'application/xml',
            });

            const path = this.extractFullPathFromFilePath(files[0].path);

            attachments.push(
              attachmentRepository.create({
                name: `XML NFCom - ${invoice.id}`,
                fullPath: path,
                type: 'application/xml',
                invoice: invoice,
              }),
            );
          } else {
            this.logger.log(
              `[${NfType.NFCOM}] Não foi possivel salvar o arquivo XML para a NF ${invoice.id}`,
            );

            // Log de aviso para XML não salvo
            if (
              invoice.companyFinancialClosingExecution &&
              companyFinancialClosingExecutionsRepository
            ) {
              await addCompanyFinancialClosingExecutionLog(
                invoice.companyFinancialClosingExecution,
                companyFinancialClosingExecutionsRepository,
                `Não foi possível salvar o arquivo XML da nota fiscal ${invoice.nfType}`,
                'warn',
                undefined,
                invoice.company ?? undefined,
              );
            }
          }
        }

        if (nfcom.caminho_danfecom) {
          const pdfResponse = await axios.get(nfcom.caminho_danfecom, {
            responseType: 'arraybuffer',
          });

          const pdfBuffer = Buffer.from(pdfResponse.data);
          const pdfFilename = `danfecom-${invoice.id}.pdf`;

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
              name: `DANFE-COM - ${invoice.id}`,
              fullPath: path,
              type: 'application/pdf',
              invoice: invoice,
            }),
          );
        }

        if (attachments.length > 0) {
          await attachmentRepository.save(attachments);

          // Log de sucesso para anexos salvos
          if (
            invoice.companyFinancialClosingExecution &&
            companyFinancialClosingExecutionsRepository
          ) {
            await addCompanyFinancialClosingExecutionLog(
              invoice.companyFinancialClosingExecution,
              companyFinancialClosingExecutionsRepository,
              `${attachments.length} anexo(s) da nota fiscal (${getNfTypeLabel(invoice.nfType as NfType)}) salvos com sucesso`,
              'info',
              undefined,
              invoice.company ?? undefined,
            );
          }
        }

        await invoiceRepository.save(invoice);

        this.logger.log(
          `[${NfType.NFCOM}] ref: ${invoice.id} - issued and attachments saved successfully`,
        );

        return;
      }

      if (type === NfType.NFSE) {
        const nfse = body as FocusNFeWebhookBodyNFSe;

        invoice.nfStatus = NfStatus.ISSUED;

        // Log de sucesso na execução da empresa
        if (
          invoice.companyFinancialClosingExecution &&
          companyFinancialClosingExecutionsRepository
        ) {
          await addCompanyFinancialClosingExecutionLog(
            invoice.companyFinancialClosingExecution,
            companyFinancialClosingExecutionsRepository,
            `Nota fiscal (${getNfTypeLabel(invoice.nfType as NfType)}) autorizada com sucesso`,
            'info',
            undefined,
            invoice.company ?? undefined,
            { completedInvoiceIssuance: true },
          );
        }

        if (nfse.numero_rps && nfse.data_emissao) {
          invoice.rpsNumber = nfse.numero_rps;
          invoice.issueDate = new Date(nfse.data_emissao).toISOString();
        }

        if (nfse.caminho_xml_nota_fiscal) {
          const xmlUrl = this.getXmlUrl(nfse, 'url_danfse');

          if (xmlUrl) {
            const xmlResponse = await axios.get(xmlUrl, {
              responseType: 'arraybuffer',
            });

            const xmlBuffer = Buffer.from(xmlResponse.data);
            const xmlFilename = `nfse-${invoice.id}.xml`;

            const { files } = await this.fileUploadService.uploadFile({
              file: xmlBuffer,
              fileFolder: FileFolder.Invoice,
              workspaceId,
              filename: xmlFilename,
              mimeType: 'application/xml',
            });

            const path = this.extractFullPathFromFilePath(files[0].path);

            attachments.push(
              attachmentRepository.create({
                name: `XML NFSe - ${invoice.id}`,
                fullPath: path,
                type: 'application/xml',
                invoice: { id: invoice.id } as any,
              }),
            );
          } else {
            this.logger.log(
              `[${NfType.NFSE}] Não foi possivel salvar o arquivo XML para a NF ${invoice.id}`,
            );

            // Log de aviso para XML não salvo
            if (
              invoice.companyFinancialClosingExecution &&
              companyFinancialClosingExecutionsRepository
            ) {
              await addCompanyFinancialClosingExecutionLog(
                invoice.companyFinancialClosingExecution,
                companyFinancialClosingExecutionsRepository,
                `Não foi possível salvar o arquivo XML da nota fiscal ${invoice.nfType}`,
                'warn',
                undefined,
                invoice.company ?? undefined,
              );
            }
          }
        }

        if (nfse.url_danfse) {
          const pdfResponse = await axios.get(nfse.url_danfse, {
            responseType: 'arraybuffer',
          });

          const pdfBuffer = Buffer.from(pdfResponse.data);
          const pdfFilename = `danfse-${invoice.id}.pdf`;

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
              name: `DANFESe - ${invoice.id}`,
              fullPath: path,
              type: 'application/pdf',
              invoice: { id: invoice.id } as any,
            }),
          );
        }

        if (attachments.length > 0) {
          await attachmentRepository.save(attachments);

          // Log de sucesso para anexos salvos
          if (
            invoice.companyFinancialClosingExecution &&
            companyFinancialClosingExecutionsRepository
          ) {
            await addCompanyFinancialClosingExecutionLog(
              invoice.companyFinancialClosingExecution,
              companyFinancialClosingExecutionsRepository,
              `${attachments.length} anexo(s) da nota fiscal (${getNfTypeLabel(invoice.nfType as NfType)}) salvos com sucesso`,
              'info',
              undefined,
              invoice.company ?? undefined,
            );
          }
        }

        await invoiceRepository.save(invoice);

        return;
      }
    }
  }

  private extractFullPathFromFilePath(path: string) {
    const matchRegex = /([^?]+)/;

    return path.match(matchRegex)?.[1];
  }

  private getXmlUrl(
    nf: { caminho_xml_nota_fiscal?: string; [key: string]: any },
    urlField: 'url_danfse' | 'url_danfcom',
  ): string | null {
    if (!nf.caminho_xml_nota_fiscal) return null;

    if (nf.caminho_xml_nota_fiscal.startsWith('http')) {
      return nf.caminho_xml_nota_fiscal;
    }

    const baseUrlString = nf[urlField];
    if (baseUrlString) {
      try {
        const baseUrl = new URL(baseUrlString);
        return `${baseUrl.origin}${nf.caminho_xml_nota_fiscal}`;
      } catch (e) {
        this.logger.error(`Erro ao extrair base URL de ${baseUrlString}: ${e}`);
        return null;
      }
    }

    return null;
  }
}
