import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CreateFinancialClosingInput } from './dtos/create-financial-closing.input';
import { UpdateFinancialClosingInput } from './dtos/update-financial-closing.input';
import { FinancialClosing } from './financial-closing.entity';

import { Logger } from '@nestjs/common';
import { RunFinancialClosingJob, RunFinancialClosingJobProcessor } from 'src/engine/core-modules/financial-closing/cron/jobs/run-financial-closing-processor.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { getAmountToBeChargedToCompanies, getCompaniesForFinancialClosing } from 'src/engine/core-modules/financial-closing/utils/financial-closing-utils';
import { InterApiService } from 'src/modules/charges/inter/services/inter-api.service';


export class FinancialClosingChargeService {
  private readonly logger = new Logger(FinancialClosingChargeService.name);

  constructor(
    // @InjectRepository(FinancialClosing, 'core')
    // private readonly financialClosingRepository: Repository<FinancialClosing>,

    // @InjectRepository(Workspace, 'core')
    // private readonly workspaceRepository: Repository<Workspace>,

    // @InjectMessageQueue(MessageQueue.cronQueue)
    // private readonly messageQueueService: MessageQueueService,

    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly interApiService: InterApiService,
  ) {}

  async test(): Promise<void> {

    this.logger.log(`SERVICE INTERNO EXECUTADO`);
  }


  // =============================================================================|
  // Private methods                                                              |
  // =============================================================================|

  // private getJobId(id: string): string {
  //   return `${RunFinancialClosingJobProcessor.name}::${id}`;
  // }
}
