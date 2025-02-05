import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { SettingsIntegrationDatabaseConnectionSyncStatus } from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseConnectionSyncStatus';
import { SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import { SettingsPath } from '@/types/SettingsPath';
import styled from '@emotion/styled';
import { IconChevronRight, LightIconButton } from 'twenty-ui';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledDatabaseLogoContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

const StyledDatabaseLogo = styled.img`
  height: 100%;
`;

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

// TODO: Replace to type from backend
type MOCK_InterDatabaseConnectionItem = {
  id: string;
  label: string;
  options: {
    clientId: string;
    clientSecret: string;
    keyCertificateFileUrl: string;
  };
};

interface SettingsIntegrationInterDatabaseConectionsListCardProps {
  integration: SettingsIntegration;
  connections: MOCK_InterDatabaseConnectionItem[];
}

export const SettingsIntegrationInterDatabaseConectionsListCard = ({
  connections,
  integration,
}: SettingsIntegrationInterDatabaseConectionsListCardProps) => {
  const navigate = useNavigateSettings();

  return (
    <SettingsListCard
      items={connections}
      RowIcon={() => (
        <StyledDatabaseLogoContainer>
          <StyledDatabaseLogo alt="Inter logo" src={integration.from.image} />
        </StyledDatabaseLogoContainer>
      )}
      RowRightComponent={({ item: connection }) => (
        <StyledRowRightContainer>
          <SettingsIntegrationDatabaseConnectionSyncStatus
            connectionId={connection.id}
          />
          <LightIconButton Icon={IconChevronRight} accent="tertiary" />
        </StyledRowRightContainer>
      )}
      onRowClick={(connection) =>
        navigate(SettingsPath.IntegrationDatabaseConnection, {
          databaseKey: integration.from.key,
          connectionId: connection.id,
        })
      }
      getItemLabel={(connection) => connection.label}
      hasFooter
      footerButtonLabel="Add connection"
      onFooterButtonClick={() =>
        navigate(SettingsPath.IntegrationInterNewDatabaseConnection)
      }
    />
  );
};
