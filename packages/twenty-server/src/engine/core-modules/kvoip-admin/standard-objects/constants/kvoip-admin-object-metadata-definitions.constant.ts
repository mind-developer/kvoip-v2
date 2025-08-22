import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { OwnerWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/owner.workspace-entity';
import { SubscriptionPlanWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/subscription-plan.workspace-entity';
import { SubscriptionWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/subscriptions.workspace-entity';
import { TenantWorkspaceEntity } from 'src/modules/kvoip-admin/standard-objects/tenant.workspace-entity';

// Admin-specific objects that are only available in the kvoip admin workspace
export const KVOIP_ADMIN_OBJECT_METADATA_DEFINITIONS: (typeof BaseWorkspaceEntity)[] =
  [
    TenantWorkspaceEntity,
    OwnerWorkspaceEntity,
    SubscriptionWorkspaceEntity,
    SubscriptionPlanWorkspaceEntity,
  ];
