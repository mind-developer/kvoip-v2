import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useRecoilValue } from 'recoil';
import { WorkspaceMember } from '~/generated/graphql';

export const useCurrentWorkspaceMemberWithAgent = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { record: currentWorkspaceMemberRecord } = useFindOneRecord<
    WorkspaceMember & {
      __typename: string;
      agent: { id: string; sectorId: string };
    }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: currentWorkspaceMember?.id || '',
    recordGqlFields: {
      agent: true,
      name: true,
    },
  });
  return currentWorkspaceMemberRecord;
};
