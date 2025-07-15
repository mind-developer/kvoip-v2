/* eslint-disable @nx/workspace-rest-api-methods-should-be-guarded */
import { Body, Controller, Logger, Param, Post } from '@nestjs/common';

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

    console.log(body);

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

      return;
    }

    if (body.status === 'erro_autorizacao') {
      notaFiscal.nfStatus = NfStatus.DRAFT;

      await notaFiscalRepository.save(notaFiscal);

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

      if (type === NfType.NFCOM) {
        const nfcom = body as FocusNFeWebhookBodyNFCom;

        notaFiscal.nfStatus = NfStatus.ISSUED;

        if (nfcom.caminho_xml) {
          attachments.push(
            attachmentRepository.create({
              name: `XML NFCom - ${notaFiscal.id}`,
              fullPath: nfcom.caminho_xml,
              type: 'application/xml',
              notaFiscal: notaFiscal,
            }),
          );
        }

        if (nfcom.caminho_danfecom) {
          attachments.push(
            attachmentRepository.create({
              name: `DANFE-COM - ${notaFiscal.id}`,
              fullPath: nfcom.caminho_danfecom,
              type: 'application/pdf',
              notaFiscal: notaFiscal,
            }),
          );
        }

        if (attachments.length > 0) {
          await attachmentRepository.save(attachments);
        }

        await notaFiscalRepository.save(notaFiscal);

        this.logger.log(
          `[${NfType.NFCOM}] ref: ${notaFiscal.id} - issued and attachments saved successfully`,
        );

        return;
      }

      if (type === NfType.NFSE) {
        const nfse = body as FocusNFeWebhookBodyNFSe;

        notaFiscal.nfStatus = NfStatus.ISSUED;

        if (nfse.caminho_xml_nota_fiscal) {
          attachments.push(
            attachmentRepository.create({
              name: `NFSe XML - ${notaFiscal.id}`,
              fullPath: nfse.caminho_xml_nota_fiscal,
              type: 'application/xml',
              notaFiscal,
            }),
          );
        }

        await notaFiscalRepository.save(notaFiscal);

        if (attachments.length > 0) {
          await attachmentRepository.save(attachments);
        }

        this.logger.log(
          `[${NfType.NFSE}] ref: ${notaFiscal.id} - issued and attachments saved successfully`,
        );

        return;
      }
    }
  }
}
