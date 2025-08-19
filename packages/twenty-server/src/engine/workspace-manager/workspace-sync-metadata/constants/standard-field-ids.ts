/**
 * /!\ DO NOT EDIT THE IDS OF THIS FILE /!\
 * This file contains static ids for standard objects.
 * These ids are used to identify standard objects in the database and compare them even when renamed.
 * For readability keys can be edited but the values should not be changed.
 */

// TODO: check if this can be deleted
export const ACTIVITY_TARGET_STANDARD_FIELD_IDS = {
  activity: '20202020-ca58-478c-a4f5-ae825671c30e',
  person: '20202020-4afd-4ae7-99c2-de57d795a93f',
  company: '20202020-7cc0-44a1-8068-f11171fdd02e',
  opportunity: '20202020-1fc2-4af1-8c91-7901ee0fd38b',
  custom: '20202020-7f21-442f-94be-32462281b1ca',
};

// TODO: check if this can be deleted
export const ACTIVITY_STANDARD_FIELD_IDS = {
  title: '20202020-24a1-4d94-a071-617f3eeed7b0',
  body: '20202020-209b-440a-b2a8-043fa36a7d37',
  type: '20202020-0f2b-4aab-8827-ee5d3f07d993',
  reminderAt: '20202020-eb06-43e2-ba06-336be0e665a3',
  dueAt: '20202020-0336-4511-ba79-565b12801bd9',
  completedAt: '20202020-0f4d-4fca-9f2f-6309d9ecb85f',
  activityTargets: '20202020-7253-42cb-8586-8cf950e70b79',
  attachments: '20202020-5547-4197-bc2e-a07dfc4559ca',
  comments: '20202020-6b2e-4d29-bbd1-ecddb330e71a',
  author: '20202020-455f-44f2-8e89-1b0ef01cb7fb',
  assignee: '20202020-4259-48e4-9e77-6b92991906d5',
};

export const API_KEY_STANDARD_FIELD_IDS = {
  name: '20202020-72e6-4079-815b-436ce8a62f23',
  expiresAt: '20202020-659b-4241-af59-66515b8e7d40',
  revokedAt: '20202020-06ab-44b5-8faf-f6e407685001',
};

export const ATTACHMENT_STANDARD_FIELD_IDS = {
  name: '20202020-87a5-48f8-bbf7-ade388825a57',
  fullPath: '20202020-0d19-453d-8e8d-fbcda8ca3747',
  type: '20202020-a417-49b8-a40b-f6a7874caa0d',
  author: '20202020-6501-4ac5-a4ef-b2f8522ef6cd',
  activity: '20202020-b569-481b-a13f-9b94e47e54fe',
  task: '20202020-51e5-4621-9cf8-215487951c4b',
  note: '20202020-4f4b-4503-a6fc-6b982f3dffb5',
  person: '20202020-0158-4aa2-965c-5cdafe21ffa2',
  company: '20202020-ceab-4a28-b546-73b06b4c08d5',
  opportunity: '20202020-7374-499d-bea3-9354890755b5',
  custom: '20202020-302d-43b3-9aea-aa4f89282a9f',
  charge: '20202020-e674-48e5-a542-72570eee7216',
  integration: '20202020-6b3b-4b3b-8b3b-7f8d6a1d7d5b',
  notaFiscal: '76b1e10e-2f13-4f94-9d0f-232d7fa534ba',
};

export const BASE_OBJECT_STANDARD_FIELD_IDS = {
  id: '20202020-eda0-4cee-9577-3eb357e3c22b',
  createdAt: '20202020-66ac-4502-9975-e4d959c50311',
  updatedAt: '20202020-d767-4622-bdcf-d8a084834d86',
  deletedAt: '20202020-b9a7-48d8-8387-b9a3090a50ec',
};

export const BLOCKLIST_STANDARD_FIELD_IDS = {
  handle: '20202020-eef3-44ed-aa32-4641d7fd4a3e',
  workspaceMember: '20202020-548d-4084-a947-fa20a39f7c06',
};

export const CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS = {
  calendarChannel: '20202020-93ee-4da4-8d58-0282c4a9cb7d',
  calendarEvent: '20202020-5aa5-437e-bb86-f42d457783e3',
  eventExternalId: '20202020-9ec8-48bb-b279-21d0734a75a1',
  recurringEventExternalId: '20202020-c58f-4c69-9bf8-9518fa31aa50',
};

export const CALENDAR_CHANNEL_STANDARD_FIELD_IDS = {
  connectedAccount: '20202020-95b1-4f44-82dc-61b042ae2414',
  handle: '20202020-1d08-420a-9aa7-22e0f298232d',
  visibility: '20202020-1b07-4796-9f01-d626bab7ca4d',
  isContactAutoCreationEnabled: '20202020-50fb-404b-ba28-369911a3793a',
  contactAutoCreationPolicy: '20202020-b55d-447d-b4df-226319058775',
  isSyncEnabled: '20202020-fe19-4818-8854-21f7b1b43395',
  syncCursor: '20202020-bac2-4852-a5cb-7a7898992b70',
  calendarChannelEventAssociations: '20202020-afb0-4a9f-979f-2d5087d71d09',
  throttleFailureCount: '20202020-525c-4b76-b9bd-0dd57fd11d61',
  syncStatus: '20202020-7116-41da-8b4b-035975c4eb6a',
  syncStage: '20202020-6246-42e6-b5cd-003bd921782c',
  syncStageStartedAt: '20202020-a934-46f1-a8e7-9568b1e3a53e',
  syncedAt: '20202020-2ff5-4f70-953a-3d0d36357576',
};

export const CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS = {
  calendarEvent: '20202020-fe3a-401c-b889-af4f4657a861',
  handle: '20202020-8692-4580-8210-9e09cbd031a7',
  displayName: '20202020-ee1e-4f9f-8ac1-5c0b2f69691e',
  isOrganizer: '20202020-66e7-4e00-9e06-d06c92650580',
  responseStatus: '20202020-cec0-4be8-8fba-c366abc23147',
  person: '20202020-5761-4842-8186-e1898ef93966',
  workspaceMember: '20202020-20e4-4591-93ed-aeb17a4dcbd2',
};

export const CALENDAR_EVENT_STANDARD_FIELD_IDS = {
  title: '20202020-080e-49d1-b21d-9702a7e2525c',
  isCanceled: '20202020-335b-4e04-b470-43b84b64863c',
  isFullDay: '20202020-551c-402c-bb6d-dfe9efe86bcb',
  startsAt: '20202020-2c57-4c75-93c5-2ac950a6ed67',
  endsAt: '20202020-2554-4ee1-a617-17907f6bab21',
  externalCreatedAt: '20202020-9f03-4058-a898-346c62181599',
  externalUpdatedAt: '20202020-b355-4c18-8825-ef42c8a5a755',
  description: '20202020-52c4-4266-a98f-e90af0b4d271',
  location: '20202020-641a-4ffe-960d-c3c186d95b17',
  iCalUID: '20202020-f24b-45f4-b6a3-d2f9fcb98714',
  conferenceSolution: '20202020-1c3f-4b5a-b526-5411a82179eb',
  conferenceLink: '20202020-35da-43ef-9ca0-e936e9dc237b',
  calendarChannelEventAssociations: '20202020-bdf8-4572-a2cc-ecbb6bcc3a02',
  calendarEventParticipants: '20202020-e07e-4ccb-88f5-6f3d00458eec',
};

