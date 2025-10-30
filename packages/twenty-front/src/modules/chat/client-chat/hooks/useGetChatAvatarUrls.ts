import {
  useCachedAgentAvatar,
  useCachedChatbotAvatar,
  useCachedPersonAvatar,
} from '@/chat/client-chat/hooks/useCachedAvatarData';
import {
  ChatMessageFromType,
  type ClientChatMessage,
} from 'twenty-shared/types';

const useGetChatAvatarUrls = (messages: ClientChatMessage[]) => {
  const participants = messages.map((message) => ({
    from: message.from,
    fromType: message.fromType,
  }));
  const uniqueParticipants = [...new Set(participants)];

  const avatarUrls = uniqueParticipants.map((participant) => {
    if (participant.fromType === ChatMessageFromType.PERSON) {
      return useCachedPersonAvatar(participant.from);
    } else if (participant.fromType === ChatMessageFromType.AGENT) {
      return useCachedAgentAvatar(participant.from);
    } else if (participant.fromType === ChatMessageFromType.CHATBOT) {
      return useCachedChatbotAvatar(participant.from);
    }
    return null;
  });
  return avatarUrls;
};
