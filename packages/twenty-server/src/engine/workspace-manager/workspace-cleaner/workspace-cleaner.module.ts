import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { CleanInactiveWorkspacesCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/clean-inactive-workspaces.command';
import { StartCleanInactiveWorkspacesCronCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/start-clean-inactive-workspaces.cron.command';
import { StopCleanInactiveWorkspacesCronCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/stop-clean-inactive-workspaces.cron.command';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { DeleteWorkspacesCommand } from 'src/engine/workspace-manager/workspace-cleaner/commands/delete-workspaces.command';
import { CleanerWorkspaceService } from 'src/engine/workspace-manager/workspace-cleaner/services/cleaner.workspace-service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, BillingSubscription], 'core'),
    WorkspaceModule,
    DataSourceModule,
    UserVarsModule,
    UserModule,
    EmailModule,
    BillingModule,
  ],
  providers: [
    DeleteWorkspacesCommand,
    CleanInactiveWorkspacesCommand,
    StartCleanInactiveWorkspacesCronCommand,
    StopCleanInactiveWorkspacesCronCommand,
  ],
})
export class WorkspaceCleanerModule {}
