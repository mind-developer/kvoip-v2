import { Inbox } from '@/settings/service-center/inboxes/types/InboxType';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export interface Agent {
  id: string;
  isAdmin: boolean;
  isActive?: boolean;
  memberId: string;
  inboxes: Inbox[];
  sectors?: Sector[];
  createdAt: string;
  updatedAt: string;
  workspaceMember?: WorkspaceMember;
}
