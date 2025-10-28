import { Person } from '@/people/types/Person';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ChatMessageFromType } from 'twenty-shared/types';
import { Avatar } from 'twenty-ui/display';
import {
  useCachedAgentAvatar,
  useCachedChatbotAvatar,
  useCachedPersonAvatar,
} from '../../hooks/useCachedAvatarData';

export const CachedAvatarComponent = ({
  animateDelay,
  senderType,
  senderId,
}: {
  senderId: string;
  senderType:
    | ChatMessageFromType.PERSON
    | ChatMessageFromType.AGENT
    | ChatMessageFromType.CHATBOT;
  animateDelay: number;
}) => {
  let CachedAvatarComponent = null;
  switch (senderType) {
    case ChatMessageFromType.PERSON:
      CachedAvatarComponent = <PersonAvatar personId={senderId} />;
      break;
    case ChatMessageFromType.AGENT:
      CachedAvatarComponent = <AgentAvatar agentId={senderId} />;
      break;
    case ChatMessageFromType.CHATBOT:
      CachedAvatarComponent = <ChatbotAvatar chatbotId={senderId} />;
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

function PersonAvatar({ personId }: { personId: string }) {
  const { findOneRecord, loading, error } = useCachedPersonAvatar(personId);
  const [person, setPerson] = useState<Person | null>(null);
  useEffect(() => {
    findOneRecord({
      objectRecordId: personId,
      onCompleted: (person) => setPerson(person),
    });
  }, [personId]);
  if (loading) {
    return <Avatar placeholder="Loading..." type="rounded" />;
  }
  if (error) {
    return <Avatar placeholder="Error loading avatar" type="rounded" />;
  }
  return (
    <Avatar
      avatarUrl={person?.avatarUrl}
      placeholder={person?.name?.firstName + ' ' + person?.name?.lastName}
      type="rounded"
    />
  );
}

function AgentAvatar({ agentId }: { agentId: string }) {
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
    <Avatar
      avatarUrl={agent?.avatarUrl}
      placeholder={agent?.name?.firstName + ' ' + agent?.name?.lastName}
      type="rounded"
    />
  );
}

function ChatbotAvatar({ chatbotId }: { chatbotId: string }) {
  const { findOneRecord, loading, error } = useCachedChatbotAvatar(chatbotId);
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
  }, [chatbotId]);
  return <Avatar placeholder={chatbot?.name} type="rounded" />;
}
