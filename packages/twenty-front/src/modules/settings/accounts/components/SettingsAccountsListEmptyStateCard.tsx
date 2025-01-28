import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useTriggerApisOAuth } from '@/settings/accounts/hooks/useTriggerApiOAuth';
import styled from '@emotion/styled';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  IconGoogle,
  IconMicrosoft,
} from 'twenty-ui';

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

  const { t } = useTranslation();

  return (
    <Card>
      <StyledHeader>{label || t('noConnectedAccount')}</StyledHeader>
      <StyledBody>
        {currentWorkspace?.isGoogleAuthEnabled && (
          <Button
            Icon={IconGoogle}
            title={t('connectWithGoogle')}
            variant="secondary"
            onClick={() => triggerApisOAuth('google')}
          />
        )}
        {currentWorkspace?.isMicrosoftAuthEnabled && (
          <Button
            Icon={IconMicrosoft}
            title={t('connectWithMicrosoft')}
            variant="secondary"
            onClick={() => triggerApisOAuth('microsoft')}
          />
        )}
      </StyledBody>
    </Card>
  );
};
