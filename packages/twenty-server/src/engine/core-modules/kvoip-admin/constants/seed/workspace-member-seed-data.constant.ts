import { KVOIP_ADMIN_USER } from 'src/engine/core-modules/kvoip-admin/constants/kvoip-admin-user';

type WorkspaceMemberDataSeed = {
  id: string;
  nameFirstName: string;
  nameLastName: string;
  locale: string;
  colorScheme: string;
  userEmail: string;
  userId: string;
};

export const KVOIP_ADMIN_WORKSPACE_MEMBER_DATA_SEED_COLUMNS: (keyof WorkspaceMemberDataSeed)[] =
  [
    'id',
    'nameFirstName',
    'nameLastName',
    'locale',
    'colorScheme',
    'userEmail',
    'userId',
  ];

export const KVOIP_ADMIN_WORKSPACE_MEMBER_DATA_SEED_IDS = {
  ROOT: KVOIP_ADMIN_USER.id,
};

export const KVOIP_ADMIN_WORKSPACE_MEMBER_DATA_SEEDS: WorkspaceMemberDataSeed[] =
  [
    {
      id: KVOIP_ADMIN_WORKSPACE_MEMBER_DATA_SEED_IDS.ROOT,
      nameFirstName: KVOIP_ADMIN_USER.firstName,
      nameLastName: KVOIP_ADMIN_USER.lastName,
      locale: 'pt-BR',
      colorScheme: 'Light',
      userEmail: KVOIP_ADMIN_USER.email,
      userId: KVOIP_ADMIN_USER.id,
    },
  ];
