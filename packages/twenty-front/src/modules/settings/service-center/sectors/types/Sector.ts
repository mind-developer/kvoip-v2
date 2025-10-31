import { SectorTopic } from '@/settings/service-center/sectors/types/SectorTopic';

export interface Sector {
  __typename: 'Sector';
  id: string;
  icon: string;
  name: string;
  topics: SectorTopic[];
  createdAt: string;
  updatedAt: string;
  workspace: {
    id: string;
    displayName: string;
  };
}
