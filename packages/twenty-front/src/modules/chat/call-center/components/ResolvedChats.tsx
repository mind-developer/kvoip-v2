/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { ChatCell } from '@/chat/call-center/components/ChatCell';
import { CallCenterContext } from '@/chat/call-center/context/CallCenterContext';
import { CallCenterContextType } from '@/chat/call-center/types/CallCenterContextType';
import { statusEnum } from '@/chat/types/WhatsappDocument';
import styled from '@emotion/styled';
import { useContext, useState } from 'react';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledSeparator = styled.div`
  align-self: center;
  background-color: ${({ theme }) => theme.background.quaternary};
  height: 1px;
  width: 95%;
`;

const StyledExpandDiv = styled.div`
  background-color: transparent;
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  flex-direction: column;
  width: 100%;
  gap: 16px;
`;

export const ResolvedChats = () => {
  const {
    selectedChatId,
    setSelectedChatId,
    whatsappChats /*, messengerChats*/,
  } = useContext(CallCenterContext) as CallCenterContextType;
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const allChats = [...whatsappChats]; // ...messengerChats,
  const resolvedChats = allChats.filter((chat: any) => {
    if (chat.status === statusEnum.Resolved && chat.isVisible) return true;
    return false;
  });

  if (resolvedChats.length > 0)
    return (
      <>
        <Button
          variant="tertiary"
          title="Resolved"
          Icon={isExpanded ? IconChevronUp : IconChevronDown}
          onClick={() => setIsExpanded(!isExpanded)}
        />
        {isExpanded && (
          <StyledExpandDiv>
            <StyledSeparator />
            {resolvedChats.map((chat: any) => {
              const chatId =
                chat.integrationId +
                (chat.client.phone
                  ? `_${chat.client.phone}`
                  : `_${chat.client.id}`);

              return (
                <ChatCell
                  key={chat.id}
                  chat={chat}
                  isSelected={selectedChatId === chatId}
                  onSelect={() => setSelectedChatId(chatId)}
                />
              );
            })}
          </StyledExpandDiv>
        )}
      </>
    );
};
