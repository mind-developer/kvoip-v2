import React, { type ReactNode } from 'react';
import styled from '@emotion/styled';

const Container = styled.div`
  align-items: center;
  background-color: #f1f1f1;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.md};
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: 8px 16px;
  width: 100%;
`;

const StripeAccountConnectedContainer = ({
  children,
}: {
  children: ReactNode;
}) => {
  return <Container>{children}</Container>;
};

export default StripeAccountConnectedContainer;
