/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import { type ReactElement } from 'react';

const StyledBox = styled.div<{ isInRightDrawer?: boolean }>`
  height: ${({ isInRightDrawer }) => (isInRightDrawer ? 'auto' : '100%')};

  margin: ${({ isInRightDrawer, theme }) =>
    isInRightDrawer ? theme.spacing(4) : ''};
`;

type AccountPayableCardContainerProps = {
  children: ReactElement[] | ReactElement;
  isInRightDrawer?: boolean;
};

export const AccountPayableCardContainer = ({
  children,
  isInRightDrawer = true,
}: AccountPayableCardContainerProps) => {
  return <StyledBox isInRightDrawer={isInRightDrawer}>{children}</StyledBox>;
};
