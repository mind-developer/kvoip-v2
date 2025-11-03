// src/modules/dashboard-links/components/ui/DashboardLinksPageContainer.tsx
import styled from '@emotion/styled';
import { type ReactNode } from 'react';

const StyledPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-top: ${({ theme }) => theme.spacing(1)};
  width: 100%;
  overflow: auto;
`;

type DashboardPageContainerProps = {
  children: ReactNode;
};

export const DashboardPageContainer = ({
  children,
}: DashboardPageContainerProps) => (
  <StyledPageContainer>{children}</StyledPageContainer>
);
