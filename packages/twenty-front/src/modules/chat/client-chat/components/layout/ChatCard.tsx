import { AppPath } from '@/types/AppPath';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconBrandMeta } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { AvatarChip } from 'twenty-ui/components';
import { AppTooltip, Avatar, TooltipDelay, useIcons } from 'twenty-ui/display';
import { getAppPath } from '~/utils/navigation/getAppPath';

// import MessengerIcon from '/images/integrations/messenger-logo.svg';

const StyledChatCard = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.background.transparent.light : 'transparent'};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  cursor: pointer;
  display: flex;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(2)};
  transition: background-color 0.2s;
`;

const StyledContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: ${({ theme }) => theme.spacing(2)};
  width: 100%;
  overflow: hidden;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledUserName = styled.p`
  align-items: center;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: 600;
  gap: ${({ theme }) => theme.spacing(1)};
  margin: 0;
`;

const StyledLastMessagePreview = styled.p`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.color.gray50};
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 200px;
`;

const StyledDateAndUnreadMessagesContainer = styled.div`
  color: ${({ theme }) => theme.color.gray50};
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  align-self: center;
  justify-content: space-between;
`;

// eslint-disable-next-line @nx/workspace-no-hardcoded-colors
const StyledUnreadMessages = styled.div`
  background-color: #1961ed;
  color: ${({ theme }) => theme.font.color.inverted};
  width: ${({ theme }) => theme.spacing(4)};
  height: ${({ theme }) => theme.spacing(4)};
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: 600;
`;

const StyledContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const StyledDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledContainerPills = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledTagsContainer = styled.div`
  display: flex;
  align-items: center;
`;

const StyledAgentTooltipWrapper = styled.div`
  display: inline-flex;
  pointer-events: auto;
`;

const StyledSectorTooltipWrapper = styled.div`
  display: inline-flex;
  pointer-events: auto;
`;

const StyledAppTooltip = styled(AppTooltip)`
  padding: ${({ theme }) => theme.spacing(1)} !important;
  background-color: ${({ theme }) => theme.color.blue} !important;
`;

const StyledIntegrationName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;

type ChatCardProps = {
  chatId: string;
  name: string;
  lastMessagePreview: string;
  isSelected?: boolean;
  unreadMessagesCount: number;
  sectorName?: string;
  sectorIcon?: string;
  personAvatarUrl: string;
  agentAvatarUrl?: string;
  agentName?: string;
  integrationName?: string;
};

export const ChatCard = ({
  chatId,
  name,
  personAvatarUrl,
  agentAvatarUrl,
  agentName,
  lastMessagePreview,
  isSelected,
  unreadMessagesCount,
  sectorName,
  sectorIcon,
  integrationName,
}: ChatCardProps) => {
  const navigate = useNavigate();
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const Icon = getIcon(sectorIcon);
  const agentTooltipId = `agent-tooltip-${chatId}`;
  const sectorTooltipId = `sector-tooltip-${chatId}`;
  const StyledSectorIcon = styled(Icon)`
    width: 14px;
    height: 14px;
    padding: 2px;
    background-color: ${({ theme }) => theme.color.red20};
    box-sizing: border-box;
    border-radius: 50%;
    color: ${({ theme }) => theme.color.red80};
    outline: 2px solid
      ${({ theme }) =>
        isSelected ? theme.background.tertiary : theme.background.primary};
    z-index: 1;
  `;
  return (
    <StyledChatCard
      onClick={() => navigate(getAppPath(AppPath.ClientChat, { chatId }))}
      isSelected={isSelected}
    >
      <Avatar
        avatarUrl={personAvatarUrl}
        placeholderColorSeed={name}
        placeholder={name}
        type={'rounded'}
        size="xl"
      />
      <StyledContentContainer>
        <StyledContainer>
          <StyledDiv>
            <StyledUserName>
              {name}
              <StyledTagsContainer>
                {agentName && (
                  <>
                    <StyledAgentTooltipWrapper id={agentTooltipId}>
                      <AvatarChip
                        avatarUrl={agentAvatarUrl}
                        placeholderColorSeed={agentName}
                        placeholder={agentName}
                        avatarType="rounded"
                      />
                    </StyledAgentTooltipWrapper>
                    <StyledAppTooltip
                      content={`${t`Agent:`} ${agentName}`}
                      anchorSelect={`#${agentTooltipId}`}
                      place="bottom"
                      positionStrategy="fixed"
                      delay={TooltipDelay.noDelay}
                    />
                  </>
                )}
                {sectorName && (
                  <>
                    <StyledSectorTooltipWrapper id={sectorTooltipId}>
                      <StyledSectorIcon size={10} />
                    </StyledSectorTooltipWrapper>
                    <StyledAppTooltip
                      content={`${t`Sector:`} ${sectorName}`}
                      anchorSelect={`#${sectorTooltipId}`}
                      place="bottom"
                      positionStrategy="fixed"
                      delay={TooltipDelay.noDelay}
                    />
                  </>
                )}
              </StyledTagsContainer>
            </StyledUserName>
            <StyledLastMessagePreview>
              {lastMessagePreview}
            </StyledLastMessagePreview>
          </StyledDiv>
          <StyledContainerPills>
            {integrationName && (
              <StyledIntegrationName>
                <IconBrandMeta size={14} />
                {integrationName}
              </StyledIntegrationName>
            )}
            <StyledDateAndUnreadMessagesContainer>
              {unreadMessagesCount > 0 && (
                <StyledUnreadMessages>
                  {unreadMessagesCount}
                </StyledUnreadMessages>
              )}
            </StyledDateAndUnreadMessagesContainer>
          </StyledContainerPills>
        </StyledContainer>
      </StyledContentContainer>
    </StyledChatCard>
  );
};
