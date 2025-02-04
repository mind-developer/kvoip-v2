import { isGoogleCalendarEnabledState } from '@/client-config/states/isGoogleCalendarEnabledState';
import { isGoogleMessagingEnabledState } from '@/client-config/states/isGoogleMessagingEnabledState';
import { isMicrosoftCalendarEnabledState } from '@/client-config/states/isMicrosoftCalendarEnabledState';
import { isMicrosoftMessagingEnabledState } from '@/client-config/states/isMicrosoftMessagingEnabledState';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { ConnectedAccountProvider } from 'twenty-shared';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  IconGoogle,
  IconMicrosoft,
} from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';

const StyledHeader = styled(CardHeader)`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(6)};
`;

const StyledBody = styled(CardContent)`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type SettingsAccountsListEmptyStateCardProps = {
  label?: string;
};

export const SettingsAccountsListEmptyStateCard = ({
  label,
}: SettingsAccountsListEmptyStateCardProps) => {
  const { triggerApisOAuth } = useTriggerApisOAuth();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const isMicrosoftSyncEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsMicrosoftSyncEnabled,
  );

  const isGoogleMessagingEnabled = useRecoilValue(
    isGoogleMessagingEnabledState,
  );
  const isMicrosoftMessagingEnabled = useRecoilValue(
    isMicrosoftMessagingEnabledState,
  );

  const isGoogleCalendarEnabled = useRecoilValue(isGoogleCalendarEnabledState);

  const isMicrosoftCalendarEnabled = useRecoilValue(
    isMicrosoftCalendarEnabledState,
  );

  return (
    <Card>
      <StyledHeader>{label || 'No connected account'}</StyledHeader>
      <StyledBody>
        {(isGoogleMessagingEnabled || isGoogleCalendarEnabled) && (
          <Button
            Icon={IconGoogle}
            title="Connect with Google"
            variant="secondary"
            onClick={() => triggerApisOAuth(ConnectedAccountProvider.GOOGLE)}
          />
        )}
        {isMicrosoftSyncEnabled && currentWorkspace?.isMicrosoftAuthEnabled && (
          <Button
            Icon={IconMicrosoft}
            title="Connect with Microsoft"
            variant="secondary"
            onClick={() => triggerApisOAuth(ConnectedAccountProvider.MICROSOFT)}
          />
        )}
      </StyledBody>
    </Card>
  );
};
