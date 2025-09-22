import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'class-validator';
import { Repository } from 'typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class KvoipAdminService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  public async getKvoipAdminWorkspace() {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        featureFlags: {
          key: FeatureFlagKey.IS_KVOIP_ADMIN,
          value: true,
        },
      },
    });

    return workspace;
  }

  public async isKvoipAdminWorkspace(workspaceId: string) {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
        featureFlags: {
          key: FeatureFlagKey.IS_KVOIP_ADMIN,
          value: true,
        },
      },
    });

    return isDefined(workspace);
  }
}
