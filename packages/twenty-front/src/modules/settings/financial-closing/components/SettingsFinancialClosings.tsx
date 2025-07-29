import { SettingsFinancialClosingTableRow } from '@/settings/financial-closing/components/SettingsFinancialClosingTableRow';
import { useDeleteFinancialClosing } from '@/settings/financial-closing/hooks/useDeleteFinancialClosing';
import { FinancialClosing } from '@/settings/financial-closing/types/FinancialClosing';
import { ServiceCenterFieldActionDropdown } from '@/settings/service-center/sectors/components/ServiceCenterFieldActionDropdown';
import { useDeleteSector } from '@/settings/service-center/sectors/hooks/useDeleteSector';
import { SettingsPath } from '@/types/SettingsPath';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledShowServiceCenterTabs = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: start;
  width: 100%;
`;

const StyledSection = styled(Section)`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const TAB_LIST_COMPONENT_ID = 'show-page-right-tab-list';

type FinancialClosingsProps = {
  financialClosings: FinancialClosing[];
  refetchFinancialClosings: () => void;
  isRightDrawer?: boolean;
  loading?: boolean;
};

export const SettingsFinancialClosings = ({
  financialClosings,
  refetchFinancialClosings,
  loading,
  isRightDrawer = false,
}: FinancialClosingsProps) => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile() || isRightDrawer;

  const { deleteFinancialClosingById } = useDeleteFinancialClosing();

  const handleEditSector = (sectorName: string) => {
    const path = getSettingsPath(SettingsPath.ServiceCenterEditSector).replace(
      ':sectorSlug',
      sectorName,
    );

    navigate(path);
  };

  return (
    <StyledShowServiceCenterTabs isMobile={isMobile}>
      {financialClosings?.length > 0 && (
        <StyledSection>
          {financialClosings.map((financialClosing) => (
            <SettingsFinancialClosingTableRow
              key={financialClosing.id}
              financialClosing={financialClosing}
              accessory={
                <ServiceCenterFieldActionDropdown
                  modalMessage={{
                    title: 'Apagar Fechamento',
                    subtitle: 'Tem certeza que deseja apagar este fechamento? Esta ação não pode ser desfeita.',
                  }}
                  scopeKey={financialClosing.name}
                  onEdit={() => {
                    handleEditSector(financialClosing.name);
                  }}
                  onDelete={async () => {
                    await deleteFinancialClosingById(financialClosing.id);
                    refetchFinancialClosings();
                  }}
                />
              }
            />
          ))}
        </StyledSection>
      )}
    </StyledShowServiceCenterTabs>
  );
};
