import { CurrentWorkspaceMember } from '@/auth/states/currentWorkspaceMemberState';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

export type MockWorkspaceMember = Omit<
  WorkspaceMember,
  'agentId' | 'userPhone'
>;

export const mockWorkspaceMembers: MockWorkspaceMember[] = [
  {
    id: '20202020-1553-45c6-a028-5a9064cce07f',
    name: {
      firstName: 'Jane',
      lastName: 'Doe',
    },
    __typename: 'WorkspaceMember',
    userEmail: 'jane.doe@twenty.com',
    locale: 'en',
    avatarUrl: '',
    createdAt: '2023-12-18T09:51:19.645Z',
    updatedAt: '2023-12-18T09:51:19.645Z',
    userId: '20202020-7169-42cf-bc47-1cfef15264b8',
    colorScheme: 'Light' as const,
  },
  {
    id: '20202020-77d5-4cb6-b60a-f4a835a85d61',
    name: {
      firstName: 'John',
      lastName: 'Wick',
    },
    userEmail: 'john.wick@twenty.com',
    __typename: 'WorkspaceMember',
    locale: 'en',
    avatarUrl: '',
    createdAt: '2023-12-18T09:51:19.645Z',
    updatedAt: '2023-12-18T09:51:19.645Z',
    userId: '20202020-3957-4908-9c36-2929a23f8357',
    colorScheme: 'Dark' as const,
  },
];

export const mockCurrentWorkspaceMembers: CurrentWorkspaceMember[] =
  mockWorkspaceMembers.map(
    ({
      id,
      locale,
      name,
      avatarUrl,
      colorScheme,
      dateFormat,
      timeFormat,
      timeZone,
    }) => ({
      id,
      locale,
      name,
      avatarUrl,
      colorScheme,
      dateFormat,
      timeFormat,
      timeZone,
    }),
  );
