import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID } from '@/chat/client-chat/constants/chatNavigationDrawerHeaderModalId';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconMessage2Plus } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Avatar, H1Title, H1TitleFontColor, useIcons } from 'twenty-ui/display';
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
const StyledDiv = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: center;
`;

const StyledH1Title = styled(H1Title)`
  margin: 0;
`;

export const ChatNavigationDrawerHeader = ({
  onSortClick,
  sortDirection,
}: {
  onSortClick: () => void;
  sortDirection: 'asc' | 'desc';
}) => {
  const { getIcon } = useIcons();
  const IconSortDescending = getIcon('IconSortDescending');
  const IconSortAscending = getIcon('IconSortAscending');
  const { openModal } = useModal();

  const { t } = useLingui();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const IconSearch = getIcon('IconSearch');

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
            onClick={() => onSortClick()}
            variant="secondary"
            size="medium"
            Icon={
              sortDirection === 'asc' ? IconSortAscending : IconSortDescending
            }
          />
          <StyledIconButton
            onClick={() => {
              openModal(CHAT_NAVIGATION_DRAWER_HEADER_MODAL_ID);
            }}
            variant="secondary"
            size="medium"
            Icon={(props) => <IconMessage2Plus {...props} />}
          />
        </StyledActionsContainer>
      </StyledPaneHeaderContainer>
    </>
  );
};
