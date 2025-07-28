import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateFinancialClosingInput } from './dtos/create-financial-closing.input';
import { UpdateFinancialClosingInput } from './dtos/update-financial-closing.input';
import { FinancialClosing } from './financial-closing.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export class FinancialClosingService {
  constructor(
    @InjectRepository(FinancialClosing, 'core')
    private readonly financialClosingRepository: Repository<FinancialClosing>,

    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

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

  async delete(id: string): Promise<boolean> {
    const entity = await this.financialClosingRepository.findOne({
      where: { id },
    });

    if (entity) {
      const { affected } = await this.financialClosingRepository.delete(id);

      if (!affected) {
        throw new BadRequestException(undefined, {
          description: `Error when removing financial closing ${entity.name}`,
        });
      }

      return true;
    }

    throw new BadRequestException(undefined, {
      description: `Financial closing not found with id ${id}`,
    });
  }
}
