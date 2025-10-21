import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { Person } from '@/people/types/Person';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

// Hook específico para Person Avatar com cache do Apollo
export const useCachedPersonAvatar = (personId: string) => {
  const {
    record: person,
    loading,
    error,
  } = useFindOneRecord<Person & { __typename: string }>({
    objectNameSingular: 'person',
    objectRecordId: personId,
  });

  return {
    record: person,
    loading,
    error,
  };
};

export const useCachedAgentAvatar = (agentId: string) => {
  const {
    records: workspaceMemberWithAgent,
    loading,
    error,
  } = useFindManyRecords<WorkspaceMember & { __typename: string }>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    recordGqlFields: {
      avatarUrl: true,
      name: true,
    },
    filter: {
      agentId: {
        eq: agentId,
      },
    },
  });
  const agentWithMember = workspaceMemberWithAgent[0];

  return {
    record: agentWithMember,
    loading,
    error,
  };
};

export const useCachedChatbotAvatar = (chatbotId: string) => {
  const {
    record: chatbot,
    loading,
    error,
  } = useFindOneRecord<{
    name: string;
    __typename: string;
    id: string;
  }>({
    objectNameSingular: CoreObjectNameSingular.Chatbot,
    objectRecordId: chatbotId,
    recordGqlFields: {
      name: true,
    },
  });

  return {
    record: chatbot,
    loading,
    error,
  };
};
