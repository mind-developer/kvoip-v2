import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useRecoilValue } from 'recoil';
import { type WorkspaceMember } from '~/generated/graphql';

export const useCurrentWorkspaceMemberWithAgent = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { record: currentWorkspaceMemberRecord } = useFindOneRecord<
    WorkspaceMember & {
      __typename: string;
      agent: {
        id: string;
        sector: { id: string; name: string; icon: string };
        sectorId: string;
        isAdmin: boolean;
      };
    }
  >({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: currentWorkspaceMember?.id || '',
    recordGqlFields: {
      agent: {
        id: true,
        sector: true,
        sectorId: true,
        isAdmin: true,
      },
      name: true,
    },
  });
  return currentWorkspaceMemberRecord;
};
