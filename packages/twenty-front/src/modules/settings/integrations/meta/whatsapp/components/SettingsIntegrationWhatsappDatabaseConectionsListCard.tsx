/* eslint-disable @nx/workspace-no-navigate-prefer-link */

/* eslint-disable unused-imports/no-unused-vars */
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SettingsSelectStatusPill } from '@/settings/integrations/meta/components/SettingsSelectStatusPill';
import { type SettingsIntegration } from '@/settings/integrations/types/SettingsIntegration';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useState } from 'react';
import { IconPencil, IconPlus, IconPointFilled, IconTrash } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { Card, CardFooter } from 'twenty-ui/layout';

type SettingsIntegrationWhatsappDatabaseConectionsListCardProps = {
  integration: SettingsIntegration;
};

enum ChangeType {
  DisableWhatsapp = 'DISABLE_WHATSAPP',
  DeleteWhatsapp = 'DELETE_WHATSAPP',
}

const StyledDatabaseLogo = styled.img`
  height: 100%;
  width: 16px;
`;

const StyledIntegrationsSection = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  flex-direction: column;
`;

const StyledCard = styled(Card)`
  background: ${({ theme }) => theme.background.secondary};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(0)};
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFooter = styled(CardFooter)`
  align-items: center;
  display: flex;
  padding: ${({ theme }) => theme.spacing(1)};
`;

const StyledButton = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  gap: ${({ theme }) => theme.spacing(2)};
  padding: 0 ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  cursor: pointer;
  display: flex;
  flex: 1 0 0;
  height: ${({ theme }) => theme.spacing(8)};
  width: 100%;

  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

export const CONFIRM_DISABLE_INBOX_MODAL_ID = 'confirm-disable-inbox-modal';
export const CONFIRM_DELETE_INBOX_MODAL_ID = 'confirm-delete-inbox-modal';

export const SettingsIntegrationWhatsappDatabaseConectionsListCard = ({
  integration,
}: SettingsIntegrationWhatsappDatabaseConectionsListCardProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const [changeType, setChangeType] = useState<ChangeType>();
  const [selectedIntegrationId, setSelectedIntegrationId] =
    useState<string>('');
  const [selectedIntegrationName, setSelectedIntegrationName] =
    useState<string>('');

  const { records: whatsappIntegrations } = useFindManyRecords({
    objectNameSingular: 'whatsappIntegration',
  });

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: 'whatsappIntegration',
  });

  const handleStatusIntegration = (integrationId: string) => {
    setChangeType(ChangeType.DisableWhatsapp);
    setSelectedIntegrationId(integrationId);
    openModal(CONFIRM_DISABLE_INBOX_MODAL_ID);
  };

  const handleDeleteIntegration = (
    integrationId: string,
    integrationName: string,
  ) => {
    setChangeType(ChangeType.DeleteWhatsapp);
    setSelectedIntegrationId(integrationId);
    setSelectedIntegrationName(integrationName);
    openModal(CONFIRM_DELETE_INBOX_MODAL_ID);
  };

  const handleConfirmChange = async () => {
    switch (changeType) {
      case ChangeType.DisableWhatsapp:
        // toggleWhatsappIntegrationDisable(selectedIntegrationId);
        // refetchWhatsapp();
        return;
      case ChangeType.DeleteWhatsapp:
        try {
          await deleteOneRecord(selectedIntegrationId);
          closeModal(CONFIRM_DELETE_INBOX_MODAL_ID);
        } catch (error) {
          console.error('Error deleting integration:', error);
        }
        return;
      default:
        return;
    }
  };

  const handleEditIntegration = (integrationId: string) => {
    navigate(`/settings/integrations/whatsapp/${integrationId}/edit`);
  };

  return (
    <>
      <StyledIntegrationsSection>
        {whatsappIntegrations.length > 0 && (
          <>
            {whatsappIntegrations.map((whatsappIntegration) => (
              <StyledCard key={whatsappIntegration.id}>
                <StyledDiv>
                  <StyledDatabaseLogo
                    alt={whatsappIntegration.name}
                    src={integration.from.image}
                  />
                  {whatsappIntegration.name}
                </StyledDiv>
                <StyledDiv>
                  <SettingsSelectStatusPill
                    dropdownId={`integration-${whatsappIntegration.id}`}
                    options={[
                      {
                        Icon: IconPointFilled,
                        label: 'Active',
                        value: false,
                      },
                      {
                        Icon: IconPointFilled,
                        label: 'Deactive',
                        value: true,
                      },
                    ]}
                    value={whatsappIntegration.disabled}
                    onChange={(newValue) => {
                      if (whatsappIntegration.disabled !== newValue) {
                        handleStatusIntegration(whatsappIntegration.id);
                      }
                    }}
                  />
                  <IconButton
                    onClick={() =>
                      handleEditIntegration(whatsappIntegration.id)
                    }
                    variant="tertiary"
                    size="medium"
                    Icon={IconPencil}
                  />
                  <IconButton
                    onClick={() =>
                      handleDeleteIntegration(
                        whatsappIntegration.id,
                        whatsappIntegration.name,
                      )
                    }
                    variant="tertiary"
                    size="medium"
                    Icon={IconTrash}
                  />
                </StyledDiv>
              </StyledCard>
            ))}
          </>
        )}
        <StyledFooter>
          <StyledButton onClick={() => navigate('new')}>
            <IconPlus size={theme.icon.size.md} />
            {'Add connection'}
          </StyledButton>
        </StyledFooter>
      </StyledIntegrationsSection>
      <ConfirmationModal
        modalId={CONFIRM_DISABLE_INBOX_MODAL_ID}
        title={`Disable Inbox`}
        subtitle={
          <>{`This will disabled this inbox and all chat conversations.`}</>
        }
        onConfirmClick={handleConfirmChange}
        confirmButtonText="Continue"
      />
      <ConfirmationModal
        modalId={CONFIRM_DELETE_INBOX_MODAL_ID}
        title={`Delete Connection`}
        subtitle={
          <>
            {`This action cannot be undone. This will permanently delete the connection "${selectedIntegrationName}" and all associated data.`}
          </>
        }
        onConfirmClick={handleConfirmChange}
        confirmButtonText="Delete"
      />
    </>
  );
};
