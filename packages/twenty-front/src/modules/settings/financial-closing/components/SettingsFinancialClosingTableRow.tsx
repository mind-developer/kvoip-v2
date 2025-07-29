import styled from '@emotion/styled';
import { OverflowingTextWithTooltip, Status, StyledText, useIcons } from 'twenty-ui/display';

import { useTheme } from '@emotion/react';
import { FinancialClosing } from '@/settings/financial-closing/types/FinancialClosing';
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
  }
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

  const getDateDayText = () => {
    if (financialClosing.lastDayMonth) {
      return 'As ' + financialClosing.time + ' do último dia do mês';
    }
    return `As ${financialClosing.time} de todo dia ${financialClosing.day}`;
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
                      color={"green"}
                      text={billingModel}
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
