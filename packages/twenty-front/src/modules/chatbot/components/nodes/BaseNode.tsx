import { TitleInput } from '@/ui/input/components/TitleInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { ReactNode, useState } from 'react';
import { Label, useIcons } from 'twenty-ui/display';
import { ThemeColor } from 'twenty-ui/theme';

// eslint-disable-next-line @nx/workspace-no-hardcoded-colors
const StyledBaseNodeWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border: 2px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  // box-shadow: ${({ theme }) => theme.boxShadow.light};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  width: 250px;
  &:hover {
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.background.primaryInverted};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(3)};

  p {
    margin: 0;
  }

  .icon {
    background-color: ${({ theme }) => theme.background.secondary};
    border: 1px solid ${({ theme }) => theme.background.quaternary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
    padding: ${({ theme }) => theme.spacing(1)};
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
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`.withComponent(Label);

const StyledLabel = styled(Label)`
  padding: ${({ theme }) => theme.spacing(0, 1.25)} 0px;
`;
const BaseNode = ({
  icon,
  title,
  children,
  nodeStart,
  iconColor,
  onTitleChange,
  onTitleBlur,
  nodeTypeDescription,
}: {
  icon?: string;
  title: string;
  children: ReactNode;
  nodeStart?: boolean;
  newNode?: boolean;
  iconColor?: ThemeColor;
  nodeTypeDescription: string;
  onTitleChange: (value: string) => void;
  onTitleBlur: () => void;
}) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(icon);

  const theme = useTheme();
  const iconHeader = (
    <Icon size={18} color={theme.color[iconColor ?? 'gray']}></Icon>
  );

  const [customTitle, setCustomTitle] = useState<string>(title);

  return (
    <div>
      {nodeStart && <StyledNodeType variant="small">Start</StyledNodeType>}
      <StyledBaseNodeWrapper>
        <div
          style={{
            width: '20%',
            height: 4,
            backgroundColor: theme.border.color.medium,
            alignSelf: 'center',
            borderRadius: theme.border.radius.sm,
          }}
        />
        <StyledHeader>
          {icon && <div className="icon">{iconHeader}</div>}
          <div>
            {title && (
              <TitleInput
                placeholder={title}
                value={customTitle}
                onEscape={onTitleBlur}
                onEnter={onTitleBlur}
                onClickOutside={onTitleBlur}
                onChange={(e: string) => {
                  onTitleChange(e);
                  setCustomTitle(e);
                }}
              />
            )}
            <StyledLabel>{nodeTypeDescription}</StyledLabel>
          </div>
        </StyledHeader>
        {children}
      </StyledBaseNodeWrapper>
    </div>
  );
};

export default BaseNode;
