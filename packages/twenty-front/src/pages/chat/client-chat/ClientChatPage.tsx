import { useDynamicOneSignal } from '@/app/hooks/useDynamicOneSignal';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { Chat } from '@/chat/client-chat/components/layout/Chat';
import { ChatNavigationDrawer } from '@/chat/client-chat/components/layout/ChatNavigationDrawer';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import styled from '@emotion/styled';
// eslint-disable-next-line no-restricted-imports
import { IconBrandWechat } from '@tabler/icons-react';
import { useRecoilValue } from 'recoil';

const StyledMainContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
`;

export const ClientChatPage = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const onesignalAppId = currentWorkspace?.onesignalAppId ?? undefined;
  useDynamicOneSignal({ onesignalAppId });

  return (
    <PageContainer>
      <PageHeader Icon={IconBrandWechat} title="Chat" />
      <PageBody>
        <StyledMainContainer>
          <ChatNavigationDrawer />
          <Chat />
        </StyledMainContainer>
      </PageBody>
    </PageContainer>
  );
};