// TODO: check if this can be deleted
export const COMMENT_STANDARD_FIELD_IDS = {
  body: '20202020-d5eb-49d2-b3e0-1ed04145ebb7',
  author: '20202020-2ab1-427e-a981-cf089de3a9bd',
  activity: '20202020-c8d9-4c30-a35e-dc7f44388070',
};

export const COMPANY_STANDARD_FIELD_IDS = {
  name: '20202020-4d99-4e2e-a84c-4a27837b1ece',
  domainName: '20202020-0c28-43d8-8ba5-3659924d3489',
  address_deprecated: '20202020-a82a-4ee2-96cc-a18a3259d953',
  address: '20202020-c5ce-4adc-b7b6-9c0979fc55e7',
  employees: '20202020-8965-464a-8a75-74bafc152a0b',
  linkedinLink: '20202020-ebeb-4beb-b9ad-6848036fb451',
  xLink: '20202020-6f64-4fd9-9580-9c1991c7d8c3',
  annualRecurringRevenue: '20202020-602a-495c-9776-f5d5b11d227b',
  idealCustomerProfile: '20202020-ba6b-438a-8213-2c5ba28d76a2',
  position: '20202020-9b4e-462b-991d-a0ee33326454',
  createdBy: '20202020-fabc-451d-ab7d-412170916baa',
  people: '20202020-3213-4ddf-9494-6422bcff8d7c',
  accountOwner: '20202020-95b8-4e10-9881-edb5d4765f9d',
  // TODO: check if activityTargets field can be deleted
  activityTargets: '20202020-c2a5-4c9b-9d9a-582bcd57fbc8',
  taskTargets: '20202020-cb17-4a61-8f8f-3be6730480de',
  noteTargets: '20202020-bae0-4556-a74a-a9c686f77a88',
  opportunities: '20202020-add3-4658-8e23-d70dccb6d0ec',
  favorites: '20202020-4d1d-41ac-b13b-621631298d55',
  attachments: '20202020-c1b5-4120-b0f0-987ca401ed53',
  timelineActivities: '20202020-0414-4daf-9c0d-64fe7b27f89f',
  searchVector: '85c71601-72f9-4b7b-b343-d46100b2c74d',
  charge: '20202020-e674-48e5-a542-72570eee7216',
  support: '9ee2b3f5-0824-4f8b-be4e-750ac95c98d5',
  CPF_CNPJ: 'c1581b5a-6ad0-4b68-b316-1ab24c2c47ba',
  INSCRICAO_ESTADUAL: '00edc84c-4d61-460f-8ea8-807b18cc5815',
  PERCENT_NFE: '993c99ca-4e7b-4224-a498-f1dc482fe18a',
  PERCENT_NFSE: '168d02f8-38a5-4d0c-8c1e-e1b9fe6ba8bc',
  PERCENT_NFCE: '09d39ebb-b11a-4dc9-bfb2-4eb847d110f7',
  PERCENT_NFCOM: '67c3796a-ac1f-4376-9e3c-5c401c62d2b8',

  billingModel: '4cc08331-5132-469f-97bf-c74d978c0ac5',
  cdrId: '90cdde6a-eaf2-4b96-8bd9-369a2a851e64',
  typeDiscount: '134bf698-f696-4c43-b8a8-9eb3e6a2cc41',
  discount: '8f18333e-fd58-4a58-86e6-a1257b1f75c5',
  quantitiesRemainingFinancialClosingsDiscounts: '9e02eaaf-cd24-4fad-a935-53a7f6388b4c',
  totalValueCharged: '7f37e462-60dc-4088-8b84-90702f58abed',
  valueMinimumMonthly: '5463a986-cbb6-4a7a-a23d-4bc0ae6dfa79',
  valueFixedMonthly: '7406e13b-7bb9-4ffa-ba24-035b4936b96e',
  slipDueDay: '99b453b5-31bc-411b-87ef-71f36c477610',
  typeEmissionNF: '2dc5ea21-1510-42fd-b3a8-cd38dab6d10d',
  
  codigoMunicipio: 'f623074b-8340-487e-950b-3fcc0518a8f1',
  product: 'fbae06bc-d776-48b6-8978-f733f0f66045',
  inscricaoMunicipal: '19b7778f-fcea-4300-b134-30e9604657af',
  emails: '1c69a407-3c72-4b9c-9c22-d9c9081bb226',
  notaFiscal: '5f007e23-1389-4ea1-a5cc-edc871f01ad3',
};

export const CHARGE_STANDARD_FIELD_IDS = {
  name: '20202020-6b3b-4b3b-8b3b-7f8d6a1d7c66',
  company: '20202020-0b7b-4d0d-8b5d-4b7c3d2b0f9f',
  contact: '20202020-0b7b-4d0d-8b5d-4b7c3d2bm9pe',
  product: '20202020-0b7b-4d0d-8b5d-4b7c3d2b6f3a',
  price: '20202020-0b7b-4d0d-8b5d-4b7c3d2b6f3b',
  createdAt: '20202020-0b7b-4d0d-8b5d-4b7c3d2b6f3c',
  quantity: '20202020-0b7b-4d0d-867a-4b7c3d2b6f3d',
  discount: '20202020-0b7b-4d0d-8b5d-4b7c3d2b6f3e',
  recurrence: '20202020-0b7b-4d0d-8b5d-4b7c3d2b623a',
  entityType: '20202020-a1b2-4c3d-8e4f-5f6a7b8c9d01',
  taxId: '20202020-b2c3-5d4e-9f5a-6a7b8c9d0e12',
  paymentGateway: '20202020-0b7b-4d0d-8b5d-4b7c3d2b234f',
  activityTargets: '20202020-0b7b-4d0d-8b5d-4b7c3d2b259c',
  chargeAction: '20202020-7a4c-5d2e-9f1b-3e8c7d6a2f4d',
  requestCode: '20202020-4a2d-4f1c-9e3b-5d8c6b2a1f7e',
  position: '20202020-fcd5-4231-aff5-fff583eaa0a1',
  attachments: 'bdc8497f-9ecb-451d-aa35-17dbade48b71',
  person: '20202020-3213-4ddf-9494-6422bcff8d7c',
  timelineActivities: '20202020-0416-4cac-4c0c-34ae7b25f89b',
  integration: '20202020-6b3b-4b3b-8b3b-7f8d6a1d7c5a',
  searchVector: '85c71601-72f9-4b7b-b343-d46100b2a56b',
  notaFiscal: 'c3a90d91-f458-4331-8d55-ff86a066191d',
};

export const SUPPORT_STANDARD_FIELD_IDS = {
  name: '5217e7f5-bd7a-4af5-8bbd-ec21c5f7d3af',
  statuses: '885031ad-d3e8-47c5-8d56-ce9759e96a45',
  stage: 'a7b70e6e-6f17-4ad4-81a6-1783d9bd09bc',
  emails: 'a4f41a54-293b-40f0-879f-68e706ad1328',
  phones: '852115fc-0aa4-4b90-bc28-d2f33778e33b',
  noteTargets: 'a4ad3074-5c0b-4448-93ed-53faf5762988',
  position: 'ad171f33-970a-4efc-b628-b54295fb2e84',
  person: '918887f8-37c5-4747-abe4-dd0e9491a1d5',
  timelineActivities: '4c8bf8da-92c4-421c-b267-6229095245f3',
  searchVector: '78a63bbb-83d8-472b-bd90-162c43f4f414',
};

