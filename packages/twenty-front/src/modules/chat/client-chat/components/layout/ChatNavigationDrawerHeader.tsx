import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID } from '@/chat/client-chat/constants/chatNavigationDrawerHeaderModalId';
import { SettingsPath } from '@/types/SettingsPath';
import { TextInput } from '@/ui/input/components/TextInput';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconMessage2Plus, IconSortDescending2 } from '@tabler/icons-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import {
  Avatar,
  H1Title,
  H1TitleFontColor,
  IconX,
  useIcons,
} from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

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

const StyledModalContent = styled(Modal.Content)`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  padding: ${({ theme }) => theme.spacing(4)};
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledH1Title = styled(H1Title)`
  margin: 0;
`;

export const ChatNavigationDrawerHeader = ({
  searchInput,
  setSearchInput,
}: {
  searchInput: string;
  setSearchInput: (input: string) => void;
}) => {
  const { getIcon } = useIcons();
  const { openModal } = useModal();

  const { t } = useLingui();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [integrationId, setIntegrationId] = useState<string | null>(null);
  // const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  openModal(CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID);

  const navigate = useNavigate();

  return (
    <>
      <StyledPaneHeaderContainer>
        <StyledDiv>
          <div style={{ cursor: 'pointer' }}>
            <Avatar
              placeholder={currentWorkspaceMember?.name.firstName}
              avatarUrl={currentWorkspaceMember?.avatarUrl}
              size="lg"
              type="rounded"
              onClick={() =>
                navigate(getSettingsPath(SettingsPath.ProfilePage))
              }
            />
          </div>
          <StyledH1Title
            title={t`Chat`}
            titleCentered
            fontColor={H1TitleFontColor.Primary}
          />
        </StyledDiv>
        <StyledActionsContainer>
          <StyledIconButton
            onClick={() => alert('not implemented')}
            variant="secondary"
            size="medium"
            Icon={(props) => <IconSortDescending2 {...props} />}
          />
          <StyledIconButton
            onClick={() => alert('not implemented')}
            variant="secondary"
            size="medium"
            Icon={(props) => <IconMessage2Plus {...props} />}
          />
        </StyledActionsContainer>
      </StyledPaneHeaderContainer>

      {phoneNumber !== null && (
        <StyledModal modalId={CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID}>
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
        </StyledModal>
      )}
      <TextInput
        LeftIcon={IconSearch}
        placeholder={t`Search chats`}
        value={searchInput}
        onChange={(text: string) => setSearchInput(text)}
      />
    </>
  );
};
