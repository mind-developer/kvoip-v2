import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { TypeOrmQueryService } from '@ptc-org/nestjs-query-typeorm';
import { Repository } from 'typeorm';

import { InterConnection } from 'src/engine/core-modules/inter/integration/inter.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CreateInterIntegrationInput } from 'src/engine/core-modules/inter/integration/dtos/create-inter-integration';
import { UpdateInterIntegrationInput } from 'src/engine/core-modules/inter/integration/dtos/update-inter-integration';

@Injectable()
export class InterService extends TypeOrmQueryService<InterConnection> {
  constructor(
    @InjectRepository(InterConnection, 'core')
    private readonly interConnectionRepository: Repository<InterConnection>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {
    super(interConnectionRepository);
  }

  async create(
    createInput: CreateInterIntegrationInput,
  ): Promise<InterConnection> {
    const currentWorkspace = await this.workspaceRepository.findOne({
      where: { id: createInput.workspaceId },
    });

    if (!currentWorkspace) {
      throw new Error('Workspace not found');
    }

    const createdIntegration = this.interConnectionRepository.create({
      ...createInput,
      workspace: currentWorkspace,
    });

    await this.interConnectionRepository.save(createdIntegration);

    return createdIntegration;
  }

  async saveFileUrl(
    crtFileUrl: string,
    keyFileUrl: string,
    workspaceId: string,
  ): Promise<InterConnection> {
    const currentWorkspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!currentWorkspace) {
      throw new Error('Workspace not found');
    }

    const InterIntegration = this.interConnectionRepository.create({
      crtFileUrl,
      keyFileUrl,
      workspace: currentWorkspace,
    });

    return this.interConnectionRepository.save(InterIntegration);
  }

  async findAll(workspaceId: string): Promise<InterConnection[]> {
    const result = this.interConnectionRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
    });

    return result;
  }

  async findOneById(id: string): Promise<InterConnection | null> {
    return await this.interConnectionRepository.findOne({
      where: { id },
    });
  }

  async update(
    updateInput: UpdateInterIntegrationInput,
  ): Promise<InterConnection> {
    const interIntegration = await this.interConnectionRepository.findOne({
      where: { id: updateInput.id },
    });

    if (!interIntegration) {
      throw new Error('Integration not found');
    }

    const updatedIntegration = this.interConnectionRepository.create({
      ...interIntegration,
      ...updateInput,
    });

    await this.interConnectionRepository.save(updatedIntegration);

    return updatedIntegration;
  }

  async remove(id: string): Promise<boolean> {
    const interIntegration = await this.interConnectionRepository.findOne({
      where: { id: id },
    });

    if (!interIntegration) {
      throw new Error('Integration not found');
    }

    await this.interConnectionRepository.delete(interIntegration.id);

    return true;
  }
}