export const PRODUCT_STANDARD_FIELD_IDS = {
  name: '02020202-6b3b-4b3b-8b3b-7f8d6a1d7c63',
  salePrice: '20202020-6b3b-4b3b-8b3b-7f8d6a1d7c5b',
  cost: '20202020-6b3b-4b3b-8b3b-7f8d6a1d7c5c',
  createdAt: '20202020-6b3b-4b3b-8b3b-7f8d6a1d7c5d',
  updatedAt: '20202020-6b3b-4b3b-8b3b-7f8d6a1d7c5e',
  unitOfMeasure: '20202020-6b3b-4b3b-8b3b-7f8d6a1d7c5f',
  status: '20202020-6b3b-4b3b-8b3b-7f8d6a1d7c60',
  position: '20202020-6b3b-4b3b-8b3b-7f8d6a1d7c61',
  searchVector: '20202020-6b3b-4b3b-8b3b-7f8d6a1d7c62',
  charges: '20202020-6b3b-4b3b-8b3b-7f8d6a1d7c68',
  ncm: '0beb7064-e505-4451-82a1-4469b3ac68f2',
  cfop: 'b8990536-861d-4ede-82c1-4e794b8bdaae',
  cest: '46b3b263-8245-4eb6-bd80-1894c3d5fef3',
  unidade: 'aab4abdd-101b-4b4d-9004-f38da02c1c03',
  origem: '8523f0af-4e57-40b9-8b91-6da6d35a5f6d',
  cstIcmsCsosn: 'c6efc059-14fe-4ffb-a884-5e57bf0d556b',
  cstPis: '004ea842-997a-4f9a-8099-23ecfcaea421',
  cstCofins: 'ebcc8de5-3821-43f1-bd42-2261fbc81f96',
  aliquotaIcms: '5dce0057-f878-4e98-9901-889ba0c6a53d',
  aliquotaPis: '542891a0-5388-4ac8-b58a-ce3404704f49',
  aliquotaCofins: 'd3719fd0-094c-435d-bb89-b3134bb56df7',
  valorIpi: 'adf71e83-c959-4eba-991e-33672d835622',
  productType: '73460110-2f05-49db-a76e-7c0ac0880888',
  company: 'a9e553b0-b233-474a-a22b-5f76541e1f70',
  aliquotaIss: 'cd4d2f86-ed16-4eee-b78a-412a2a5e3be9',
  issRetido: 'a236232b-4da2-43ca-b18f-99d96bbc1790',
  itemListaServico: 'c4606156-e1b0-477d-972f-1373be7099f4',
  codigoTributarioMunicipio: '731eda3a-f8a3-418d-b84d-c2bc675e4507',
  notaFiscal: '71aceb60-96b8-4c23-b5c0-aadd9f6b256e',
  classificacao: '809c09e7-469c-4c5e-ac63-12c7b9ab7c69',
};

export const TRACEABLE_STANDARD_FIELD_IDS = {
  name: '20202020-0707-4245-9105-6b568abfab9f',
  websiteUrl: '20202020-9876-5432-1abc-def654321fed',
  campaignName: '20202020-abcd-ef12-3456-7890abcdef12',
  campaignSource: '20202020-5678-90ab-cdef-1234567890ab',
  meansOfCommunication: '20202020-4321-8765-cba9-fed123456789',
  keyword: '20202020-8e7d-6c5b-4a3a-2b1c0d9e8f7a',
  campaignContent: '20202020-e52a-4e7c-9445-c9390d78bcb3',
  generatedUrl: '20202020-e611-4874-ba80-3d45cf541b2a',
  url: '20202020-44fb-4853-90b4-7162977abc80',
  position: '20202020-1a2b-3c4d-5e6f-7a8b9c0d1e2f',
  timelineActivities: '20202020-b751-43e3-a9f0-186288344f21',
  searchVector: '20202020-8c9d-7e6f-5a4b-3c2d1e0f9a8b',
};

export const LINKLOGS_STANDARD_FIELD_IDS = {
  name: '20202020-8e7f-6a5b-4c3d-2e1f0a9b8c7d',
  linkId: '20202020-3a4b-5c6d-7e8f-9a0b1c2d3e4f',
  position: '20202020-0b7b-4d0d-8b5d-4b7c3d2b9a4c',
  product: '20202020-0b7b-4d0d-8b5d-4b7c3d2b2d8a',
  utmSource: '20202020-4b5c-6d7e-8f9a-0b1c2d3e4f5a',
  utmMedium: '20202020-5c6d-7e8f-9a0b-1c2d3e4f5a6b',
  utmCampaign: '20202020-6d7e-8f9a-0b1c-2d3e4f5a6b7c',
  userIp: '20202020-7e8f-9a0b-1c2d-3e4f5a6b7c8d',
  userAgent: '20202020-8f9a-0b1c-2d3e-4f5a6b7c8d9e',
  linkName: '20202020-0b7b-4d0d-8b5d-4b7c3d2b3e7a',
  uv: '20202020-0b7b-4d0d-8b5d-4b7c3d2b5f8b',
  searchVector: '20202020-0b7b-4d0d-8b5d-4b7c3d2b7e3f',
};

export const INTEGRATION_STANDARD_FIELD_IDS = {
  name: '20202020-9f5a-4f9b-8b7e-6e2d9e8e0a5d',
  activityTargets: '20202020-4b3b-4b3b-8b3b-7f8d6a1d7d5b',
  charge: '20202020-4b3b-4b3b-8b3b-7f8d6a1d7d5c',
  timelineActivities: '20202020-4b3b-4b3b-8b3b-7f8d6a1d7d5d',
  attachments: '20202020-4b3b-4b3b-8b3b-7f8d6a1d7d5e',
  position: '20202020-4b3b-4b3b-8b3b-7f8d6a1d7d5f',
  searchVector: '85c71601-72f9-4b7b-b343-d00000b2a27a',
};

export const FOCUS_NFE_STANDARD_FIELD_ID = {
  name: '967f34da-329a-474a-abd3-0d51be34f77c',
  token: 'cf261d88-362b-43df-85fd-cf619db75673',
  status: '2505caf2-55a0-4436-902b-7b701589e4c3',
  companyName: '78ee798d-5159-4ef1-8605-d3feb5affdae',
  cnpj: '69f06cd5-cd7d-4347-84ec-37a1c5d8c5c2',
  cpf: '1c52a36f-a861-4be8-87cf-4886fdc0838d',
  ie: 'de687d17-3e91-4006-bb96-d801164d8d5c',
  inscricaoMunicipal: 'cf3a079a-6e94-4790-b34f-a586c994a48f',
  cnaeCode: 'b1423921-bbbc-4f1f-9f64-6053b708fb54',
  cep: '35971a54-f710-4320-b18c-90c1c6d6de86',
  street: '535e3761-b827-4428-85a7-e4fd6a68308f',
  number: '2c114dc6-c64e-4666-bf85-20ce99a68eca',
  neighborhood: '02bcc412-be9b-4f36-a97f-d3e33b304a81',
  city: '78109c24-df0d-46f7-a7d5-d239bafb363d',
  state: '4eb18f9f-a1b6-469a-b877-064630d01635',
  taxRegime: '25913ca9-c4e2-4333-a7e0-de84a621f520',
  position: 'c7e01234-d211-4a85-94f2-bcd0ba8d00ea',
  searchVector: '2e4ba6eb-fe44-44e4-b9e5-840925dda55b',
  notaFiscal: 'df67718b-deba-4f31-b947-e9a8b4967976',
};

