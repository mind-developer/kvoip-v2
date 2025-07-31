import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';

export const useIsWorkspaceKvoipAdmin = () => {
  return useIsFeatureEnabled(FeatureFlagKey.IS_KVOIP_ADMIN);
};
