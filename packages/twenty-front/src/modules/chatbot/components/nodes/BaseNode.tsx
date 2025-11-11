/* @kvoip-woulz proprietary */
import { useHandleNodeValue } from '@/chatbot/hooks/useHandleNodeValue';
import { chatbotFlowSelectedNodeState } from '@/chatbot/state/chatbotFlowSelectedNodeState';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useNodes } from '@xyflow/react';
import { type ReactNode, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { IconX, Label, useIcons } from 'twenty-ui/display';
import { type ThemeColor } from 'twenty-ui/theme';

const StyledBaseNodeWrapper = styled.div<{ isSelected: boolean }>`
  border: 2px solid ${({ theme }) => theme.border.color.medium};
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${({ theme }) => theme.border.radius.md};
  min-width: 270px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  /* @kvoip-woulz proprietary:begin */
  &:hover {
    border-color: ${({ theme, isSelected }) =>
      isSelected ? theme.color.blue40 : theme.color.blue20};
  }
  /* @kvoip-woulz proprietary:end */
  ${({ theme, isSelected }) =>
    isSelected
      ? `
    border-color: ${theme.color.blue40};
  `
      : ''}
`;

const StyledHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.background.primaryInverted};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  position: relative;

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

const StyledDeleteButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(1)};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  transition: all 0.2s ease;

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
    color: ${({ theme }) => theme.color.red};
  }

  &:active {
    transform: scale(0.95);
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

const StyledTitleInput = styled(TitleInput)`
  padding-bottom: 0px;
`;

const BaseNode = ({
  icon,
  children,
  isInitialNode,
  iconColor,
  onTitleChange,
  onTitleBlur,
  nodeTypeDescription,
  nodeId,
}: {
  icon: string;
  children: ReactNode;
  isInitialNode?: boolean;
  newNode?: boolean;
  iconColor?: ThemeColor;
  nodeTypeDescription: string;
  onTitleChange: (value: string) => void;
  onTitleBlur: () => void;
  nodeId: string;
}) => {
  const { getIcon } = useIcons();
  const Icon = getIcon(icon);
  const { deleteNode } = useHandleNodeValue();

  const node = useNodes().filter((filterNode) => filterNode.id === nodeId)[0];
  const chatbotFlowSelectedNodes = useRecoilValue(chatbotFlowSelectedNodeState);
  const theme = useTheme();
  const iconHeader = (
    <Icon size={18} color={theme.color[iconColor ?? 'gray']} />
  );

  const [customTitle, setCustomTitle] = useState<string>(
    node?.data.title as string,
  );

  const isSelected = chatbotFlowSelectedNodes.some(
    (selectedNode) => selectedNode.id === nodeId,
  );

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNode(nodeId);
  };

  return (
    <div>
      {isInitialNode && <StyledNodeType variant="small">Start</StyledNodeType>}
      <StyledBaseNodeWrapper className="nopan" isSelected={isSelected}>
        <StyledHeader>
          {icon && <div className="icon">{iconHeader}</div>}
          <div>
            {isDefined(node?.data.title) && (
              <StyledTitleInput
                placeholder={node?.data.title as string}
                instanceId={node?.id}
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
          <StyledDeleteButton onClick={handleDelete} aria-label="Delete node">
            <IconX size={theme.icon.size.md} stroke={theme.icon.stroke.md} />
          </StyledDeleteButton>
        </StyledHeader>
        {children}
      </StyledBaseNodeWrapper>
    </div>
  );
};

export default BaseNode;
