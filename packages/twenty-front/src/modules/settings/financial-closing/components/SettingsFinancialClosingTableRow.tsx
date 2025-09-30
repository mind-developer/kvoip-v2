/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

import { useBillingModelTranslations } from '@/settings/financial-closing/constants/BillingModelOptions';
import { getBillingModelTagColor } from '@/settings/financial-closing/constants/LogLevelColors';
import { FinancialClosing } from '@/settings/financial-closing/types/FinancialClosing';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { Tag } from 'twenty-ui/components';

const StyledContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(0)};
  padding: ${({ theme }) => theme.spacing(3)};
  &:last-child {
    border-bottom: none;
  }feat
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  margin-left: ${({ theme }) => theme.spacing(3)};
  overflow: auto;
`;

const StyledBillingModelsContainer = styled.div`
  align-items: end;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  flex-wrap: wrap;
  margin-right: ${({ theme }) => theme.spacing(3)};
  flex-direction: column;
`;

const StyledTextContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  overflow: auto;
`;

const StyledEmailText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

type SettingsFinancialClosingTableRowProps = {
  financialClosing: FinancialClosing;
  accessory?: React.ReactNode;
};

export const SettingsFinancialClosingTableRow = ({
  financialClosing,
  accessory,
}: SettingsFinancialClosingTableRowProps) => {
  const theme = useTheme();
  const { t } = useLingui();
  const { getBillingModelLabel } = useBillingModelTranslations();

  const getDateDayText = () => {
    if (financialClosing.lastDayMonth) {
      return (t`At` + ' ' + financialClosing.time + ' ' + t`of the last day of the month`);
    }
    return (t`At` + ' ' + financialClosing.time + ' ' + t`of every day` + ' ' + financialClosing.day);
  };

  return (
    <StyledContainer>
      <StyledContent>
        <StyledTextContent>
          <OverflowingTextWithTooltip
            text={financialClosing.name}
          />
          <StyledEmailText>
            {getDateDayText()}
          </StyledEmailText>
        </StyledTextContent>

        <StyledBillingModelsContainer>
          {
            financialClosing.billingModelIds && financialClosing.billingModelIds.length > 0 && (
              <>
                {
                  financialClosing.billingModelIds.map((billingModel) => (
                    <Tag
                      key={financialClosing.id + "_" + billingModel}
                      color={getBillingModelTagColor()}
                      text={getBillingModelLabel(billingModel) ?? billingModel}
                      weight="medium"
                    />
                  ))
                }
              </>
            )
          }
        </StyledBillingModelsContainer>
      </StyledContent>
      {accessory}
    </StyledContainer>
  );
};
