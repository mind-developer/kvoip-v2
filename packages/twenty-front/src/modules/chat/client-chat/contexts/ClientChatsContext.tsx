import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { createContext, useContext } from 'react';
import { ClientChat } from 'twenty-shared/types';

type ClientChatsContextValue = {
  chats: ClientChat[];
  sectors: (Sector & { __typename: string })[];
  loading: boolean;
};

export const ClientChatsContext = createContext<
  ClientChatsContextValue | undefined
>(undefined);

export const useClientChatsContext = () => {
  const context = useContext(ClientChatsContext);
  if (!context) {
    throw new Error(
      'useClientChatsContext must be used within a ClientChatsContextProvider',
    );
  }
  return context;
};
