import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { CreateInterIntegrationInput } from 'src/engine/core-modules/inter/integration/dtos/create-inter-integration.input';
import { UpdateInterIntegrationInput } from 'src/engine/core-modules/inter/integration/dtos/update-inter-integration.input';
import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class InterIntegrationService {
  private readonly logger = new Logger(InterIntegrationService.name);

  constructor(
    @InjectRepository(InterIntegration, 'core')
    private interIntegrationRepository: Repository<InterIntegration>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async create(
    createInput: CreateInterIntegrationInput,
  ): Promise<InterIntegration> {
    this.logger.debug(
      `Creating integration for workspace ${createInput.workspaceId}`,
    );

    const workspace = await this.workspaceRepository.findOne({
      where: { id: createInput.workspaceId },
    });

    if (!workspace) {
      this.logger.warn(
        `Workspace with ID ${createInput.workspaceId} not found`,
      );
      throw new NotFoundException('Workspace not found');
    }

    const createIntegration = this.interIntegrationRepository.create({
      ...createInput,
      workspace,
      status: createInput.status ?? 'active',
    });

    const savedIntegration =
      await this.interIntegrationRepository.save(createIntegration);

    this.logger.log(`Created integration with ID ${savedIntegration.id}`);

    return savedIntegration;
  }

  async findAll(workspaceId: string): Promise<InterIntegration[]> {
    this.logger.debug(`Finding all integrations for workspace ${workspaceId}`);

    const integrations = await this.interIntegrationRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
    });

    this.logger.log(
      `Found ${integrations.length} integrations for workspace ${workspaceId}`,
    );

    return integrations.map((integration) => ({
      ...integration,
      status: this.getStatusFromExpirationDate(
        integration.expirationDate ?? new Date(),
      ),
    }));
  }

  async findById(id: string): Promise<InterIntegration | null> {
    this.logger.debug(`Finding integration with ID ${id}`);

    const integration = await this.interIntegrationRepository.findOne({
      where: { id },
      relations: ['workspace'],
    });

    if (!integration) {
      this.logger.warn(`Integration with ID ${id} not found`);
    } else {
      this.logger.log(`Found integration with ID ${id}`);
    }

    return integration;
  }

  async update(
    updateInput: UpdateInterIntegrationInput,
  ): Promise<InterIntegration> {
    this.logger.debug(`Updating integration with ID ${updateInput.id}`);

    const integration = await this.interIntegrationRepository.findOne({
      where: { id: updateInput.id },
    });

    if (!integration) {
      this.logger.warn(`Integration with ID ${updateInput.id} not found`);
      throw new NotFoundException('Integration not found');
    }

    const updatedIntegration = this.interIntegrationRepository.merge(
      integration,
      {
        ...updateInput,
        status: updateInput.status ?? integration.status,
      },
    );

    const saved =
      await this.interIntegrationRepository.save(updatedIntegration);

    this.logger.log(`Updated integration with ID ${saved.id}`);

    return saved;
  }

  async toggleStatus(id: string): Promise<InterIntegration> {
    this.logger.debug(`Toggling status for integration ID ${id}`);

    const integration = await this.findById(id);

    if (!integration) {
      this.logger.warn(`Integration with ID ${id} not found for status toggle`);
      throw new NotFoundException('Integration not found');
    }

    integration.status = this.getStatusFromExpirationDate(
      integration.expirationDate ?? new Date(),
    );

    const saved = await this.interIntegrationRepository.save(integration);

    this.logger.log(
      `Toggled status for integration ID ${saved.id} to ${saved.status}`,
    );

    return saved;
  }

  private getStatusFromExpirationDate(
    expirationDate: Date | null,
  ): 'Active' | 'Expired' | 'Disabled' {
    const now = new Date();

    if (!expirationDate) {
      this.logger.debug(
        'No expiration date provided, returning status: Disabled',
      );

      return 'Disabled';
    }

    const status = expirationDate > now ? 'Active' : 'Expired';

    this.logger.debug(`Calculated status based on expiration date: ${status}`);

    return status;
  }
}
