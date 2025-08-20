import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { KVOIP_ADMIN_WORKSPACE } from 'src/engine/core-modules/kvoip-admin/standard-objects/prefill-data/kvoip-admin-workspace';

export const KVOIP_ADMIN_FEATURE_FLAGS = [
  {
    key: FeatureFlagKey.IS_AIRTABLE_INTEGRATION_ENABLED,
    workspaceId: KVOIP_ADMIN_WORKSPACE.id,
    value: false,
  },
  {
    key: FeatureFlagKey.IS_POSTGRESQL_INTEGRATION_ENABLED,
    workspaceId: KVOIP_ADMIN_WORKSPACE.id,
    value: false,
  },
  {
    key: FeatureFlagKey.IS_UNIQUE_INDEXES_ENABLED,
    workspaceId: KVOIP_ADMIN_WORKSPACE.id,
    value: false,
  },
  {
    key: FeatureFlagKey.IS_STRIPE_INTEGRATION_ENABLED,
    workspaceId: KVOIP_ADMIN_WORKSPACE.id,
    value: false,
  },
  {
    key: FeatureFlagKey.IS_AI_ENABLED,
    workspaceId: KVOIP_ADMIN_WORKSPACE.id,
    value: true,
  },
  {
    key: FeatureFlagKey.IS_KVOIP_ADMIN,
    workspaceId: KVOIP_ADMIN_WORKSPACE.id,
    value: true,
  },
];
