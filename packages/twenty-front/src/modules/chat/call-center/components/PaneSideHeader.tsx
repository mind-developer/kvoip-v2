import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Search } from '@/chat/call-center/components/Search';
import { TemplateMessage } from '@/chat/call-center/components/TemplateMessage';
import { PANEL_SIDE_HEADER_MODAL_ID } from '@/chat/call-center/constants/PanelSideHeaderModalId';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  Avatar,
  H1Title,
  H1TitleFontColor,
  IconX,
  useIcons,
} from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';

const StyledPaneHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledActionsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledIconButton = styled(IconButton)`
  border-radius: 50%;
  cursor: pointer;
  height: 24px;
  min-width: 24px;
`;

const StyledModal = styled(Modal)`
  padding: 0;
  width: 560px;
`;

const StyledModalHeader = styled(Modal.Header)`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(12)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)}
    0;
`;

const StyledH1Title = styled(H1Title)`
  margin: 0;
`;

const StyledModalContent = styled(Modal.Content)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const PaneSideHeader = () => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { openModal } = useModal();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [integrationId, setIntegrationId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const sendTemplateMessage = (
    templateName: string,
    message: string,
    language: string,
  ) => {
    const sendTemplateInput = {
      integrationId: integrationId,
      to: `+${phoneNumber}`,
      from: `_${currentWorkspaceMember?.name.firstName} ${currentWorkspaceMember?.name.lastName}`,
      templateName,
      language,
      message,
      agent: {
        name: `${currentWorkspaceMember?.name.firstName} ${currentWorkspaceMember?.name.lastName}`,
        id: currentWorkspaceMember?.agent?.id,
      },
      type: 'template',
    };

    // sendWhatsappTemplateMessage(sendTemplateInput);
  };

  const IconSearch = getIcon('IconSearch');
  const IconEdit = getIcon('IconEdit');
  const IconSortDescending = getIcon('IconSortDescending');

  openModal(PANEL_SIDE_HEADER_MODAL_ID);

  return (
    <>
      <StyledPaneHeaderContainer>
        <Avatar
          placeholder={currentWorkspaceMember?.name.firstName}
          avatarUrl={currentWorkspaceMember?.avatarUrl}
          size="xl"
          type="rounded"
        />
        <StyledActionsContainer>
          <StyledIconButton
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            variant="secondary"
            size="medium"
            Icon={(props) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <IconSearch {...props} />
            )}
          />
          <StyledIconButton
            onClick={() => alert('not implemented')}
            variant="secondary"
            // accent="blue"
            size="medium"
            Icon={(props) => (
              <IconSortDescending
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
              />
            )}
          />
          <StyledIconButton
            onClick={() => alert('not implemented')}
            variant="secondary"
            size="medium"
            Icon={(props) => (
              // eslint-disable-next-line react/jsx-props-no-spreading
              <IconEdit {...props} />
            )}
          />
          {/* {isStartChatOpen && (
            <StartChat
              isStartChatOpen={isStartChatOpen}
              setIsStartChatOpen={setIsStartChatOpen}
              onPhoneUpdate={handlePhoneUpdate}
              onIntegrationUpdate={handleSelectedIntegrationId}
            />
          )} */}
        </StyledActionsContainer>
      </StyledPaneHeaderContainer>

      {phoneNumber !== null && (
        <StyledModal modalId={PANEL_SIDE_HEADER_MODAL_ID}>
          <StyledModalHeader>
            <StyledH1Title
              title={'Choose a template to send'}
              fontColor={H1TitleFontColor.Primary}
            />
            <IconButton
              Icon={IconX}
              size="medium"
              variant="tertiary"
              onClick={() => {
                alert('not implemented');
              }}
            />
          </StyledModalHeader>
          <StyledModalContent>
            <TemplateMessage
              templates={[]}
              onTemplateUpdate={sendTemplateMessage}
            />
          </StyledModalContent>
        </StyledModal>
      )}

      <Search isOpen={isSearchOpen} />
    </>
  );
};