export const NOTA_FISCAL_FIELD_IDS = {
  name: '1881e61b-4bd7-4aa7-ad37-6e507a99e9c6',
  nfType: '2548531e-456f-4ca8-b85b-a7260326e696',
  totalAmount: '18adc333-c20a-4131-99a6-394822409d0c',
  unitOfMeasure: '75476681-7d40-4a1e-a561-d4438aa82d02',
  percentNFe: '59d92ce3-4efd-47a3-b6c4-0ea3000e63ab',
  percentNFSe: '3fde8ab9-95d7-4073-b722-b62f83b0d7dc',
  percentNFCe: 'bdfb4309-1dc8-4dbf-a4ae-afcd417d9667',
  percentNFCom: 'a1f67bd3-aaed-4b28-885a-f69d29b6a873',
  attachments: '2a16bc6b-527a-410a-9813-c9b0565f5f6c',
  nfStatus: '767cc322-394d-4c7d-82e1-23215603fc91',
  ncm: 'c0cd3d9c-bcc2-4d75-8d8c-c8663e677cba',
  cfop: '284b42dc-e264-431f-b7e9-3106f7ec8e98',
  cstIcmsCsosn: '98ff97ad-a078-4188-b855-835db313c723',
  origem: '9bf6b523-cba2-4df1-b1a5-0e3e274290b1',
  aliquotaIcms: 'eb601572-7c52-4dad-b077-585bc1615374',
  aliquotaPis: '12f215c3-038e-44d3-8bc3-30a43a21aed9',
  aliquotaCofins: '56df9004-2ad1-4a35-93d4-d5976768b525',
  aliquotaIpi: '6f2f3e01-521d-4a14-8167-eed31cd1e698',
  aliquotaIss: 'c8dac85c-20a2-4bb2-8d8e-8126976e812f',
  issRetido: 'bb7f967a-6ec7-4410-9b3f-656c32dbe05e',
  itemListaServico: 'a77b6974-b911-4e50-9ad5-7fb547ddb8fd',
  position: '50184293-008d-4d8e-84a4-d99f5d86ef98',
  charge: '390bbb03-c3e8-4580-942a-897383695974',
  company: '34b09c03-ae49-4293-8c08-c4e5a2b7c3bf',
  product: '81e0fdc3-525c-4e07-adff-47327baca957',
  searchVector: '809a78c5-3a28-481e-a9c8-fea97a026a68',
  focusNFe: 'd156564a-6e20-4c43-a61b-e2ee8ca4fcbc',
  discriminacao: '4ca3e13c-1522-4b06-949b-7a19597bebb4',
  timelineActivities: '3411cd87-c65d-4d2d-8636-c1910fd5a890',
  codAssinante: '9cfbbfe1-b6f3-4aa0-9001-b32424705cc4',
  numContratoAssinante: '2aecf923-83b1-46a0-be75-1a7b770c34ac',
  classificacao: '75a55f5b-5d12-4e93-af0c-625ecfd12ae2',
  unidade: '744d7802-7e21-4f65-b0c9-696e2204c4f2',
  justificativa: '8169d623-fa6a-4c54-9812-3ea56a69640b',
  dataEmissao: '50332075-7324-49ab-ae38-2d6c468f8580',
  numeroRps: '60027ee6-65d3-4ff7-8219-8e0ac367d55b',
  createdBy: '303c7ff1-3a10-4fe0-aeed-03575b4ad0fc',
};

export const CONNECTED_ACCOUNT_STANDARD_FIELD_IDS = {
  handle: '20202020-c804-4a50-bb05-b3a9e24f1dec',
  provider: '20202020-ebb0-4516-befc-a9e95935efd5',
  accessToken: '20202020-707b-4a0a-8753-2ad42efe1e29',
  refreshToken: '20202020-532d-48bd-80a5-c4be6e7f6e49',
  accountOwner: '20202020-3517-4896-afac-b1d0aa362af6',
  lastSyncHistoryId: '20202020-115c-4a87-b50f-ac4367a971b9',
  authFailedAt: '20202020-d268-4c6b-baff-400d402b430a',
  messageChannels: '20202020-24f7-4362-8468-042204d1e445',
  calendarChannels: '20202020-af4a-47bb-99ec-51911c1d3977',
  handleAliases: '20202020-8a3d-46be-814f-6228af16c47b',
  scopes: '20202020-8a3d-46be-814f-6228af16c47c',
};

export const EVENT_STANDARD_FIELD_IDS = {
  properties: '20202020-f142-4b04-b91b-6a2b4af3bf10',
  workspaceMember: '20202020-af23-4479-9a30-868edc474b35',
  person: '20202020-c414-45b9-a60a-ac27aa96229e',
  company: '20202020-04ad-4221-a744-7a8278a5ce20',
  opportunity: '20202020-7664-4a35-a3df-580d389fd5f0',
  custom: '20202020-4a71-41b0-9f83-9cdcca3f8b14',
};

export const AUDIT_LOGS_STANDARD_FIELD_IDS = {
  name: '20202020-2462-4b9d-b5d9-745febb3b095',
  properties: '20202020-5d36-470e-8fad-d56ea3ab2fd0',
  context: '20202020-b9d1-4058-9a75-7469cab5ca8c',
  objectName: '20202020-76ba-4c47-b7e5-96034005d00a',
  objectMetadataId: '20202020-127b-409d-9864-0ec44aa9ed98',
  recordId: '20202020-c578-4acf-bf94-eb53b035cea2',
  workspaceMember: '20202020-6e96-4300-b3f5-67a707147385',
};

export const BEHAVIORAL_EVENT_STANDARD_FIELD_IDS = {
  name: '20202020-2462-4b9d-b5d9-745febb3b095',
  properties: '20202020-5d36-470e-8fad-d56ea3ab2fd0',
  context: '20202020-bd62-4b5b-8385-6caeed8f8078',
  objectName: '20202020-a744-406c-a2e1-9d83d74f4341',
  recordId: '20202020-6d8b-4ca5-9869-f882cb335673',
};

export const TIMELINE_ACTIVITY_STANDARD_FIELD_IDS = {
  happensAt: '20202020-9526-4993-b339-c4318c4d39f0',
  type: '20202020-5e7b-4ccd-8b8a-86b94b474134',
  name: '20202020-7207-46e8-9dab-849505ae8497',
  properties: '20202020-f142-4b04-b91b-6a2b4af3bf11',
  workspaceMember: '20202020-af23-4479-9a30-868edc474b36',
  person: '20202020-c414-45b9-a60a-ac27aa96229f',
  company: '20202020-04ad-4221-a744-7a8278a5ce21',
  opportunity: '20202020-7664-4a35-a3df-580d389fd527',
  task: '20202020-b2f5-415c-9135-a31dfe49501b',
  note: '20202020-ec55-4135-8da5-3a20badc0156',
  workflow: '20202020-616c-4ad3-a2e9-c477c341e295',
  workflowVersion: '20202020-74f1-4711-a129-e14ca0ecd744',
  workflowRun: '20202020-96f0-401b-9186-a3a0759225ac',
  custom: '20202020-4a71-41b0-9f83-9cdcca3f8b14',
  linkedRecordCachedName: '20202020-cfdb-4bef-bbce-a29f41230934',
  linkedRecordId: '20202020-2e0e-48c0-b445-ee6c1e61687d',
  linkedObjectMetadataId: '20202020-c595-449d-9f89-562758c9ee69',
  charge: '20202020-e674-48e5-a542-72570eee7215',
  integration: '20000000-4b3a-4b3b-8b3b-7f8d6a1d7d5b',
  chatbot: '6f02d62b-3423-4e16-9312-830133ec9861',
  traceable: '20202020-1e7e-42bc-82fe-24fd43cfbb2a',
  support: '14bb59ff-1726-46fe-b8cd-bb16f7b23855',
  notaFiscal: '031ea6a7-4f37-4205-9808-45f3ee2cd6d6',
};

