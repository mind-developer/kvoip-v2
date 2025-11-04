import { SubscriptionPlanStatus } from 'src/modules/kvoip-admin/standard-objects/subscription-plan.workspace-entity';

export const translformDatabaseProductActiveToSubscriptonPlanStatus = (
  active: boolean,
) => (active ? SubscriptionPlanStatus.Active : SubscriptionPlanStatus.Inactive);
