import { version } from 'react';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { KVOIP_ADMIN_USER } from 'src/engine/core-modules/kvoip-admin/constants/kvoip-admin-user';

export const KVOIP_ADMIN_WORKSPACE = {
  id: '3f3435c8-8eee-4303-9235-fc5fa4b78cc7',
  displayName: 'Woulz',
  subdomain: 'kvoip',
  // inviteHash: 'kvoip.woulz-invite-hash',
  logo: 'https://app.woulz.com.br/images/icons/windows11/Woulz-logo.png',
  activationStatus: WorkspaceActivationStatus.PENDING_CREATION, // will be set to active after default role creation
  version: version,
  creatorEmail: KVOIP_ADMIN_USER.email,
};
