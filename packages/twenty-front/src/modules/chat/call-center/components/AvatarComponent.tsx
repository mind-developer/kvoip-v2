import { motion } from 'framer-motion';
import { ChatMessageFromType } from 'twenty-shared/types';
import { Avatar } from 'twenty-ui/display';
import {
  useCachedAgentAvatar,
  useCachedChatbotAvatar,
  useCachedPersonAvatar,
} from '../hooks/useCachedAvatarData';

export const AvatarComponent = ({
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
  let AvatarComponent = null;
  switch (senderType) {
    case ChatMessageFromType.PERSON:
      AvatarComponent = <PersonAvatar personId={senderId} />;
      break;
    case ChatMessageFromType.AGENT:
      AvatarComponent = <AgentAvatar agentId={senderId} />;
      break;
    case ChatMessageFromType.CHATBOT:
      AvatarComponent = <ChatbotAvatar chatbotId={senderId} />;
      break;
    default:
      AvatarComponent = null;
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
      {AvatarComponent}
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
