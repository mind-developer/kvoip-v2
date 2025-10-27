import { AppPath } from '@/types/AppPath';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { AvatarChip, Tag } from 'twenty-ui/components';
import { Avatar, useIcons } from 'twenty-ui/display';
import { getAppPath } from '~/utils/navigation/getAppPath';

// eslint-disable-next-line @nx/enforce-module-boundaries
// import MessengerIcon from '/images/integrations/messenger-logo.svg';

const StyledChatCard = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.background.transparent.light : 'transparent'};
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  display: flex;
  padding: ${({ theme }) => theme.spacing(3)};
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
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
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

const StyledTag = styled(Tag)`
  width: 90px;
  padding: 0;
  margin-bottom: -5px;
`;

const StyledTagsContainer = styled.div`
  display: flex;
  flex-direction: column;
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
}: ChatCardProps) => {
  const navigate = useNavigate();
  const { getIcon } = useIcons();
  const Icon = getIcon(sectorIcon);
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
            <StyledUserName>{name}</StyledUserName>
            <StyledLastMessagePreview>
              {lastMessagePreview}
            </StyledLastMessagePreview>
          </StyledDiv>
          <StyledContainerPills>
            <StyledTagsContainer>
              {agentName && (
                <StyledTag
                  text={agentName}
                  color="transparent"
                  variant="solid"
                  weight="medium"
                  Icon={() => {
                    return (
                      <AvatarChip
                        avatarUrl={agentAvatarUrl}
                        placeholderColorSeed={agentName}
                        placeholder={agentName}
                        avatarType="rounded"
                      />
                    );
                  }}
                />
              )}
              {sectorName && (
                <StyledTag
                  Icon={Icon}
                  text={sectorName}
                  color="transparent"
                  variant="solid"
                  weight="medium"
                />
              )}
            </StyledTagsContainer>
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
