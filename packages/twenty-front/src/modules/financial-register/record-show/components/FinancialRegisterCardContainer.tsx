/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import { type ReactElement } from 'react';

const StyledBox = styled.div<{ isInRightDrawer?: boolean }>`
  background: ${({ theme, isInRightDrawer }) =>
    isInRightDrawer ? theme.background.secondary : ''};
  border: ${({ isInRightDrawer, theme }) =>
    isInRightDrawer ? `1px solid ${theme.border.color.medium}` : ''};
  border-radius: ${({ isInRightDrawer, theme }) =>
    isInRightDrawer ? theme.border.radius.md : ''};
  height: ${({ isInRightDrawer }) => (isInRightDrawer ? 'auto' : '100%')};

  margin: ${({ isInRightDrawer, theme }) =>
    isInRightDrawer ? theme.spacing(4) : ''};
`;

type FinancialRegisterCardContainerProps = {
  children: ReactElement[] | ReactElement;
  isInRightDrawer?: boolean;
};

export const FinancialRegisterCardContainer = ({
  children,
  isInRightDrawer = true,
}: FinancialRegisterCardContainerProps) => {
  return <StyledBox isInRightDrawer={isInRightDrawer}>{children}</StyledBox>;
};
