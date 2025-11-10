import { WhatsappDocument } from '@/chat/types/WhatsappDocument';

export const sort = (whatsappChats: WhatsappDocument[]) => {
  return [...whatsappChats]?.sort((a, b) => {
    return (
      // TODO: Remove ts error
      // @ts-expect-error
      new Date(b.lastMessage.createdAt.toDate()).getTime() -
      // @ts-expect-error
      new Date(a.lastMessage.createdAt.toDate()).getTime()
    );
  });
};
