import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { UnreadMessages } from '@/chat/types/MessageType';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Agent } from '@/settings/service-center/agents/types/Agent';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { createContext, useCallback, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { ClientChat } from 'twenty-shared/types';

// Tipos simplificados
export type CallCenterContextType = {
  // Seleção de chat
  selectedChatId: string | null;
  setSelectedChatId: (id: string | null) => void;
  selectedChat: ClientChat | undefined;
  setSelectedChat: (chat: ClientChat | undefined) => void;

  // Mensagens não lidas
  unreadTabMessages: UnreadMessages | null;

  // Agente atual
  currentMember: WorkspaceMember | undefined;

  // Iniciar chat
  isStartChatOpen: boolean;
  setIsStartChatOpen: (open: boolean) => void;
  startChatNumber: string | null;
  setStartChatNumber: (number: string | null) => void;
  startChatIntegrationId: string | null;
  setStartChatIntegrationId: (id: string | null) => void;

  // Ações de serviço
  startService: () => void;
  finalizeService: () => void;
  transferService: (agent?: WorkspaceMember, sector?: Sector) => void;
  holdService: () => void;

  // Agentes disponíveis
  workspaceAgents: WorkspaceMember[];
};

const CallCenterContext = createContext<CallCenterContextType | null>(null);

export const CallCenterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Estados básicos
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<ClientChat | undefined>(
    undefined,
  );
  const [unreadTabMessages, setUnreadTabMessages] =
    useState<UnreadMessages | null>(null);
  const [isStartChatOpen, setIsStartChatOpen] = useState<boolean>(false);
  const [startChatNumber, setStartChatNumber] = useState<string | null>(null);
  const [startChatIntegrationId, setStartChatIntegrationId] = useState<
    string | null
  >(null);

  // Dados do workspace
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });
  const { records: agents } = useFindManyRecords<Agent>({
    objectNameSingular: CoreObjectNameSingular.Agent,
  });
  const { records: sectors } = useFindManyRecords<
    Sector & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Sector,
  });

  const currentMember = workspaceMembers?.find(
    (member) => member.id === currentWorkspaceMember?.id,
  );

  const agentIds = agents?.map((agent) => agent.id);
  const workspaceAgents: WorkspaceMember[] =
    workspaceMembers?.filter(
      (member) =>
        member.agentId &&
        agentIds?.includes(member.agentId) &&
        currentMember?.agentId !== member.agentId,
    ) || [];

  // Ações de serviço (implementação básica)
  const startService = useCallback(() => {
    // TODO: Implementar lógica de iniciar serviço
    console.log('Starting service...');
  }, []);

  const finalizeService = useCallback(() => {
    // TODO: Implementar lógica de finalizar serviço
    console.log('Finalizing service...');
  }, []);

  const transferService = useCallback(
    (agent?: WorkspaceMember, sector?: Sector) => {
      // TODO: Implementar lógica de transferir serviço
      console.log('Transferring service...', { agent, sector });
    },
    [],
  );

  const holdService = useCallback(() => {
    // TODO: Implementar lógica de colocar em espera
    console.log('Holding service...');
  }, []);

  return (
    <CallCenterContext.Provider
      value={{
        selectedChatId,
        setSelectedChatId,
        selectedChat,
        setSelectedChat,
        unreadTabMessages,
        currentMember,
        isStartChatOpen,
        setIsStartChatOpen,
        startChatNumber,
        setStartChatNumber,
        startChatIntegrationId,
        setStartChatIntegrationId,
        startService,
        finalizeService,
        transferService,
        holdService,
        workspaceAgents,
      }}
    >
      {children}
    </CallCenterContext.Provider>
  );
};

export { CallCenterContext };
