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


export class FinancialClosingService {
  private readonly logger = new Logger(FinancialClosingService.name);

  constructor(
    @InjectRepository(FinancialClosing, 'core')
    private readonly financialClosingRepository: Repository<FinancialClosing>,

    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,

    @InjectMessageQueue(MessageQueue.cronQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  // async create(createInput: CreateFinancialClosingInput): Promise<FinancialClosing> {
  //   const workspace = await this.workspaceRepository.findOne({
  //     where: { id: createInput.workspaceId },
  //   });

  //   if (!workspace) {
  //     throw new Error('Workspace not found');
  //   }

  //   const created = this.financialClosingRepository.create({
  //     ...createInput,
  //     workspace,
  //   });

  //   const saved = await this.financialClosingRepository.save(created);

  //   return saved;
  // }

  async create(createInput: CreateFinancialClosingInput): Promise<FinancialClosing> {
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

    this.logger.log(`Registrando fechemento financeiro para o workspace ${workspace.id} com ID ${saved.id} ----------------------------|`);
    
    // Teste
    const date = new Date();
    const hours2 = date.getHours();
    const minutes2 = date.getMinutes();
    const seconds2 = date.getSeconds();
    this.logger.log(`Horário atual: ${hours2}:${minutes2}:${seconds2}`);
    
    const minutes = createInput.time.split(':')[1];
    const hours   = createInput.time.split(':')[0];
    const day     = createInput.day;

    const pattern = `${minutes} ${hours} ${day} * *`;
    const jobId = `${RunFinancialClosingJobProcessor.name}::${saved.id}`;

    await this.messageQueueService.addCron<RunFinancialClosingJob>({
      // jobName: `${RunFinancialClosingJobProcessor.name}::${saved.id}`,
      jobName: `${RunFinancialClosingJobProcessor.name}`,
      jobId: jobId,
      data: {
        financialClosingId: saved.id,
        workspaceId: workspace.id,
      },
      options: {
        repeat: {
          pattern,
        },
      },
    });

    this.logger.log(`Job de fechamento financeiro agendado: ${RunFinancialClosingJobProcessor.name}::${saved.id} com padrão cron: ${pattern}`);

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

  async update(updateInput: UpdateFinancialClosingInput): Promise<FinancialClosing> {
    const entity = await this.financialClosingRepository.findOne({
      where: { id: updateInput.id },
      relations: ['workspace'],
    });

    if (!entity) {
      throw new Error(`Financial closing not found`);
    }

    const updated = {
      ...entity,
      ...updateInput,
    };

    return this.financialClosingRepository.save(updated);
  }

  // async delete(id: string): Promise<boolean> {
  //   const entity = await this.financialClosingRepository.findOne({
  //     where: { id },
  //   });

  //   if (entity) {
  //     const { affected } = await this.financialClosingRepository.delete(id);

  //     if (!affected) {
  //       throw new BadRequestException(undefined, {
  //         description: `Error when removing financial closing ${entity.name}`,
  //       });
  //     }

  //     return true;
  //   }

  //   throw new BadRequestException(undefined, {
  //     description: `Financial closing not found with id ${id}`,
  //   });
  // }

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

    const jobId = `${RunFinancialClosingJobProcessor.name}::${entity.id}`;

    await this.messageQueueService.removeCron({
      jobName: RunFinancialClosingJobProcessor.name,
      jobId,
    });

    this.logger.log(`Job de fechamento financeiro removido: ${jobId}`);

    const { affected } = await this.financialClosingRepository.delete(id);

    if (!affected) {
      throw new BadRequestException(undefined, {
        description: `Error when removing financial closing ${entity.name}`,
      });
    }

    return true;
  }
}
