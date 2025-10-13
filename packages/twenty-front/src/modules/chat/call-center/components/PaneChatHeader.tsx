import { TransferChatOptionsDropdown } from '@/chat/call-center/components/TransferChatOptionsDropdown';
import { PANEL_CHAT_HEADER_MODAL_ID } from '@/chat/call-center/constants/PanelChatHeaderModalId';
import { useOpenRecordInCommandMenu } from '@/command-menu/hooks/useOpenRecordInCommandMenu';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import styled from '@emotion/styled';
import { Avatar, useIcons } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  position: relative;
`;

const StyledChatTitle = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: 600;
  margin: 0 ${({ theme }) => theme.spacing(2)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
`;

const StyledActionsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-right: 8px;
`;

const StyledIconButton = styled(IconButton)`
  border-radius: 50%;
  cursor: pointer;
  height: 24px;
  padding: 5px;
  width: 24px;
  min-width: 24px;
`;
const StyledIntegrationCard = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.tertiary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.font.color.primary : theme.font.color.secondary};
  display: flex;
  padding: 3px ${({ theme }) => theme.spacing(1)};
  width: max-content;
  margin-right: ${({ theme }) => theme.spacing(1)};

  & img {
    height: 10px;
    margin-right: ${({ theme }) => theme.spacing(1)};
    width: 10px;
  }
  font-size: 10px;
`;

export const PaneChatHeader = ({
  name,
  avatarUrl,
  personId,
}: {
  name: string;
  avatarUrl: string;
  personId: string;
}) => {
  const { getIcon } = useIcons();

  const { toggleModal } = useModal();
  const { openRecordInCommandMenu } = useOpenRecordInCommandMenu();

  const IconX = getIcon('IconX');
  const IconDotsVertical = getIcon('IconDotsVertical');

  if (personId)
    return (
      <>
        <StyledChatHeader>
          <StyledDiv>
            <Avatar
              avatarUrl={avatarUrl}
              placeholder={name}
              size="xl"
              type={'rounded'}
              placeholderColorSeed={name}
            />
            <StyledChatTitle>{name}</StyledChatTitle>
          </StyledDiv>
          <StyledActionsContainer>
            <StyledIconButton
              onClick={() => toggleModal(PANEL_CHAT_HEADER_MODAL_ID)}
              variant="secondary"
              accent="danger"
              size="medium"
              Icon={(props) => (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <IconX {...props} />
              )}
            />
            <TransferChatOptionsDropdown />
            <StyledIconButton
              onClick={() => {
                openRecordInCommandMenu({
                  recordId: personId,
                  objectNameSingular: 'person',
                });
              }}
              variant="secondary"
              accent="default"
              size="medium"
              Icon={(props) => (
                // eslint-disable-next-line react/jsx-props-no-spreading
                <IconDotsVertical {...props} />
              )}
            />
          </StyledActionsContainer>
        </StyledChatHeader>
        <ConfirmationModal
          modalId={PANEL_CHAT_HEADER_MODAL_ID}
          title={'Close service'}
          subtitle={
            <>
              {
                'This will end the chat and change the status of the service to closed'
              }
            </>
          }
          //TODO: Implement finalize service
          onConfirmClick={() => {}}
          confirmButtonText={'Close'}
        />
      </>
    );
};