export const FAVORITE_STANDARD_FIELD_IDS = {
  position: '20202020-dd26-42c6-8c3c-2a7598c204f6',
  forWorkspaceMember: '20202020-ce63-49cb-9676-fdc0c45892cd',
  person: '20202020-c428-4f40-b6f3-86091511c41c',
  company: '20202020-cff5-4682-8bf9-069169e08279',
  opportunity: '20202020-dabc-48e1-8318-2781a2b32aa2',
  workflow: '20202020-b11b-4dc8-999a-6bd0a947b463',
  workflowVersion: '20202020-e1b8-4caf-b55a-3ab4d4cbcd21',
  workflowRun: '20202020-db5a-4fe4-9a13-9afa22b1e762',
  task: '20202020-1b1b-4b3b-8b1b-7f8d6a1d7d5c',
  note: '20202020-1f25-43fe-8b00-af212fdde824',
  view: '20202020-5a93-4fa9-acce-e73481a0bbdf',
  custom: '20202020-855a-4bc8-9861-79deef37011f',
  favoriteFolder: '20202020-f658-4d12-8b4d-248356aa4bd9',
  chatbot: '82cb4030-897c-45d5-9b0d-9cf2f72b8c92',
};

export const FAVORITE_FOLDER_STANDARD_FIELD_IDS = {
  position: '20202020-5278-4bde-8909-2cec74d43744',
  name: '20202020-82a3-4537-8ff0-dbce7eec35d6',
  favorites: '20202020-b5e3-4b42-8af2-03cd4fd2e4d2',
};

export const MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS = {
  messageChannel: '20202020-b658-408f-bd46-3bd2d15d7e52',
  message: '20202020-da5d-4ac5-8743-342ab0a0336b',
  messageExternalId: '20202020-37d6-438f-b6fd-6503596c8f34',
  messageThread: '20202020-fac8-42a8-94dd-44dbc920ae16',
  messageThreadExternalId: '20202020-35fb-421e-afa0-0b8e8f7f9018',
};

export const MESSAGE_CHANNEL_STANDARD_FIELD_IDS = {
  visibility: '20202020-6a6b-4532-9767-cbc61b469453',
  handle: '20202020-2c96-43c3-93e3-ed6b1acb69bc',
  connectedAccount: '20202020-49a2-44a4-b470-282c0440d15d',
  type: '20202020-ae95-42d9-a3f1-797a2ea22122',
  isContactAutoCreationEnabled: '20202020-fabd-4f14-b7c6-3310f6d132c6',
  contactAutoCreationPolicy: '20202020-fc0e-4ba6-b259-a66ca89cfa38',
  excludeNonProfessionalEmails: '20202020-1df5-445d-b4f3-2413ad178431',
  excludeGroupEmails: '20202020-45a0-4be4-9164-5820a6a109fb',
  messageChannelMessageAssociations: '20202020-49b8-4766-88fd-75f1e21b3d5f',
  messageFolders: '20202020-cc39-4432-9fe8-ec8ab8bbed94',
  isSyncEnabled: '20202020-d9a6-48e9-990b-b97fdf22e8dd',
  syncCursor: '20202020-79d1-41cf-b738-bcf5ed61e256',
  syncedAt: '20202020-263d-4c6b-ad51-137ada56f7d4',
  syncStatus: '20202020-56a1-4f7e-9880-a8493bb899cc',
  syncStage: '20202020-7979-4b08-89fe-99cb5e698767',
  syncStageStartedAt: '20202020-8c61-4a42-ae63-73c1c3c52e06',
  throttleFailureCount: '20202020-0291-42be-9ad0-d578a51684ab',
};

export const MESSAGE_FOLDER_STANDARD_FIELD_IDS = {
  name: '20202020-7cf8-40bc-a681-b80b771449b7',
  messageChannel: '20202020-b658-408f-bd46-3bd2d15d7e52',
  syncCursor: '20202020-98cd-49ed-8dfc-cb5796400e64',
};

export const MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS = {
  message: '20202020-985b-429a-9db9-9e55f4898a2a',
  role: '20202020-65d1-42f4-8729-c9ec1f52aecd',
  handle: '20202020-2456-464e-b422-b965a4db4a0b',
  displayName: '20202020-36dd-4a4f-ac02-228425be9fac',
  person: '20202020-249d-4e0f-82cd-1b9df5cd3da2',
  workspaceMember: '20202020-77a7-4845-99ed-1bcbb478be6f',
};

export const MESSAGE_THREAD_STANDARD_FIELD_IDS = {
  messages: '20202020-3115-404f-aade-e1154b28e35a',
  messageChannelMessageAssociations: '20202020-314e-40a4-906d-a5d5d6c285f6',
  messageThreadSubscribers: '20202020-3b3b-4b3b-8b3b-7f8d6a1d7d5b',
};

export const MESSAGE_THREAD_SUBSCRIBER_STANDARD_FIELD_IDS = {
  messageThread: '20202020-2c8f-4f3e-8b9a-7f8d6a1c7d5b',
  workspaceMember: '20202020-7f7b-4b3b-8b3b-7f8d6a1d7d5a',
};

export const MESSAGE_STANDARD_FIELD_IDS = {
  headerMessageId: '20202020-72b5-416d-aed8-b55609067d01',
  messageThread: '20202020-30f2-4ccd-9f5c-e41bb9d26214',
  direction: '20202020-0203-4118-8e2a-05b9bdae6dab',
  subject: '20202020-52d1-4036-b9ae-84bd722bb37a',
  text: '20202020-d2ee-4e7e-89de-9a0a9044a143',
  receivedAt: '20202020-140a-4a2a-9f86-f13b6a979afc',
  messageParticipants: '20202020-7cff-4a74-b63c-73228448cbd9',
  messageChannelMessageAssociations: '20202020-3cef-43a3-82c6-50e7cfbc9ae4',
};

export const NOTE_STANDARD_FIELD_IDS = {
  position: '20202020-368d-4dc2-943f-ed8a49c7fdfb',
  title: '20202020-faeb-4c76-8ba6-ccbb0b4a965f',
  body: '20202020-e63d-4e70-95be-a78cd9abe7ef',
  bodyV2: '20202020-a7bb-4d94-be51-8f25181502c8',
  createdBy: '20202020-0d79-4e21-ab77-5a394eff97be',
  noteTargets: '20202020-1f25-43fe-8b00-af212fdde823',
  attachments: '20202020-4986-4c92-bf19-39934b149b16',
  timelineActivities: '20202020-7030-42f8-929c-1a57b25d6bce',
  favorites: '20202020-4d1d-41ac-b13b-621631298d67',
  searchVector: '20202020-7ea8-44d4-9d4c-51dd2a757950',
};

