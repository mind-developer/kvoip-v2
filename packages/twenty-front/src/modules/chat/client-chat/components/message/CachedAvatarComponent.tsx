import { type Person } from '@/people/types/Person';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ChatMessageFromType } from 'twenty-shared/types';
import { Avatar } from 'twenty-ui/display';
import {
  useCachedAgentAvatar,
  useCachedChatbotAvatar,
  useCachedPersonAvatar,
} from '../../hooks/useCachedAvatarData';

const StyledNameTag = styled.span`
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledAvatarContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(1)};
`;
export const CachedAvatarComponent = ({
  animateDelay,
  senderType,
  senderId,
  showName,
}: {
  senderId: string;
  senderType:
    | ChatMessageFromType.PERSON
    | ChatMessageFromType.AGENT
    | ChatMessageFromType.CHATBOT;
  animateDelay: number;
  showName: boolean;
}) => {
  let CachedAvatarComponent = null;
  switch (senderType) {
    case ChatMessageFromType.PERSON:
      CachedAvatarComponent = (
        <PersonAvatar personId={senderId} showName={showName} />
      );
      break;
    case ChatMessageFromType.AGENT:
      CachedAvatarComponent = (
        <AgentAvatar agentId={senderId} showName={showName} />
      );
      break;
    case ChatMessageFromType.CHATBOT:
      CachedAvatarComponent = (
        <ChatbotAvatar chatbotId={senderId} showName={showName} />
      );
      break;
    default:
      CachedAvatarComponent = null;
      break;
  }
  return (
    <motion.div
      initial={{ translateY: 20, opacity: 0 }}
      animate={{
        translateY: 0,
        opacity: 1,
        transition: {
          delay: animateDelay,
          type: 'spring',
          stiffness: 300,
          damping: 20,
          mass: 0.8,
        },
      }}
    >
      {CachedAvatarComponent}
    </motion.div>
  );
};

function PersonAvatar({
  personId,
  showName,
}: {
  personId: string;
  showName: boolean;
}) {
  const { findOneRecord, loading, error, record, called } =
    useCachedPersonAvatar(personId);
  const [person, setPerson] = useState<Person | null>(null);

  /* @kvoip-woulz proprietary:begin */
  // Skip fetching if personId is invalid
  const isValidPersonId = personId && personId !== 'FROM_UNKNOWN';
  /* @kvoip-woulz proprietary:end */

  useEffect(() => {
    /* @kvoip-woulz proprietary:begin */
    if (!isValidPersonId) {
      return;
    }
    /* @kvoip-woulz proprietary:end */
    findOneRecord({
      objectRecordId: personId,
      onCompleted: (person) => setPerson(person),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId, isValidPersonId]);

  /* @kvoip-woulz proprietary:begin */
  // Use record from hook if available, otherwise use local state
  const personData = record || person;
  const isLoading = loading || (!called && isValidPersonId);
  /* @kvoip-woulz proprietary:end */

  if (!isValidPersonId) {
    return <Avatar placeholder="Unknown" type="rounded" />;
  }

  if (isLoading) {
    return <Avatar placeholder="Loading..." type="rounded" />;
  }

  if (error) {
    return <Avatar placeholder="Error loading avatar" type="rounded" />;
  }

  const firstName = personData?.name?.firstName || '';
  const lastName = personData?.name?.lastName || '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Unknown';

  return (
    <StyledAvatarContainer>
      <Avatar
        avatarUrl={personData?.avatarUrl}
        placeholder={fullName}
        type="rounded"
      />
      {showName && <StyledNameTag>{fullName}</StyledNameTag>}
    </StyledAvatarContainer>
  );
}

function AgentAvatar({
  agentId,
  showName,
}: {
  agentId: string;
  showName: boolean;
}) {
  const { findManyRecordsLazy } = useCachedAgentAvatar(agentId);
  const [agent, setAgent] = useState<WorkspaceMember | null>(null);
  useEffect(() => {
    findManyRecordsLazy().then((result) => {
      if (result.records[0]) {
        setAgent(result.records[0] as WorkspaceMember);
      }
    });
  }, [agentId]);
  return (
    <StyledAvatarContainer>
      <Avatar
        avatarUrl={agent?.avatarUrl}
        placeholder={agent?.name?.firstName + ' ' + agent?.name?.lastName}
        type="rounded"
      />
      {showName && (
        <StyledNameTag>
          {agent?.name?.firstName + ' ' + agent?.name?.lastName}
        </StyledNameTag>
      )}
    </StyledAvatarContainer>
  );
}

function ChatbotAvatar({
  chatbotId,
  showName,
}: {
  chatbotId: string;
  showName: boolean;
}) {
  const { findOneRecord, loading, error, record, called } =
    useCachedChatbotAvatar(chatbotId);
  const [chatbot, setChatbot] = useState<{
    name: string;
    __typename: string;
    id: string;
  } | null>(null);
  useEffect(() => {
    findOneRecord({
      objectRecordId: chatbotId,
      onCompleted: (chatbot) => setChatbot(chatbot),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatbotId]);

  /* @kvoip-woulz proprietary:begin */
  // Use record from hook if available, otherwise use local state
  const chatbotData = record || chatbot;
  const isLoading = loading || (!called && chatbotId);
  /* @kvoip-woulz proprietary:end */

  if (isLoading) {
    return <Avatar placeholder="Loading..." type="rounded" />;
  }

  if (error) {
    return <Avatar placeholder="Error loading avatar" type="rounded" />;
  }

  return (
    <StyledAvatarContainer>
      <Avatar placeholder={chatbotData?.name || 'Chatbot'} type="rounded" />
      {showName && (
        <StyledNameTag>{chatbotData?.name || 'Chatbot'}</StyledNameTag>
      )}
    </StyledAvatarContainer>
  );
}
