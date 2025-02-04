import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/admin-panel-health.service';
import { AdminPanelResolver } from 'src/engine/core-modules/admin-panel/admin-panel.resolver';
import { AdminPanelService } from 'src/engine/core-modules/admin-panel/admin-panel.service';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { User } from 'src/engine/core-modules/user/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Workspace, FeatureFlagEntity], 'core'),
    AuthModule,
    DomainManagerModule,
    HealthModule,
    RedisClientModule,
    TerminusModule,
    FeatureFlagModule,
  ],
  providers: [AdminPanelResolver, AdminPanelService, AdminPanelHealthService],
  exports: [AdminPanelService],
})
export class AdminPanelModule {}
