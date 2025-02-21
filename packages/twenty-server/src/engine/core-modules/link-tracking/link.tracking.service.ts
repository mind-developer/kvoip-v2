import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { nanoid } from 'nanoid';
import { Repository } from 'typeorm';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

import { LinkTrackingIntegration } from './link.tracking.entity';

import { CreateLinkTrackingIntegrationInput } from './dtos/create-link-tracking.integration.input';
import { UpdateLinkTrackingIntegrationInput } from './dtos/update-link-tracking-integration.input';

@Injectable()
export class LinkTrackingService {
  constructor(
    @InjectRepository(LinkTrackingIntegration, 'core')
    private linkTrackingRepository: Repository<LinkTrackingIntegration>,

    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async create(
    createInput: CreateLinkTrackingIntegrationInput,
  ): Promise<LinkTrackingIntegration> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: createInput.workspaceId },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const newLinkTracking = this.linkTrackingRepository.create({
      ...createInput,
      generated_url: nanoid(12),
      created_at: new Date(),
      updated_at: new Date(),
    });

    return this.linkTrackingRepository.save(newLinkTracking);
  }

  async findAll(workspaceId: string): Promise<LinkTrackingIntegration[]> {
    return this.linkTrackingRepository.find({
      where: { campaign_source: workspaceId },
    });
  }

  async findById(id: string): Promise<LinkTrackingIntegration | null> {
    return this.linkTrackingRepository.findOne({ where: { id } });
  }

  async update(
    updateInput: UpdateLinkTrackingIntegrationInput,
  ): Promise<LinkTrackingIntegration> {
    const linkTracking = await this.findById(updateInput.id);

    if (!linkTracking) {
      throw new Error('Link tracking entry not found');
    }

    Object.assign(linkTracking, updateInput, { updated_at: new Date() });

    return this.linkTrackingRepository.save(linkTracking);
  }
}
