/* @kvoip-woulz proprietary */
import styled from '@emotion/styled';
import { type ReactElement } from 'react';

const StyledBox = styled.div<{ isInRightDrawer?: boolean }>`
  height: ${({ isInRightDrawer }) => (isInRightDrawer ? 'auto' : '100%')};

  margin: ${({ isInRightDrawer, theme }) =>
    isInRightDrawer ? theme.spacing(4) : ''};
`;

type AccountReceivableCardContainerProps = {
  children: ReactElement[] | ReactElement;
  isInRightDrawer?: boolean;
};

export const AccountReceivableCardContainer = ({
  children,
  isInRightDrawer = true,
}: AccountReceivableCardContainerProps) => {
  return <StyledBox isInRightDrawer={isInRightDrawer}>{children}</StyledBox>;
};