export const NOTE_TARGET_STANDARD_FIELD_IDS = {
  note: '20202020-57f3-4f50-9599-fc0f671df003',
  person: '20202020-38ca-4aab-92f5-8a605ca2e4c5',
  company: 'c500fbc0-d6f2-4982-a959-5a755431696c',
  opportunity: '20202020-4e42-417a-a705-76581c9ade79',
  support: 'ddb83ecc-e243-4842-8190-ba15dceddcd6',
  custom: '20202020-3d12-4579-94ee-7117c1bad492',
};

export const OPPORTUNITY_STANDARD_FIELD_IDS = {
  name: '20202020-8609-4f65-a2d9-44009eb422b5',
  amount: '20202020-583e-4642-8533-db761d5fa82f',
  closeDate: '20202020-527e-44d6-b1ac-c4158d307b97',
  probabilityDeprecated: '20202020-69d4-45f3-9703-690b09fafcf0',
  stage: '20202020-6f76-477d-8551-28cd65b2b4b9',
  position: '20202020-806d-493a-bbc6-6313e62958e2',
  createdBy: '20202020-a63e-4a62-8e63-42a51828f831',
  pointOfContact: '20202020-8dfb-42fc-92b6-01afb759ed16',
  company: '20202020-cbac-457e-b565-adece5fc815f',
  favorites: '20202020-a1c2-4500-aaae-83ba8a0e827a',
  // TODO: check if activityTargets field can be deleted
  activityTargets: '20202020-220a-42d6-8261-b2102d6eab35',
  taskTargets: '20202020-59c0-4179-a208-4a255f04a5be',
  noteTargets: '20202020-dd3f-42d5-a382-db58aabf43d3',
  attachments: '20202020-87c7-4118-83d6-2f4031005209',
  timelineActivities: '20202020-30e2-421f-96c7-19c69d1cf631',
  searchVector: '428a0da5-4b2e-4ce3-b695-89a8b384e6e3',
};

export const PERSON_STANDARD_FIELD_IDS = {
  name: '20202020-3875-44d5-8c33-a6239011cab8',
  email: '20202020-a740-42bb-8849-8980fb3f12e1',
  emails: '20202020-3c51-43fa-8b6e-af39e29368ab',
  linkedinLink: '20202020-f1af-48f7-893b-2007a73dd508',
  xLink: '20202020-8fc2-487c-b84a-55a99b145cfd',
  jobTitle: '20202020-b0d0-415a-bef9-640a26dacd9b',
  phone: '20202020-4564-4b8b-a09f-05445f2e0bce',
  phones: '20202020-0638-448e-8825-439134618022',
  city: '20202020-5243-4ffb-afc5-2c675da41346',
  avatarUrl: '20202020-b8a6-40df-961c-373dc5d2ec21',
  position: '20202020-fcd5-4231-aff5-fff583eaa0b1',
  createdBy: '20202020-f6ab-4d98-af24-a3d5b664148a',
  company: '20202020-e2f3-448e-b34c-2d625f0025fd',
  pointOfContactForOpportunities: '20202020-911b-4a7d-b67b-918aa9a5b33a',
  // TODO: check if activityTargets field can be deleted
  activityTargets: '20202020-dee7-4b7f-b50a-1f50bd3be452',
  taskTargets: '20202020-584b-4d3e-88b6-53ab1fa03c3a',
  noteTargets: '20202020-c8fc-4258-8250-15905d3fcfec',
  favorites: '20202020-4073-4117-9cf1-203bcdc91cbd',
  attachments: '20202020-cd97-451f-87fa-bcb789bdbf3a',
  messageParticipants: '20202020-498e-4c61-8158-fa04f0638334',
  calendarEventParticipants: '20202020-52ee-45e9-a702-b64b3753e3a9',
  timelineActivities: '20202020-a43e-4873-9c23-e522de906ce5',
  searchVector: '57d1d7ad-fa10-44fc-82f3-ad0959ec2534',
  charge: '20202020-e674-48e5-a542-72570eec4216',
  support: '5f6feac9-d0f3-4c7e-8923-9989d199e998',
};

export const TASK_STANDARD_FIELD_IDS = {
  position: '20202020-7d47-4690-8a98-98b9a0c05dd8',
  title: '20202020-b386-4cb7-aa5a-08d4a4d92680',
  body: '20202020-ce13-43f4-8821-69388fe1fd26',
  bodyV2: '20202020-4aa0-4ae8-898d-7df0afd47ab1',
  dueAt: '20202020-fd99-40da-951b-4cb9a352fce3',
  status: '20202020-70bc-48f9-89c5-6aa730b151e0',
  createdBy: '20202020-1a04-48ab-a567-576965ae5387',
  taskTargets: '20202020-de9c-4d0e-a452-713d4a3e5fc7',
  attachments: '20202020-794d-4783-a8ff-cecdb15be139',
  assignee: '20202020-065a-4f42-a906-e20422c1753f',
  timelineActivities: '20202020-c778-4278-99ee-23a2837aee64',
  favorites: '20202020-4d1d-41ac-b13b-621631298d65',
  searchVector: '20202020-4746-4e2f-870c-52b02c67c90d',
};

export const TASK_TARGET_STANDARD_FIELD_IDS = {
  task: '20202020-e881-457a-8758-74aaef4ae78a',
  person: '20202020-c8a0-4e85-a016-87e2349cfbec',
  company: '20202020-4703-4a4e-948c-487b0c60a92c',
  opportunity: '20202020-6cb2-4c01-a9a5-aca3dbc11d41',
  custom: '20202020-41c1-4c9a-8c75-be0971ef89af',
};

export const VIEW_FIELD_STANDARD_FIELD_IDS = {
  fieldMetadataId: '20202020-135f-4c5b-b361-15f24870473c',
  isVisible: '20202020-e966-473c-9c18-f00d3347e0ba',
  size: '20202020-6fab-4bd0-ae72-20f3ee39d581',
  position: '20202020-19e5-4e4c-8c15-3a96d1fd0650',
  view: '20202020-e8da-4521-afab-d6d231f9fa18',
  aggregateOperation: '20202020-2cd7-4f94-ae83-4a14f5731a04',
};

export const VIEW_GROUP_STANDARD_FIELD_IDS = {
  fieldMetadataId: '20202020-8f26-46ae-afed-fdacd7778682',
  fieldValue: '20202020-175e-4596-b7a4-1cd9d14e5a30',
  isVisible: '20202020-0fed-4b44-88fd-a064c4fcfce4',
  position: '20202020-748e-4645-8f32-84aae7726c04',
  view: '20202020-5bc7-4110-b23f-fb851fb133b4',
};

export const VIEW_FILTER_STANDARD_FIELD_IDS = {
  fieldMetadataId: '20202020-c9aa-4c94-8d0e-9592f5008fb0',
  operand: '20202020-bd23-48c4-9fab-29d1ffb80310',
  value: '20202020-1e55-4a1e-a1d2-fefb86a5fce5',
  displayValue: '20202020-1270-4ebf-9018-c0ec10d5038e',
  view: '20202020-4f5b-487e-829c-3d881c163611',
  viewFilterGroupId: '20202020-2580-420a-8328-cab1635c0296',
  positionInViewFilterGroup: '20202020-3bb0-4f66-a537-a46fe0dc468f',
  subFieldName: '20202020-3bb0-4f66-a537-a46fe0dc469a',
};

