import styled from '@emotion/styled';
import { useIcons } from 'twenty-ui/display';

export const StyledOptionContainer = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.strong};
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  padding: ${({ theme }) => theme.spacing(2)};
  position: relative;
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const StyledOption = ({
  icon,
  children,
}: {
  icon?: string;
  children?: React.ReactNode;
}) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(icon);
  return (
    <StyledOptionContainer>
      {icon && <Icon size={12} />}
      {children}
    </StyledOptionContainer>
  );
};
