import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { InterConnection } from 'src/engine/core-modules/inter/integration/inter.entity';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { InterService } from 'src/engine/core-modules/inter/services/inter.service';
import { CreateInterIntegrationInput } from 'src/engine/core-modules/inter/integration/dtos/create-inter-integration';
import { UpdateInterIntegrationInput } from 'src/engine/core-modules/inter/integration/dtos/update-inter-integration';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => InterConnection)
export class InterResolver {
  constructor(
    @InjectRepository(InterConnection, 'core')
    private readonly interRepository: Repository<InterConnection>,
    private readonly fileService: FileService,
    private readonly interConnectionService: InterService,
  ) {}

  @Mutation(() => InterConnection)
  createInterIntegration(
    @Args('createInterIntegrationInput')
    createInterIntegrationInput: CreateInterIntegrationInput,
  ): Promise<InterConnection> {
    return this.interConnectionService.create(createInterIntegrationInput);
  }

  @Mutation(() => InterConnection)
  saveInterFileUrl(
    @Args('crtFileUrl')
    crtFileUrl: string,
    @Args('keyFileUrl')
    keyFileUrl: string,
    @Args('workspaceId')
    workspaceId: string,
  ) {
    return this.interConnectionService.saveFileUrl(
      crtFileUrl,
      keyFileUrl,
      workspaceId,
    );
  }

  @Query(() => [InterConnection])
  getAllInterIntegrations(
    @Args('workspaceId')
    workspaceId: string,
  ) {
    return this.interConnectionService.findAll(workspaceId);
  }

  @Query(() => InterConnection)
  getInterIntegrationById(
    @Args('id')
    id: string,
  ) {
    return this.interConnectionService.findById(id);
  }

  @Mutation(() => InterConnection)
  updateInterIntegration(
    @Args('updateInterIntegrationInput')
    updateInterIntegrationInput: UpdateInterIntegrationInput,
  ) {
    return this.interConnectionService.update(updateInterIntegrationInput);
  }

  @Mutation(() => Boolean)
  removeInterIntegration(
    @Args('id')
    id: string,
  ) {
    return this.interConnectionService.remove(id);
  }
}
