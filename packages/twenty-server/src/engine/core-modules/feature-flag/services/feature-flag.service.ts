import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';

@Injectable()
export class FeatureFlagService {
  constructor(
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  public async isFeatureEnabled(
    key: FeatureFlagKey,
    workspaceId: string,
  ): Promise<boolean> {
    const featureFlag = await this.featureFlagRepository.findOneBy({
      workspaceId,
      key,
      value: true,
    });

    return !!featureFlag?.value;
  }

  public async getWorkspaceFeatureFlags(
    workspaceId: string,
  ): Promise<FeatureFlagEntity[]> {
    return this.featureFlagRepository.find({ where: { workspaceId } });
  }

  public async getWorkspaceFeatureFlagsMap(
    workspaceId: string,
  ): Promise<FeatureFlagMap> {
    const workspaceFeatureFlags =
      await this.getWorkspaceFeatureFlags(workspaceId);

    const workspaceFeatureFlagsMap = workspaceFeatureFlags.reduce(
      (result, currentFeatureFlag) => {
        result[currentFeatureFlag.key] = currentFeatureFlag.value;

        return result;
      },
      {} as FeatureFlagMap,
    );

    return workspaceFeatureFlagsMap;
  }

  public async enableFeatureFlags(
    keys: FeatureFlagKey[],
    workspaceId: string,
  ): Promise<void> {
    await this.featureFlagRepository.upsert(
      keys.map((key) => ({ workspaceId, key, value: true })),
      {
        conflictPaths: ['workspaceId', 'key'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
  }

  public async upsertWorkspaceFeatureFlag({
    workspaceId,
    featureFlag,
    value,
    shouldBePublic = false,
  }: {
    workspaceId: string;
    featureFlag: FeatureFlagKey;
    value: boolean;
    shouldBePublic?: boolean;
  }): Promise<FeatureFlag> {
    if (shouldBePublic) {
      publicFeatureFlagValidator.assertIsPublicFeatureFlag(
        featureFlag,
        new FeatureFlagException(
          'Invalid feature flag key, flag is not public',
          FeatureFlagExceptionCode.INVALID_FEATURE_FLAG_KEY,
        ),
      );
    }

    featureFlagValidator.assertIsFeatureFlagKey(
      featureFlag,
      new FeatureFlagException(
        'Invalid feature flag key',
        FeatureFlagExceptionCode.INVALID_FEATURE_FLAG_KEY,
      ),
    );

    const upsertResult = await this.featureFlagRepository.upsert(
      {
        key: FeatureFlagKey[featureFlag],
        value,
        workspaceId: workspaceId,
      },
      {
        conflictPaths: ['workspaceId', 'key'],
        skipUpdateIfNoValuesChanged: true,
      },
    );

    return upsertResult.generatedMaps[0] as FeatureFlag;
  }
}
