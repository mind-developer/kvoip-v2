import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useLazyFindManyRecords } from '@/object-record/hooks/useLazyFindManyRecords';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { Person } from '@/people/types/Person';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

// Hook específico para Person Avatar com cache do Apollo
export const useCachedPersonAvatar = (personId: string) => {
  const { findOneRecord, loading, error } = useLazyFindOneRecord<
    Person & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.Person,
    recordGqlFields: {
      avatarUrl: true,
      name: true,
    },
    fetchPolicy: 'cache-and-network',
  });

  return {
    findOneRecord,
    loading,
    error,
  };
};

export const useCachedAgentAvatar = (agentId: string) => {
  const { findManyRecordsLazy } = useLazyFindManyRecords<
    WorkspaceMember & { __typename: string }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    recordGqlFields: {
      avatarUrl: true,
      name: true,
    },
    fetchPolicy: 'cache-and-network',
  });

  return {
    findManyRecordsLazy,
  };
};

export const useCachedChatbotAvatar = (chatbotId: string) => {
  const { findOneRecord, loading, error } = useLazyFindOneRecord<{
    name: string;
    __typename: string;
    id: string;
  }>({
    objectNameSingular: CoreObjectNameSingular.Chatbot,
    recordGqlFields: {
      name: true,
    },
    fetchPolicy: 'cache-and-network',
  });

  return {
    findOneRecord,
    loading,
    error,
  };
};
