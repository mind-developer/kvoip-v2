/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
import { ChatCell } from '@/chat/call-center/components/ChatCell';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const navigate = useNavigate();
  const { chatId: openChatId } = useParams();

  const { records: clientChats } = useFindManyRecords({
    objectNameSingular: 'clientChat',
    recordGqlFields: {
      id: true,
      providerContactId: true,
      status: true,
      updatedAt: true,
      person: {
        id: true,
        avatarUrl: true,
        firstName: true,
        lastName: true,
      },
    },
  });

  // Filtrar chats resolvidos
  const resolvedChats = clientChats.filter(
    (chat) => chat.status === ClientChatStatus.FINISHED,
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
                  name={clientName}
                  avatarUrl={chat.person?.avatarUrl || ''}
                  lastMessagePreview={chat.lastMessagePreview || ''}
                  unreadMessagesCount={chat.unreadMessagesCount || 0}
                  lastMessageTime={chat.lastMessageDate || ''}
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
