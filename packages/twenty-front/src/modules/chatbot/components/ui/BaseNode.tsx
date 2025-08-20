import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import styled from '@emotion/styled';
import { ReactNode } from 'react';
import { Label, useIcons } from 'twenty-ui/display';

const StyledBaseNodeWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.background.quaternary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  width: 250px;
  &:hover {
    background-color: ${({ theme }) => theme.background.secondary};
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.background.primaryInverted};
  font-weight: 500;

  p {
    margin: 0;
  }

  .icon {
    background-color: ${({ theme }) => theme.background.secondary};
    border: 1px solid ${({ theme }) => theme.background.quaternary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
    padding: ${({ theme }) => theme.spacing(1)};
    color: ${({ theme }) => theme.font.color.tertiary};
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const StyledNodeType = styled.div`
  width: max-content;
  background-color: ${({ theme }) => theme.color.blue};
  align-self: center;
  border-radius: ${({ theme }) =>
    `${theme.border.radius.sm} ${theme.border.radius.sm} 0 0`};
  margin-left: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(0.5)}
    ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.background.primary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`.withComponent(Label);

const BaseNode = ({
  icon,
  title,
  children,
  nodeStart,
}: {
  icon?: string;
  title?: string;
  children: ReactNode;
  nodeStart?: boolean;
  newNode?: boolean;
}) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(icon);

  const iconHeader = <Icon size={18}></Icon>;
  const { toggleCommandMenu } = useCommandMenu();

  return (
    <div onClick={toggleCommandMenu}>
      {nodeStart && <StyledNodeType variant="small">Start</StyledNodeType>}
      <StyledBaseNodeWrapper>
        <StyledHeader>
          {icon && <div className="icon">{iconHeader}</div>}
          {title && <p>{title}</p>}
        </StyledHeader>
        {children}
      </StyledBaseNodeWrapper>
    </div>
  );
};

export default BaseNode;
