import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CreateFinancialClosingInput } from './dtos/create-financial-closing.input';
import { UpdateFinancialClosingInput } from './dtos/update-financial-closing.input';
import { FinancialClosing } from './financial-closing.entity';

import { Logger } from '@nestjs/common';
import {
  RunFinancialClosingJob,
  RunFinancialClosingJobProcessor,
} from 'src/engine/core-modules/financial-closing/cron/jobs/run-financial-closing-processor.job';
import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';

export class FinancialClosingService {
  private readonly logger = new Logger(FinancialClosingService.name);

  constructor(
    @InjectRepository(FinancialClosing)
    private readonly financialClosingRepository: Repository<FinancialClosing>,

    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,

    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,

    // private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async create(
    createInput: CreateFinancialClosingInput,
  ): Promise<FinancialClosing> {

    const workspace = await this.workspaceRepository.findOne({
      where: { id: createInput.workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const created = this.financialClosingRepository.create({
      ...createInput,
      workspace,
    });

    const saved = await this.financialClosingRepository.save(created);

    const jobId = this.getJobId(saved.id);
    const pattern = this.getCronPattern(saved.time, saved.day);

    await this.scheduleCronJob(saved.id, workspace.id, jobId, pattern);

    return saved;
  }

  async findAll(workspaceId: string): Promise<FinancialClosing[]> {
    return await this.financialClosingRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
    });
  }

  async findById(id: string): Promise<FinancialClosing | null> {
    return await this.financialClosingRepository.findOne({
      where: { id },
      relations: ['workspace'],
    });
  }

  async update(
    updateInput: UpdateFinancialClosingInput,
  ): Promise<FinancialClosing> {
    const entity = await this.financialClosingRepository.findOne({
      where: { id: updateInput.id },
      relations: ['workspace'],
    });

    if (!entity) {
      throw new Error(`Financial closing not found`);
    }

    const jobId = this.getJobId(entity.id);

    const time = updateInput.time || entity.time;
    const day = updateInput.day || entity.day;

    const oldPattern = this.getCronPattern(entity.time, entity.day);
    const newPattern = this.getCronPattern(time, day);

    if (oldPattern !== newPattern) {
      await this.removeCronJob(jobId);
    }

    const updated = await this.financialClosingRepository.save({
      ...entity,
      ...updateInput,
    });

    if (oldPattern !== newPattern) {
      await this.scheduleCronJob(
        updated.id,
        updated.workspace.id,
        jobId,
        newPattern,
      );
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const entity = await this.financialClosingRepository.findOne({
      where: { id },
      relations: ['workspace'],
    });

    if (!entity) {
      throw new BadRequestException(undefined, {
        description: `Financial closing not found with id ${id}`,
      });
    }

    const jobId = this.getJobId(entity.id);

    await this.removeCronJob(jobId);
    this.logger.log(`Job removido (delete): ${jobId}`);

    const { affected } = await this.financialClosingRepository.delete(id);

    if (!affected) {
      throw new BadRequestException(undefined, {
        description: `Error when removing financial closing ${entity.name}`,
      });
    }

    return true;
  }

  // =============================================================================|
  // Private methods                                                              |
  // =============================================================================|

  private getCronPattern(time: string, day: number): string {
    const [hours, minutes] = this.parseTime(time);
    return `${minutes} ${hours} ${day} * *`;
  }

  private parseTime(time: string): [string, string] {
    const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!regex.test(time))
      throw new BadRequestException(`Invalid time format: ${time}`);
    const [hours, minutes] = time.split(':');
    return [hours, minutes];
  }

  private getJobId(id: string): string {
    return `${RunFinancialClosingJobProcessor.name}::${id}`;
  }

  private async scheduleCronJob(
    financialClosingId: string,
    workspaceId: string,
    jobId: string,
    pattern: string,
  ) {
    await this.messageQueueService.addCron<RunFinancialClosingJob>({
      jobName: RunFinancialClosingJobProcessor.name,
      jobId,
      data: { financialClosingId, workspaceId },
      options: { repeat: { pattern } },
    });

    this.logger.log(`Scheduled job: ${jobId} with cron pattern: ${pattern}`);
  }

  private async removeCronJob(jobId: string) {
    await this.messageQueueService.removeCron({
      jobName: RunFinancialClosingJobProcessor.name,
      jobId,
    });

    this.logger.log(`Job removed: ${jobId}`);
  }
}
