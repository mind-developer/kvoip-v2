export const TENANT_STANDARD_FIELD_IDS = {
  name: '20202020-fb16-40b0-94e5-5d0944392683',
  owner: '20202020-3eb1-4f6b-bb92-362252862407',
  ownerEmail: '20202020-1df8-4388-ab96-3f96a6151930',
  membersCount: '20202020-b586-4ea7-8b9d-93bac18c2767',
  extentionsCount: '20202020-c970-4ecb-ad0e-6a7032a12083',
  position: '20202020-72a3-4e69-93bc-d5ea34cf8432',
  searchVector: '20202020-c1af-4cec-86b9-44a572e4833b',
  coreWorkspaceId: '20202020-14cd-4c9b-94f4-b0323a6f1055',
  subscriptions: '7128fb62-353d-488b-bd19-928d6eaf3256',
  company: '269af23b-1e82-47d8-b521-489cf835222d',
};

export const OWNER_STANDARD_FIELD_IDS = {
  name: '20202020-22f1-449e-aa30-268b0cc09f83',
  emails: '20202020-4c3a-47b3-8177-477496ec055a',
  phone: '20202020-dc8f-4c60-82c4-548c9d65cffc',
  phones: '20202020-50f3-4434-8e10-0b804ab04fec',
  city: '20202020-475f-4009-be4c-5bb019a7669e',
  avatarUrl: '20202020-eedc-4f14-894f-dd12f1b2cb1d',
  position: '20202020-9f75-491a-842f-5bc5ccbf2b12',
  searchVector: '20202020-23af-4e27-ab46-d2590cbf4e43',
  workspaces: '20202020-0ef4-4e19-9056-a39188d667c8',
  userId: '20202020-b062-4bd4-b8ca-c4cc0fa681bf',
  subscriptions: 'f25ad8db-c76f-4d97-bd64-9d91cadabc6f',
};

export const SUBSCRIPTION_STANDARD_FIELD_IDS = {
  identifier: 'dcdd959f-3666-4c76-b11f-b76c16ff39fb',
  paymentProvider: '138e4bd7-b971-4bcb-b8a9-6aaeefbae863',
  recurrence: '160135f3-2557-4116-8fee-8423e5099a77',
  status: 'b1b5bbe7-f597-4471-8470-cda758ff7858',
  amount: '3e26e16d-8940-448a-897d-ccf3d80c0668',
  trialStart: '08f68ee3-bb75-49f1-a6a4-1c5df68259b2',
  trialEnd: 'e4156740-394d-44f4-819c-1f9b3bd96a4e',
  owner: '126962e5-6e86-48a8-8053-57ccbf27e0d7',
  tenant: 'd7819a1b-c995-485f-9490-4449d4e64ad9',
  subscriptionPlan: 'a1fc7aed-6ce9-4b83-8981-166e0745ce85',
  billingSubscriptionId: 'a6a5371c-004c-4dfd-bcc6-f495c93baf1f',
  position: '6296d60e-b108-4bbf-9944-01df1816555e',
  searchVector: 'b18a4fb4-d868-4164-9f84-3e3d4c10c0d8',
};

export const SUBSCRIPTION_PLAN_STANDARD_FIELD_IDS = {
  name: '14e5594d-7537-4bc7-8470-04307e47139b',
  planKey: 'a2a22f85-88f8-4834-95af-950cc8b7c6ac',
  status: '25f7aa01-f903-4e3f-ab01-465a663643ae',
  subscriptions: '455d575e-c6b3-4244-8069-d0d255312a55',
  position: 'd113aba9-5696-46c2-b60e-0af1cc57328d',
  searchVector: '1bababaa-2232-484c-9d4e-efcbede362a1',
};

export const KVOIP_ADMIN_STANDARD_OBJECT_FIELD_IDS = {
  tenant: TENANT_STANDARD_FIELD_IDS,
  owner: OWNER_STANDARD_FIELD_IDS,
  subscription: SUBSCRIPTION_STANDARD_FIELD_IDS,
  subscriptionPlan: SUBSCRIPTION_PLAN_STANDARD_FIELD_IDS,
};
