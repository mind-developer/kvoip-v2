/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { ChatCell } from '@/chat/call-center/components/ChatCell';
import { useClientChatsWithPerson } from '@/chat/call-center/hooks/useClientChatsWithPerson';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ClientChatStatus } from 'twenty-shared/types';
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
  const { chats: clientChats } = useClientChatsWithPerson();
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const navigate = useNavigate();
  const { chatId: openChatId } = useParams();

  // Filtrar chats resolvidos
  const resolvedChats = clientChats.filter(
    (chat) => chat.status === ClientChatStatus.RESOLVED,
  );

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
            {resolvedChats.map((chat) => {
              const person = chat.person;
              const clientName = person
                ? `${person.firstName || ''} ${person.lastName || ''}`.trim() ||
                  'Cliente'
                : `Cliente ${chat.providerContactId}`;

              return (
                <ChatCell
                  key={chat.id}
                  chat={chat}
                  isSelected={openChatId === chat.id}
                  onSelect={() => {
                    navigate(`/chat/call-center/${chat.id}`);
                  }}
                />
              );
            })}
          </StyledExpandDiv>
        )}
      </>
    );
};