export const VIEW_FILTER_GROUP_STANDARD_FIELD_IDS = {
  view: '20202020-ff7a-4b54-8be5-aa0249047b74',
  parentViewFilterGroupId: '20202020-edbf-4929-8ede-64f48d6bf2a7',
  logicalOperator: '20202020-64d9-4bc5-85ba-c250796ce9aa',
  positionInViewFilterGroup: '20202020-90d6-4299-ad87-d05ddd3a0a3f',
};

export const VIEW_SORT_STANDARD_FIELD_IDS = {
  fieldMetadataId: '20202020-8240-4657-aee4-7f0df8e94eca',
  direction: '20202020-b06e-4eb3-9b58-0a62e5d79836',
  view: '20202020-bd6c-422b-9167-5c105f2d02c8',
};

export const VIEW_STANDARD_FIELD_IDS = {
  name: '20202020-12c6-4f37-b588-c9b9bf57328d',
  objectMetadataId: '20202020-d6de-4fd5-84dd-47f9e730368b',
  type: '20202020-dd11-4607-9ec7-c57217262a7f',
  key: '20202020-298e-49fa-9f4a-7b416b110443',
  icon: '20202020-1f08-4fd9-929b-cbc07f317166',
  kanbanFieldMetadataId: '20202020-d09b-4f65-ac42-06a2f20ba0e8',
  kanbanAggregateOperation: '20202020-8da2-45de-a731-61bed84b17a8',
  kanbanAggregateOperationFieldMetadataId:
    '20202020-b1b3-4bf3-85e4-dc7d58aa9b02',
  position: '20202020-e9db-4303-b271-e8250c450172',
  isCompact: '20202020-674e-4314-994d-05754ea7b22b',
  openRecordIn: '20202020-086d-4eef-9f03-56c6392eacb8',
  viewFields: '20202020-542b-4bdc-b177-b63175d48edf',
  viewGroups: '20202020-e1a1-419f-ac81-1986a5ea59a8',
  viewFilters: '20202020-ff23-4154-b63c-21fb36cd0967',
  viewFilterGroups: '20202020-0318-474a-84a1-bac895ceaa5a',
  viewSorts: '20202020-891b-45c3-9fe1-80a75b4aa043',
  favorites: '20202020-c818-4a86-8284-9ec0ef0a59a5',
};

export const WEBHOOK_STANDARD_FIELD_IDS = {
  targetUrl: '20202020-1229-45a8-8cf4-85c9172aae12',
  operation: '20202020-15b7-458e-bf30-74770a54410c',
  operations: '20202020-15b7-458e-bf30-74770a54411c',
  description: '20202020-15b7-458e-bf30-74770a54410d',
  secret: '20202020-97ce-410f-bff9-e9ccb038fb67',
};

export const WORKFLOW_AUTOMATED_TRIGGER_STANDARD_FIELD_IDS = {
  type: '20202020-3319-4234-a34c-3f92c1ab56e7',
  settings: '20202020-3319-4234-a34c-bac8f903de12',
  workflow: '20202020-3319-4234-a34c-8e1a4d2f7c03',
};

export const WORKFLOW_STANDARD_FIELD_IDS = {
  name: '20202020-b3d3-478f-acc0-5d901e725b20',
  lastPublishedVersionId: '20202020-326a-4fba-8639-3456c0a169e8',
  statuses: '20202020-357c-4432-8c50-8c31b4a552d9',
  position: '20202020-39b0-4d8c-8c5f-33c2326deb5f',
  versions: '20202020-9432-416e-8f3c-27ee3153d099',
  runs: '20202020-759b-4340-b58b-e73595c4df4f',
  eventListeners: '20202020-0229-4c66-832e-035c67579a38',
  automatedTriggers: '20202020-3319-4234-a34c-117ecad2b8a9',
  favorites: '20202020-c554-4c41-be7a-cf9cd4b0d512',
  timelineActivities: '20202020-906e-486a-a798-131a5f081faf',
  createdBy: '20202020-6007-401a-8aa5-e6f48581a6f3',
};

export const WORKFLOW_RUN_STANDARD_FIELD_IDS = {
  name: '20202020-b840-4253-aef9-4e5013694587',
  workflowVersion: '20202020-2f52-4ba8-8dc4-d0d6adb9578d',
  workflow: '20202020-8c57-4e7f-84f5-f373f68e1b82',
  startedAt: '20202020-a234-4e2d-bd15-85bcea6bb183',
  endedAt: '20202020-e1c1-4b6b-bbbd-b2beaf2e159e',
  status: '20202020-6b3e-4f9c-8c2b-2e5b8e6d6f3b',
  position: '20202020-7802-4c40-ae89-1f506fe3365c',
  createdBy: '20202020-6007-401a-8aa5-e6f38581a6f3',
  output: '20202020-7be4-4db2-8ac6-3ff0d740843d',
  context: '20202020-189c-478a-b867-d72feaf5926a',
  favorites: '20202020-4baf-4604-b899-2f7fcfbbf90d',
  timelineActivities: '20202020-af4d-4eb0-babc-eb960a45b356',
};

export const WORKFLOW_VERSION_STANDARD_FIELD_IDS = {
  name: '20202020-a12f-4cca-9937-a2e40cc65509',
  workflow: '20202020-afa3-46c3-91b0-0631ca6aa1c8',
  trigger: '20202020-4eae-43e7-86e0-212b41a30b48',
  status: '20202020-5a34-440e-8a25-39d8c3d1d4cf',
  position: '20202020-791d-4950-ab28-0e704767ae1c',
  runs: '20202020-1d08-46df-901a-85045f18099a',
  steps: '20202020-5988-4a64-b94a-1f9b7b989039',
  favorites: '20202020-b8e0-4e57-928d-b51671cc71f2',
  timelineActivities: '20202020-fcb0-4695-b17e-3b43a421c633',
};

export const CHATBOT_STANDARD_FIELD_IDS = {
  name: '92a00578-f689-43c6-9d79-5171e9d9ab74',
  statuses: '63b3a1b4-f5eb-45e1-92b4-2453ec7f1c2f',
  position: '41f9c916-7914-44a9-9302-2ee9897d6db7',
  favorites: '045ca203-42d5-4cd9-a320-624e0c76ba25',
  timelineActivities: '337a9630-a180-4758-b234-e021241c69c5',
  createdBy: '134d6f12-3c6b-47e5-afb0-337b19d98148',
  whatsappIntegration: 'dcf3921a-d486-4f76-af86-dee90948a9ea',
  searchVector: '5e759ff3-dbb9-4616-b392-ccd3d52b3a4b',
};

