import { type FieldPhonesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type Agent } from '@/settings/service-center/agents/types/Agent';
import {
  type WorkspaceMemberDateFormatEnum,
  type WorkspaceMemberTimeFormatEnum,
} from '~/generated/graphql';

export type ColorScheme = 'Dark' | 'Light' | 'System';

export type WorkspaceMember = {
  __typename: 'WorkspaceMember';
  id: string;
  name: {
    __typename?: 'FullName';
    firstName: string;
    lastName: string;
  };
  avatarUrl?: string | null;
  locale: string | null;
  colorScheme: ColorScheme;
  createdAt: string;
  updatedAt: string;
  userEmail: string;
  userId: string;
  timeZone?: string | null;
  dateFormat?: WorkspaceMemberDateFormatEnum | null;
  timeFormat?: WorkspaceMemberTimeFormatEnum | null;
  extensionNumber?: string;
  userDocument?: string | null;
  userPhone?: FieldPhonesValue | null;
  calendarStartDay?: number | null;
  agent: Agent | null;
  agentId: string | null;
};

export type WorkspaceInvitation = {
  __typename: 'WorkspaceInvitation';
  id: string;
  email: string;
  expiresAt: string;
};
