import { UseGuards } from '@nestjs/common';
import { Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'cloudflare/resources';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { InterConnection } from 'src/engine/core-modules/inter/inter.entity';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { Repository } from 'typeorm';

@UseGuards(WorkspaceAuthGuard)
@Resolver(InterConnection)
export class InterResolver {
  constructor(
    @InjectRepository(User, 'core')
    private readonly interRepository: Repository<InterConnection>,
    private readonly fileService: FileService,
  ) {}
}
