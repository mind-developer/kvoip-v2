import { Module } from '@nestjs/common';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { InterModule } from 'src/engine/core-modules/inter/inter.module';
import { DevOnlyResolver } from 'src/engine/core-modules/kvoip-admin/dev-only/dev-only.resolver';

@Module({
  imports: [InterModule, FeatureFlagModule],
  providers: [DevOnlyResolver],
  exports: [DevOnlyResolver],
})
export class DevOnlyModule {}
