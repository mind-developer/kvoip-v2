/* @kvoip-woulz proprietary */
import { SettingsFinancialClosingTableRow } from '@/settings/financial-closing/components/SettingsFinancialClosingTableRow';
import { useDeleteFinancialClosing } from '@/settings/financial-closing/hooks/useDeleteFinancialClosing';
import { FinancialClosing } from '@/settings/financial-closing/types/FinancialClosing';
import { ServiceCenterFieldActionDropdown } from '@/settings/service-center/sectors/components/ServiceCenterFieldActionDropdown';
import { SettingsPath } from '@/types/SettingsPath';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconArchive, IconClock, IconTextSize } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AnimatedPlaceholderEmptySubTitle, AnimatedPlaceholderEmptyTitle, AnimatedPlaceholder, AnimatedPlaceholderEmptyContainer, AnimatedPlaceholderEmptyTextContainer, Section } from 'twenty-ui/layout';
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
  const { t } = useLingui();
  const navigate = useNavigate();
  const isMobile = useIsMobile() || isRightDrawer;
  const theme = useTheme();

  const { deleteFinancialClosingById } = useDeleteFinancialClosing();

  const handleEditFinancialClosing = (id: string) => {
    const path = getSettingsPath(SettingsPath.FinancialClosingEdit).replace(
      ':financialClosingId',
      id,
    );
    navigate(path);
  };

  const handleFinancialClosingExecutions = (id: string) => {
    const path = getSettingsPath(SettingsPath.FinancialClosingExecutions).replace(
      ':financialClosingId',
      id,
    );
    navigate(path);
  }

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
                    title: t`Delete Financial Closing`,
                    subtitle: t`Are you sure you want to delete this financial closing? This action cannot be undone.`,
                  }}
                  scopeKey={financialClosing.name}
                  onEdit={() => { handleEditFinancialClosing(financialClosing.id) }}
                  onDelete={async () => {
                    await deleteFinancialClosingById(financialClosing.id);
                    refetchFinancialClosings();
                  }}
                  extraMenuItems={[
                    {
                      text: t`Execution History`,
                      icon: IconClock,
                      onClick: () => { handleFinancialClosingExecutions(financialClosing.id) },
                    },
                  ]}
                />
              }
            />
          ))}

          {
            financialClosings && financialClosings?.length === 0 && (
              <Section>
                <div style={{ marginTop: theme.spacing(10) }}>
                  <AnimatedPlaceholderEmptyContainer>
                    <AnimatedPlaceholder type="noRecord" />
                    <AnimatedPlaceholderEmptyTextContainer>
                      <AnimatedPlaceholderEmptyTitle>
                        {t`No financial closings found`}
                      </AnimatedPlaceholderEmptyTitle>
                      <AnimatedPlaceholderEmptySubTitle>
                        {t`Create a financial closing to get started`}
                      </AnimatedPlaceholderEmptySubTitle>
                    </AnimatedPlaceholderEmptyTextContainer>
                  </AnimatedPlaceholderEmptyContainer>
                </div>
              </Section>
            )
          }
        </StyledSection>
      )}
    </StyledShowServiceCenterTabs>
  );
};
