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
import { NotaFiscalWorkspaceEntity } from 'src/modules/nota-fiscal/standard-objects/nota-fiscal.workspace.entity';
import { Repository } from 'typeorm';

@Controller('inter-integration')
export class InterIntegrationWebhookController {
  private readonly logger = new Logger(InterIntegrationWebhookController.name);

  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Post('/webhook/:workspaceId/:integrationId')
  async handleWebhook(
    @Param('workspaceId') workspaceId: string,
    @Param('integrationId') integrationId: string,
    @Body() body: any,
  ) {
    this.logger.log(
      `${integrationId} - Received incoming Inter Integration data ----------------------------------------|`,
    );

    this.logger.log(
      `BODY: ${JSON.stringify(body, null, 2)}`,
    );
  }
}
