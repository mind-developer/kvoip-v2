import { motion } from 'framer-motion';
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
  const { record: person } = useCachedPersonAvatar(personId);
  return (
    <Avatar
      avatarUrl={person?.avatarUrl}
      placeholder={person?.name?.firstName + ' ' + person?.name?.lastName}
      type="rounded"
    />
  );
}

function AgentAvatar({ agentId }: { agentId: string }) {
  if (!agentId) {
    return null;
  }
  const { record: agentWithMember } = useCachedAgentAvatar(agentId);
  return (
    <Avatar
      avatarUrl={agentWithMember?.avatarUrl}
      placeholder={
        agentWithMember?.name?.firstName + ' ' + agentWithMember?.name?.lastName
      }
      type="rounded"
    />
  );
}

function ChatbotAvatar({ chatbotId }: { chatbotId: string }) {
  const { record: chatbot } = useCachedChatbotAvatar(chatbotId);
  return <Avatar placeholder={chatbot?.name} type="rounded" />;
}
