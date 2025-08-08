import { Module } from '@nestjs/common';

import { UpdateWorkspacesMebersCountListener } from 'src/engine/core-modules/kvoip-admin/standard-objects/workspaces/listeners/update-workspaces-members-count.listener';
import { WorkspacesService } from 'src/engine/core-modules/kvoip-admin/standard-objects/workspaces/services/workspaces.service';
import { WorkspaceSubscriber } from 'src/engine/core-modules/kvoip-admin/standard-objects/workspaces/subscribers/worskspace.subsciber';

@Module({
  providers: [
    UpdateWorkspacesMebersCountListener,
    WorkspaceSubscriber,
    WorkspacesService,
  ],
  exports: [WorkspacesService],
})
export class KvoipAdminStandardObjectModule {}