export const WHATSAPP_STANDARD_FIELD_IDS = {
  name: 'f34bf730-b3e2-4513-a8dc-a85f8817105a',
  phoneId: '29965765-b8d4-48d4-80f1-31008a42b02e',
  businessAccountId: 'b94489e4-c4be-4f99-85e6-c15168364428',
  appId: 'e5719886-ddf0-453e-8c0b-14e16cc81547',
  appKey: 'b70b9165-779d-49a8-93af-8d7ab787e657',
  accessToken: '23d0e5e9-d402-44ce-bf62-5091494ee6d1',
  verifyToken: '9a0ea7b1-1e43-477f-881c-66e9771ad233',
  sla: 'd1c22e84-8eea-4be1-906b-7e84eab40200',
  chatbot: '28d5f4a0-9afc-4014-8556-2e872f14ed2c',
  disabled: '20565891-e0ff-4642-89d8-4bfbdd4674d0',
  searchVector: '3d8534c9-1f0d-4c3c-b2a4-99c0558b28dc',
};

export const WORKSPACE_MEMBER_STANDARD_FIELD_IDS = {
  position: '20202020-1810-4591-a93c-d0df97dca843',
  name: '20202020-e914-43a6-9c26-3603c59065f4',
  colorScheme: '20202020-66bc-47f2-adac-f2ef7c598b63',
  locale: '20202020-402e-4695-b169-794fa015afbe',
  avatarUrl: '20202020-0ced-4c4f-a376-c98a966af3f6',
  userEmail: '20202020-4c5f-4e09-bebc-9e624e21ecf4',
  userId: '20202020-75a9-4dfc-bf25-2e4b43e89820',
  authoredActivities: '20202020-f139-4f13-a82f-a65a8d290a74',
  assignedActivities: '20202020-5c97-42b6-8ca9-c07622cbb33f',
  assignedTasks: '20202020-61dc-4a1c-99e8-38ebf8d2bbeb',
  favorites: '20202020-f3c1-4faf-b343-cf7681038757',
  accountOwnerForCompanies: '20202020-dc29-4bd4-a3c1-29eafa324bee',
  authoredAttachments: '20202020-000f-4947-917f-1b09851024fe',
  authoredComments: '20202020-5536-4f59-b837-51c45ef43b05',
  connectedAccounts: '20202020-e322-4bde-a525-727079b4a100',
  messageParticipants: '20202020-8f99-48bc-a5eb-edd33dd54188',
  blocklist: '20202020-6cb2-4161-9f29-a4b7f1283859',
  calendarEventParticipants: '20202020-0dbc-4841-9ce1-3e793b5b3512',
  timelineActivities: '20202020-e15b-47b8-94fe-8200e3c66615',
  auditLogs: '20202020-2f54-4739-a5e2-99563385e83d',
  messageThreadSubscribers: '20202020-4b3b-4b3b-9b3b-3b3b3b3b3b3b',
  timeZone: '20202020-2d33-4c21-a86e-5943b050dd54',
  dateFormat: '20202020-af13-4e11-b1e7-b8cf5ea13dc0',
  timeFormat: '20202020-8acb-4cf8-a851-a6ed443c8d81',
  searchVector: '20202020-46d0-4e7f-bc26-74c0edaeb619',
  agentId: 'e2dcedef-a3ba-4273-a0d4-b3277f281f78',
  userDocument: '20202020-a1b2-4c3d-9e8f-123456789abc',
  userPhone: '20202020-b2a1-3d4c-8f9e-987654321cba',
  extensionNumber: '0271a0fa-20de-45e1-9908-b198bd1e7b99',
};

export const CUSTOM_OBJECT_STANDARD_FIELD_IDS = {
  name: '20202020-ba07-4ffd-ba63-009491f5749c',
  position: '20202020-c2bd-4e16-bb9a-c8b0411bf49d',
  createdBy: '20202020-be0e-4971-865b-32ca87cbb315',
  // TODO: check if activityTargets field can be deleted
  activityTargets: '20202020-7f42-40ae-b96c-c8a61acc83bf',
  noteTargets: '20202020-01fd-4f37-99dc-9427a444018a',
  taskTargets: '20202020-0860-4566-b865-bff3c626c303',
  favorites: '20202020-a4a7-4686-b296-1c6c3482ee21',
  attachments: '20202020-8d59-46ca-b7b2-73d167712134',
  timelineActivities: '20202020-f1ef-4ba4-8f33-1a4577afa477',
  searchVector: '70e56537-18ef-4811-b1c7-0a444006b815',
};

export const STANDARD_OBJECT_FIELD_IDS = {
  activityTarget: ACTIVITY_TARGET_STANDARD_FIELD_IDS,
  activity: ACTIVITY_STANDARD_FIELD_IDS,
  apiKey: API_KEY_STANDARD_FIELD_IDS,
  attachment: ATTACHMENT_STANDARD_FIELD_IDS,
  blocklist: BLOCKLIST_STANDARD_FIELD_IDS,
  behavioralEvent: BEHAVIORAL_EVENT_STANDARD_FIELD_IDS,
  calendarChannelEventAssociation:
    CALENDAR_CHANNEL_EVENT_ASSOCIATION_STANDARD_FIELD_IDS,
  calendarChannel: CALENDAR_CHANNEL_STANDARD_FIELD_IDS,
  calendarEventParticipant: CALENDAR_EVENT_PARTICIPANT_STANDARD_FIELD_IDS,
  calendarEvent: CALENDAR_EVENT_STANDARD_FIELD_IDS,
  comment: COMMENT_STANDARD_FIELD_IDS,
  company: COMPANY_STANDARD_FIELD_IDS,
  connectedAccount: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS,
  favorite: FAVORITE_STANDARD_FIELD_IDS,
  auditLog: AUDIT_LOGS_STANDARD_FIELD_IDS,
  messageChannelMessageAssociation:
    MESSAGE_CHANNEL_MESSAGE_ASSOCIATION_STANDARD_FIELD_IDS,
  messageChannel: MESSAGE_CHANNEL_STANDARD_FIELD_IDS,
  messageParticipant: MESSAGE_PARTICIPANT_STANDARD_FIELD_IDS,
  messageThread: MESSAGE_THREAD_STANDARD_FIELD_IDS,
  messageThreadSubscriber: MESSAGE_THREAD_SUBSCRIBER_STANDARD_FIELD_IDS,
  message: MESSAGE_STANDARD_FIELD_IDS,
  note: NOTE_STANDARD_FIELD_IDS,
  noteTarget: NOTE_TARGET_STANDARD_FIELD_IDS,
  opportunity: OPPORTUNITY_STANDARD_FIELD_IDS,
  person: PERSON_STANDARD_FIELD_IDS,
  task: TASK_STANDARD_FIELD_IDS,
  taskTarget: TASK_TARGET_STANDARD_FIELD_IDS,
  timelineActivity: TIMELINE_ACTIVITY_STANDARD_FIELD_IDS,
  viewField: VIEW_FIELD_STANDARD_FIELD_IDS,
  viewGroup: VIEW_GROUP_STANDARD_FIELD_IDS,
  viewFilter: VIEW_FILTER_STANDARD_FIELD_IDS,
  viewSort: VIEW_SORT_STANDARD_FIELD_IDS,
  view: VIEW_STANDARD_FIELD_IDS,
  webhook: WEBHOOK_STANDARD_FIELD_IDS,
  workflow: WORKFLOW_STANDARD_FIELD_IDS,
  workflowRun: WORKFLOW_RUN_STANDARD_FIELD_IDS,
  workflowVersion: WORKFLOW_VERSION_STANDARD_FIELD_IDS,
  workspaceMember: WORKSPACE_MEMBER_STANDARD_FIELD_IDS,
  chatbot: CHATBOT_STANDARD_FIELD_IDS,
};
