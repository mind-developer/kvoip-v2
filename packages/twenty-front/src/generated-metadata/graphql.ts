/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** Cursor for paging through collections */
  ConnectionCursor: { input: any; output: any; }
  /** Date custom scalar type */
  Date: { input: any; output: any; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: { input: any; output: any; }
  /** The `RawJSONScalar` scalar type represents JSON values, but stringifies inputs and parses outputs. */
  RawJSONScalar: { input: any; output: any; }
  /** A UUID scalar type */
  UUID: { input: any; output: any; }
  /** The `Upload` scalar type represents a file upload. */
  Upload: { input: any; output: any; }
};

export type ActivateWorkspaceInput = {
  displayName?: InputMaybe<Scalars['String']['input']>;
};

export type AdminPanelHealthServiceData = {
  __typename?: 'AdminPanelHealthServiceData';
  description: Scalars['String']['output'];
  details?: Maybe<Scalars['String']['output']>;
  errorMessage?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  label: Scalars['String']['output'];
  queues?: Maybe<Array<AdminPanelWorkerQueueHealth>>;
  status: AdminPanelHealthServiceStatus;
};

export enum AdminPanelHealthServiceStatus {
  OPERATIONAL = 'OPERATIONAL',
  OUTAGE = 'OUTAGE'
}

export type AdminPanelWorkerQueueHealth = {
  __typename?: 'AdminPanelWorkerQueueHealth';
  id: Scalars['String']['output'];
  queueName: Scalars['String']['output'];
  status: AdminPanelHealthServiceStatus;
};

export type Agent = {
  __typename?: 'Agent';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  modelId: Scalars['String']['output'];
  name: Scalars['String']['output'];
  prompt: Scalars['String']['output'];
  responseFormat?: Maybe<Scalars['JSON']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type AgentIdInput = {
  /** The id of the agent. */
  id: Scalars['UUID']['input'];
};

export type Analytics = {
  __typename?: 'Analytics';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean']['output'];
};

export enum AnalyticsType {
  PAGEVIEW = 'PAGEVIEW',
  TRACK = 'TRACK'
}

export type ApiConfig = {
  __typename?: 'ApiConfig';
  mutationMaximumAffectedRecords: Scalars['Float']['output'];
};

export type ApiKeyToken = {
  __typename?: 'ApiKeyToken';
  token: Scalars['String']['output'];
};

export type AppToken = {
  __typename?: 'AppToken';
  createdAt: Scalars['DateTime']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AppTokenEdge = {
  __typename?: 'AppTokenEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the AppToken */
  node: AppToken;
};

export type ApprovedAccessDomain = {
  __typename?: 'ApprovedAccessDomain';
  createdAt: Scalars['DateTime']['output'];
  domain: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isValidated: Scalars['Boolean']['output'];
};

export type AuthProviders = {
  __typename?: 'AuthProviders';
  google: Scalars['Boolean']['output'];
  magicLink: Scalars['Boolean']['output'];
  microsoft: Scalars['Boolean']['output'];
  password: Scalars['Boolean']['output'];
  sso: Array<SsoIdentityProvider>;
};

export type AuthToken = {
  __typename?: 'AuthToken';
  expiresAt: Scalars['DateTime']['output'];
  token: Scalars['String']['output'];
};

export type AuthTokenPair = {
  __typename?: 'AuthTokenPair';
  accessToken: AuthToken;
  refreshToken: AuthToken;
};

export type AuthTokens = {
  __typename?: 'AuthTokens';
  tokens: AuthTokenPair;
};

export type AuthorizeApp = {
  __typename?: 'AuthorizeApp';
  redirectUrl: Scalars['String']['output'];
};

export type AvailableWorkspace = {
  __typename?: 'AvailableWorkspace';
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  inviteHash?: Maybe<Scalars['String']['output']>;
  loginToken?: Maybe<Scalars['String']['output']>;
  logo?: Maybe<Scalars['String']['output']>;
  personalInviteToken?: Maybe<Scalars['String']['output']>;
  sso: Array<SsoConnection>;
  workspaceUrls: WorkspaceUrls;
};

export type AvailableWorkspaces = {
  __typename?: 'AvailableWorkspaces';
  availableWorkspacesForSignIn: Array<AvailableWorkspace>;
  availableWorkspacesForSignUp: Array<AvailableWorkspace>;
};

export type AvailableWorkspacesAndAccessTokensOutput = {
  __typename?: 'AvailableWorkspacesAndAccessTokensOutput';
  availableWorkspaces: AvailableWorkspaces;
  tokens: AuthTokenPair;
};

export type Billing = {
  __typename?: 'Billing';
  billingUrl?: Maybe<Scalars['String']['output']>;
  isBillingEnabled: Scalars['Boolean']['output'];
  isBillingSwitchPlanIntervalEnabled: Scalars['Boolean']['output'];
  trialPeriods: Array<BillingTrialPeriodDto>;
};

export type BillingEndTrialPeriodOutput = {
  __typename?: 'BillingEndTrialPeriodOutput';
  /** Boolean that confirms if a payment method was found */
  hasPaymentMethod: Scalars['Boolean']['output'];
  /** Updated subscription status */
  status?: Maybe<SubscriptionStatus>;
};

export type BillingMeteredProductUsageOutput = {
  __typename?: 'BillingMeteredProductUsageOutput';
  freeTierQuantity: Scalars['Float']['output'];
  freeTrialQuantity: Scalars['Float']['output'];
  periodEnd: Scalars['DateTime']['output'];
  periodStart: Scalars['DateTime']['output'];
  productKey: BillingProductKey;
  totalCostCents: Scalars['Float']['output'];
  unitPriceCents: Scalars['Float']['output'];
  usageQuantity: Scalars['Float']['output'];
};

/** The different billing payment providers available */
export enum BillingPaymentProviders {
  Inter = 'Inter',
  Stripe = 'Stripe'
}

/** The different billing plans available */
export enum BillingPlanKey {
  ENTERPRISE = 'ENTERPRISE',
  PRO = 'PRO'
}

export type BillingPlanOutput = {
  __typename?: 'BillingPlanOutput';
  baseProduct: BillingProduct;
  meteredProducts: Array<BillingProduct>;
  otherLicensedProducts: Array<BillingProduct>;
  planKey: BillingPlanKey;
};

export type BillingPlans = {
  __typename?: 'BillingPlans';
  id: Scalars['UUID']['output'];
  planId: Scalars['String']['output'];
  planPrice: Scalars['Float']['output'];
  workspace: Workspace;
};

export type BillingPriceLicensedDto = {
  __typename?: 'BillingPriceLicensedDTO';
  priceUsageType: BillingUsageType;
  recurringInterval: SubscriptionInterval;
  stripePriceId: Scalars['String']['output'];
  unitAmount: Scalars['Float']['output'];
};

export type BillingPriceMeteredDto = {
  __typename?: 'BillingPriceMeteredDTO';
  priceUsageType: BillingUsageType;
  recurringInterval: SubscriptionInterval;
  stripePriceId: Scalars['String']['output'];
  tiers?: Maybe<Array<BillingPriceTierDto>>;
  tiersMode?: Maybe<BillingPriceTiersMode>;
};

export type BillingPriceTierDto = {
  __typename?: 'BillingPriceTierDTO';
  flatAmount?: Maybe<Scalars['Float']['output']>;
  unitAmount?: Maybe<Scalars['Float']['output']>;
  upTo?: Maybe<Scalars['Float']['output']>;
};

/** The different billing price tiers modes */
export enum BillingPriceTiersMode {
  GRADUATED = 'GRADUATED',
  VOLUME = 'VOLUME'
}

export type BillingPriceUnionDto = BillingPriceLicensedDto | BillingPriceMeteredDto;

export type BillingProduct = {
  __typename?: 'BillingProduct';
  description: Scalars['String']['output'];
  images?: Maybe<Array<Scalars['String']['output']>>;
  marketingFeatures?: Maybe<Array<Scalars['String']['output']>>;
  metadata: BillingProductMetadata;
  name: Scalars['String']['output'];
  prices?: Maybe<Array<BillingPriceUnionDto>>;
};

/** The different billing products available */
export enum BillingProductKey {
  BASE_PRODUCT = 'BASE_PRODUCT',
  WORKFLOW_NODE_EXECUTION = 'WORKFLOW_NODE_EXECUTION'
}

export type BillingProductMetadata = {
  __typename?: 'BillingProductMetadata';
  planKey: BillingPlanKey;
  priceUsageBased: BillingUsageType;
  productKey: BillingProductKey;
};

export type BillingSessionOutput = {
  __typename?: 'BillingSessionOutput';
  url?: Maybe<Scalars['String']['output']>;
};

export type BillingSubscription = {
  __typename?: 'BillingSubscription';
  billingSubscriptionItems?: Maybe<Array<BillingSubscriptionItem>>;
  chargeType?: Maybe<ChargeType>;
  currentChargeFileLink?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  interval?: Maybe<SubscriptionInterval>;
  metadata: Scalars['JSON']['output'];
  provider: BillingPaymentProviders;
  status: SubscriptionStatus;
};

export type BillingSubscriptionItem = {
  __typename?: 'BillingSubscriptionItem';
  billingProduct?: Maybe<BillingProduct>;
  hasReachedCurrentPeriodCap: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  quantity?: Maybe<Scalars['Float']['output']>;
};

export type BillingSwitchPlanOutput = {
  __typename?: 'BillingSwitchPlanOutput';
  baseProduct: BillingProduct;
  planKey: BillingPlanKey;
  subscription: BillingSubscription;
};

export type BillingTrialPeriodDto = {
  __typename?: 'BillingTrialPeriodDTO';
  duration: Scalars['Float']['output'];
  isCreditCardRequired: Scalars['Boolean']['output'];
};

export type BillingUpdateOneTimePaidSubscriptionOutput = {
  __typename?: 'BillingUpdateOneTimePaidSubscriptionOutput';
  /** The link for the bankslip file */
  bankSlipFileLink: Scalars['String']['output'];
};

export type BillingUpdateOutput = {
  __typename?: 'BillingUpdateOutput';
  /** Boolean that confirms query was successful */
  success: Scalars['Boolean']['output'];
};

export enum BillingUsageType {
  LICENSED = 'LICENSED',
  METERED = 'METERED'
}

export type BooleanFieldComparison = {
  is?: InputMaybe<Scalars['Boolean']['input']>;
  isNot?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum CalendarChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING'
}

export type Campaign = {
  __typename?: 'Campaign';
  campanha_id?: Maybe<Scalars['ID']['output']>;
  cliente_id?: Maybe<Scalars['String']['output']>;
  nome?: Maybe<Scalars['String']['output']>;
};

export type Captcha = {
  __typename?: 'Captcha';
  provider?: Maybe<CaptchaDriverType>;
  siteKey?: Maybe<Scalars['String']['output']>;
};

export enum CaptchaDriverType {
  GOOGLE_RECAPTCHA = 'GOOGLE_RECAPTCHA',
  TURNSTILE = 'TURNSTILE'
}

/** The type diffent type of charge for the subscription */
export enum ChargeType {
  ONE_TIME = 'ONE_TIME',
  PER_SEAT = 'PER_SEAT',
  PRE_PAID = 'PRE_PAID'
}

export type ChatbotFlow = {
  __typename?: 'ChatbotFlow';
  chatbotId: Scalars['String']['output'];
  edges?: Maybe<Array<Scalars['JSON']['output']>>;
  id: Scalars['UUID']['output'];
  nodes?: Maybe<Array<Scalars['JSON']['output']>>;
  viewport?: Maybe<Scalars['JSON']['output']>;
  workspace: Workspace;
};

export type ChatbotFlowInput = {
  chatbotId: Scalars['String']['input'];
  edges: Scalars['JSON']['input'];
  nodes: Scalars['JSON']['input'];
};

/** Chatbot status options */
export enum ChatbotStatus {
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
  DRAFT = 'DRAFT'
}

export type ChatbotWorkspaceEntity = {
  __typename?: 'ChatbotWorkspaceEntity';
  id: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  statuses?: Maybe<ChatbotStatus>;
};

export type CheckUserExistOutput = {
  __typename?: 'CheckUserExistOutput';
  availableWorkspacesCount: Scalars['Float']['output'];
  exists: Scalars['Boolean']['output'];
  isEmailVerified: Scalars['Boolean']['output'];
};

export type ClientAiModelConfig = {
  __typename?: 'ClientAIModelConfig';
  inputCostPer1kTokensInCredits: Scalars['Float']['output'];
  label: Scalars['String']['output'];
  modelId: Scalars['String']['output'];
  outputCostPer1kTokensInCredits: Scalars['Float']['output'];
  provider: ModelProvider;
};

export type Component = {
  __typename?: 'Component';
  format?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type ComputeStepOutputSchemaInput = {
  /** Step JSON format */
  step: Scalars['JSON']['input'];
};

export enum ConfigSource {
  DATABASE = 'DATABASE',
  DEFAULT = 'DEFAULT',
  ENVIRONMENT = 'ENVIRONMENT'
}

export type ConfigVariable = {
  __typename?: 'ConfigVariable';
  description: Scalars['String']['output'];
  isEnvOnly: Scalars['Boolean']['output'];
  isSensitive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  options?: Maybe<Scalars['JSON']['output']>;
  source: ConfigSource;
  type: ConfigVariableType;
  value?: Maybe<Scalars['JSON']['output']>;
};

export enum ConfigVariableType {
  ARRAY = 'ARRAY',
  BOOLEAN = 'BOOLEAN',
  ENUM = 'ENUM',
  NUMBER = 'NUMBER',
  STRING = 'STRING'
}

export enum ConfigVariablesGroup {
  AnalyticsConfig = 'AnalyticsConfig',
  BillingConfig = 'BillingConfig',
  CaptchaConfig = 'CaptchaConfig',
  CloudflareConfig = 'CloudflareConfig',
  EmailSettings = 'EmailSettings',
  ExceptionHandler = 'ExceptionHandler',
  GoogleAuth = 'GoogleAuth',
  LLM = 'LLM',
  Logging = 'Logging',
  Metering = 'Metering',
  MicrosoftAuth = 'MicrosoftAuth',
  Other = 'Other',
  RateLimiting = 'RateLimiting',
  SSL = 'SSL',
  ServerConfig = 'ServerConfig',
  ServerlessConfig = 'ServerlessConfig',
  StorageConfig = 'StorageConfig',
  SupportChatConfig = 'SupportChatConfig',
  TokensDuration = 'TokensDuration'
}

export type ConfigVariablesGroupData = {
  __typename?: 'ConfigVariablesGroupData';
  description: Scalars['String']['output'];
  isHiddenOnLoad: Scalars['Boolean']['output'];
  name: ConfigVariablesGroup;
  variables: Array<ConfigVariable>;
};

export type ConfigVariablesOutput = {
  __typename?: 'ConfigVariablesOutput';
  groups: Array<ConfigVariablesGroupData>;
};

export type CreateAgentInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  modelId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  prompt: Scalars['String']['input'];
  responseFormat?: InputMaybe<Scalars['JSON']['input']>;
};

export type CreateAppTokenInput = {
  expiresAt: Scalars['DateTime']['input'];
};

export type CreateApprovedAccessDomainInput = {
  domain: Scalars['String']['input'];
  email: Scalars['String']['input'];
};

export type CreateBillingPlansInput = {
  planId: Scalars['String']['input'];
  planPrice: Scalars['Float']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type CreateDialingPlanInput = {
  cliente_id: Scalars['Int']['input'];
  nome: Scalars['String']['input'];
  plano_discagem_id: Scalars['Int']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type CreateDraftFromWorkflowVersionInput = {
  /** Workflow ID */
  workflowId: Scalars['String']['input'];
  /** Workflow version ID */
  workflowVersionIdToCopy: Scalars['String']['input'];
};

export type CreateFieldInput = {
  defaultValue?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isCustom?: InputMaybe<Scalars['Boolean']['input']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']['input']>;
  isNullable?: InputMaybe<Scalars['Boolean']['input']>;
  isRemoteCreation?: InputMaybe<Scalars['Boolean']['input']>;
  isSystem?: InputMaybe<Scalars['Boolean']['input']>;
  isUnique?: InputMaybe<Scalars['Boolean']['input']>;
  label: Scalars['String']['input'];
  name: Scalars['String']['input'];
  objectMetadataId: Scalars['String']['input'];
  options?: InputMaybe<Scalars['JSON']['input']>;
  relationCreationPayload?: InputMaybe<Scalars['JSON']['input']>;
  settings?: InputMaybe<Scalars['JSON']['input']>;
  type: FieldMetadataType;
};

export type CreateFocusNfeIntegrationInput = {
  integrationName: Scalars['String']['input'];
  status?: Scalars['String']['input'];
  token: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type CreateInterIntegrationInput = {
  certificate?: InputMaybe<Scalars['String']['input']>;
  clientId: Scalars['String']['input'];
  clientSecret: Scalars['String']['input'];
  expirationDate?: InputMaybe<Scalars['DateTime']['input']>;
  integrationName: Scalars['String']['input'];
  privateKey?: InputMaybe<Scalars['String']['input']>;
  status?: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type CreateIssuerInput = {
  cep: Scalars['String']['input'];
  city: Scalars['String']['input'];
  cnaeCode?: InputMaybe<Scalars['String']['input']>;
  cnpj: Scalars['String']['input'];
  cpf?: InputMaybe<Scalars['String']['input']>;
  ie?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  neighborhood: Scalars['String']['input'];
  number: Scalars['String']['input'];
  state: Scalars['String']['input'];
  street: Scalars['String']['input'];
  taxRegime: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type CreateObjectInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']['input']>;
  isRemote?: InputMaybe<Scalars['Boolean']['input']>;
  labelPlural: Scalars['String']['input'];
  labelSingular: Scalars['String']['input'];
  namePlural: Scalars['String']['input'];
  nameSingular: Scalars['String']['input'];
  primaryKeyColumnType?: InputMaybe<Scalars['String']['input']>;
  primaryKeyFieldMetadataSettings?: InputMaybe<Scalars['JSON']['input']>;
  shortcut?: InputMaybe<Scalars['String']['input']>;
};

export type CreateOneAppTokenInput = {
  /** The record to create */
  appToken: CreateAppTokenInput;
};

export type CreateOneFieldMetadataInput = {
  /** The record to create */
  field: CreateFieldInput;
};

export type CreateOneObjectInput = {
  /** The record to create */
  object: CreateObjectInput;
};

export type CreatePabxCompanyInput = {
  acao_limite_espaco: Scalars['Int']['input'];
  aviso_disco_email_alerta?: InputMaybe<Scalars['Int']['input']>;
  aviso_disco_email_urgente?: InputMaybe<Scalars['Int']['input']>;
  bairro?: InputMaybe<Scalars['String']['input']>;
  cel?: InputMaybe<Scalars['String']['input']>;
  cep?: InputMaybe<Scalars['String']['input']>;
  cidade?: InputMaybe<Scalars['String']['input']>;
  cliente_bloqueado?: InputMaybe<Scalars['Int']['input']>;
  cnpj?: InputMaybe<Scalars['String']['input']>;
  compl?: InputMaybe<Scalars['String']['input']>;
  cortar_prefixo_ramal?: InputMaybe<Scalars['Int']['input']>;
  dias_aviso_remocao_mailings?: InputMaybe<Scalars['Int']['input']>;
  dias_remocao_mailings?: InputMaybe<Scalars['Int']['input']>;
  email_cliente?: InputMaybe<Scalars['String']['input']>;
  end?: InputMaybe<Scalars['String']['input']>;
  espaco_disco?: InputMaybe<Scalars['Int']['input']>;
  estado?: InputMaybe<Scalars['String']['input']>;
  faixa_max?: InputMaybe<Scalars['Int']['input']>;
  faixa_min?: InputMaybe<Scalars['Int']['input']>;
  forma_arredondamento?: InputMaybe<Scalars['Int']['input']>;
  formato_numeros_contatos?: InputMaybe<Scalars['Int']['input']>;
  habilita_prefixo_sainte?: InputMaybe<Scalars['Int']['input']>;
  habilitar_aviso_disco_email?: InputMaybe<Scalars['Int']['input']>;
  login: Scalars['String']['input'];
  max_chamadas_simultaneas?: InputMaybe<Scalars['Int']['input']>;
  modulos?: InputMaybe<Scalars['String']['input']>;
  nome: Scalars['String']['input'];
  prefixo?: InputMaybe<Scalars['String']['input']>;
  prefixo_sainte?: InputMaybe<Scalars['Int']['input']>;
  qtd_ramais_max_pa: Scalars['Int']['input'];
  qtd_ramais_max_pabx: Scalars['Int']['input'];
  ramal_resp?: InputMaybe<Scalars['String']['input']>;
  razao_social?: InputMaybe<Scalars['String']['input']>;
  remover_mailings?: InputMaybe<Scalars['Int']['input']>;
  resp?: InputMaybe<Scalars['String']['input']>;
  salas_conf_num_max: Scalars['Int']['input'];
  senha: Scalars['String']['input'];
  tel?: InputMaybe<Scalars['String']['input']>;
  tipo: Scalars['Int']['input'];
  usuario_padrao_id?: InputMaybe<Scalars['Int']['input']>;
  workspaceId: Scalars['ID']['input'];
};

export type CreatePabxTrunkInput = {
  autentica_user_pass?: InputMaybe<Scalars['Int']['input']>;
  cliente_id: Scalars['Int']['input'];
  endereco: Scalars['String']['input'];
  host_dinamico?: InputMaybe<Scalars['Int']['input']>;
  insere_digitos?: InputMaybe<Scalars['String']['input']>;
  nome: Scalars['String']['input'];
  qtd_digitos_cortados?: InputMaybe<Scalars['Int']['input']>;
  senha?: InputMaybe<Scalars['String']['input']>;
  tarifas?: InputMaybe<Array<TarifaTroncoInput>>;
  tronco_id: Scalars['Int']['input'];
  usuario?: InputMaybe<Scalars['String']['input']>;
  workspaceId: Scalars['ID']['input'];
};

export type CreateRemoteServerInput = {
  foreignDataWrapperOptions: Scalars['JSON']['input'];
  foreignDataWrapperType: Scalars['String']['input'];
  label: Scalars['String']['input'];
  schema?: InputMaybe<Scalars['String']['input']>;
  userMappingOptions?: InputMaybe<UserMappingOptions>;
};

export type CreateRoleInput = {
  canDestroyAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canReadAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canSoftDeleteAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdateAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdateAllSettings?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['String']['input']>;
  label: Scalars['String']['input'];
};

export type CreateSectorInput = {
  icon: Scalars['String']['input'];
  name: Scalars['String']['input'];
  topics?: InputMaybe<Array<Scalars['JSON']['input']>>;
  workspaceId: Scalars['ID']['input'];
};

export type CreateServerlessFunctionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  timeoutSeconds?: InputMaybe<Scalars['Float']['input']>;
};

export type CreateStripeIntegrationInput = {
  accountId: Scalars['String']['input'];
  workspaceId: Scalars['ID']['input'];
};

export type CreateTelephonyInput = {
  SIPPassword?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding1?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding1Value?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding2?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding2Value?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding3?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding3Value?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding4?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding4Value?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding5?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding5Value?: InputMaybe<Scalars['String']['input']>;
  areaCode?: InputMaybe<Scalars['String']['input']>;
  blockExtension?: InputMaybe<Scalars['Boolean']['input']>;
  callerExternalID?: InputMaybe<Scalars['String']['input']>;
  destinyMailboxAllCallsOrOffline?: InputMaybe<Scalars['String']['input']>;
  destinyMailboxBusy?: InputMaybe<Scalars['String']['input']>;
  dialingPlan?: InputMaybe<Scalars['String']['input']>;
  emailForMailbox?: InputMaybe<Scalars['String']['input']>;
  enableMailbox?: InputMaybe<Scalars['Boolean']['input']>;
  extensionAllCallsOrOffline?: InputMaybe<Scalars['String']['input']>;
  extensionBusy?: InputMaybe<Scalars['String']['input']>;
  extensionGroup?: InputMaybe<Scalars['String']['input']>;
  extensionName?: InputMaybe<Scalars['String']['input']>;
  externalNumberAllCallsOrOffline?: InputMaybe<Scalars['String']['input']>;
  externalNumberBusy?: InputMaybe<Scalars['String']['input']>;
  fowardAllCalls?: InputMaybe<Scalars['String']['input']>;
  fowardBusyNotAvailable?: InputMaybe<Scalars['String']['input']>;
  fowardOfflineWithoutService?: InputMaybe<Scalars['String']['input']>;
  listenToCalls?: InputMaybe<Scalars['Boolean']['input']>;
  memberId?: InputMaybe<Scalars['ID']['input']>;
  numberExtension: Scalars['ID']['input'];
  pullCalls?: InputMaybe<Scalars['String']['input']>;
  ramal_id?: InputMaybe<Scalars['String']['input']>;
  recordCalls?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  workspaceId: Scalars['ID']['input'];
};

export type CreateWhatsappIntegrationInput = {
  accessToken: Scalars['String']['input'];
  appId: Scalars['String']['input'];
  appKey: Scalars['String']['input'];
  businessAccountId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phoneId: Scalars['String']['input'];
};

export type CreateWorkflowVersionStepInput = {
  /** Next step ID */
  nextStepId?: InputMaybe<Scalars['String']['input']>;
  /** Parent step ID */
  parentStepId?: InputMaybe<Scalars['String']['input']>;
  /** New step type */
  stepType: Scalars['String']['input'];
  /** Workflow version ID */
  workflowVersionId: Scalars['String']['input'];
};

export type CreateWorkspaceAgentInput = {
  inboxesIds: Array<Scalars['String']['input']>;
  isAdmin: Scalars['Boolean']['input'];
  memberId: Scalars['ID']['input'];
  sectorIds: Array<Scalars['String']['input']>;
  workspaceId: Scalars['ID']['input'];
};

export type CursorPaging = {
  /** Paginate after opaque cursor */
  after?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  /** Paginate before opaque cursor */
  before?: InputMaybe<Scalars['ConnectionCursor']['input']>;
  /** Paginate first */
  first?: InputMaybe<Scalars['Int']['input']>;
  /** Paginate last */
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type CustomDomainRecord = {
  __typename?: 'CustomDomainRecord';
  key: Scalars['String']['output'];
  status: Scalars['String']['output'];
  type: Scalars['String']['output'];
  validationType: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type CustomDomainValidRecords = {
  __typename?: 'CustomDomainValidRecords';
  customDomain: Scalars['String']['output'];
  id: Scalars['String']['output'];
  records: Array<CustomDomainRecord>;
};

/** Database Event Action */
export enum DatabaseEventAction {
  CREATED = 'CREATED',
  DELETED = 'DELETED',
  DESTROYED = 'DESTROYED',
  RESTORED = 'RESTORED',
  UPDATED = 'UPDATED'
}

export type DateFilter = {
  eq?: InputMaybe<Scalars['Date']['input']>;
  gt?: InputMaybe<Scalars['Date']['input']>;
  gte?: InputMaybe<Scalars['Date']['input']>;
  in?: InputMaybe<Array<Scalars['Date']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['Date']['input']>;
  lte?: InputMaybe<Scalars['Date']['input']>;
  neq?: InputMaybe<Scalars['Date']['input']>;
};

export type DeleteApprovedAccessDomainInput = {
  id: Scalars['String']['input'];
};

export type DeleteOneFieldInput = {
  /** The id of the field to delete. */
  id: Scalars['UUID']['input'];
};

export type DeleteOneObjectInput = {
  /** The id of the record to delete. */
  id: Scalars['UUID']['input'];
};

export type DeleteSsoInput = {
  identityProviderId: Scalars['String']['input'];
};

export type DeleteSsoOutput = {
  __typename?: 'DeleteSsoOutput';
  identityProviderId: Scalars['String']['output'];
};

export type DeleteWorkflowVersionStepInput = {
  /** Step to delete ID */
  stepId: Scalars['String']['input'];
  /** Workflow version ID */
  workflowVersionId: Scalars['String']['input'];
};

export type DeletedWorkspaceMember = {
  __typename?: 'DeletedWorkspaceMember';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  name: FullName;
  userEmail: Scalars['String']['output'];
  userWorkspaceId?: Maybe<Scalars['String']['output']>;
};

/** Schema update on a table */
export enum DistantTableUpdate {
  COLUMNS_ADDED = 'COLUMNS_ADDED',
  COLUMNS_DELETED = 'COLUMNS_DELETED',
  COLUMNS_TYPE_CHANGED = 'COLUMNS_TYPE_CHANGED',
  TABLE_DELETED = 'TABLE_DELETED'
}

export type EditSsoInput = {
  id: Scalars['String']['input'];
  status: SsoIdentityProviderStatus;
};

export type EditSsoOutput = {
  __typename?: 'EditSsoOutput';
  id: Scalars['String']['output'];
  issuer: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export type EmailPasswordResetLink = {
  __typename?: 'EmailPasswordResetLink';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean']['output'];
};

export type Encaminhamento = {
  __typename?: 'Encaminhamento';
  encaminhamento_destino?: Maybe<Array<Scalars['String']['output']>>;
  encaminhamento_destinos?: Maybe<Array<Scalars['String']['output']>>;
  encaminhamento_tipo?: Maybe<Scalars['String']['output']>;
};

export type ExecuteServerlessFunctionInput = {
  /** Id of the serverless function to execute */
  id: Scalars['UUID']['input'];
  /** Payload in JSON format */
  payload: Scalars['JSON']['input'];
  /** Version of the serverless function to execute */
  version?: Scalars['String']['input'];
};

export type FeatureFlag = {
  __typename?: 'FeatureFlag';
  id: Scalars['UUID']['output'];
  key: FeatureFlagKey;
  value: Scalars['Boolean']['output'];
  workspaceId: Scalars['String']['output'];
};

export type FeatureFlagDto = {
  __typename?: 'FeatureFlagDTO';
  key: FeatureFlagKey;
  value: Scalars['Boolean']['output'];
};

export enum FeatureFlagKey {
  IS_AIRTABLE_INTEGRATION_ENABLED = 'IS_AIRTABLE_INTEGRATION_ENABLED',
  IS_AI_ENABLED = 'IS_AI_ENABLED',
  IS_JSON_FILTER_ENABLED = 'IS_JSON_FILTER_ENABLED',
  IS_POSTGRESQL_INTEGRATION_ENABLED = 'IS_POSTGRESQL_INTEGRATION_ENABLED',
  IS_STRIPE_INTEGRATION_ENABLED = 'IS_STRIPE_INTEGRATION_ENABLED',
  IS_UNIQUE_INDEXES_ENABLED = 'IS_UNIQUE_INDEXES_ENABLED'
}

export type Field = {
  __typename?: 'Field';
  createdAt: Scalars['DateTime']['output'];
  defaultValue?: Maybe<Scalars['JSON']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  isActive?: Maybe<Scalars['Boolean']['output']>;
  isCustom?: Maybe<Scalars['Boolean']['output']>;
  isLabelSyncedWithName?: Maybe<Scalars['Boolean']['output']>;
  isNullable?: Maybe<Scalars['Boolean']['output']>;
  isSystem?: Maybe<Scalars['Boolean']['output']>;
  isUnique?: Maybe<Scalars['Boolean']['output']>;
  label: Scalars['String']['output'];
  name: Scalars['String']['output'];
  object?: Maybe<Object>;
  options?: Maybe<Scalars['JSON']['output']>;
  relation?: Maybe<Relation>;
  settings?: Maybe<Scalars['JSON']['output']>;
  standardOverrides?: Maybe<StandardOverrides>;
  type: FieldMetadataType;
  updatedAt: Scalars['DateTime']['output'];
};

export type FieldConnection = {
  __typename?: 'FieldConnection';
  /** Array of edges. */
  edges: Array<FieldEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type FieldEdge = {
  __typename?: 'FieldEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the Field */
  node: Field;
};

export type FieldFilter = {
  and?: InputMaybe<Array<FieldFilter>>;
  id?: InputMaybe<UuidFilterComparison>;
  isActive?: InputMaybe<BooleanFieldComparison>;
  isCustom?: InputMaybe<BooleanFieldComparison>;
  isSystem?: InputMaybe<BooleanFieldComparison>;
  or?: InputMaybe<Array<FieldFilter>>;
};

/** Type of the field */
export enum FieldMetadataType {
  ACTOR = 'ACTOR',
  ADDRESS = 'ADDRESS',
  ARRAY = 'ARRAY',
  BOOLEAN = 'BOOLEAN',
  CURRENCY = 'CURRENCY',
  DATE = 'DATE',
  DATE_TIME = 'DATE_TIME',
  EMAILS = 'EMAILS',
  FULL_NAME = 'FULL_NAME',
  LINKS = 'LINKS',
  MULTI_SELECT = 'MULTI_SELECT',
  NUMBER = 'NUMBER',
  NUMERIC = 'NUMERIC',
  PHONES = 'PHONES',
  POSITION = 'POSITION',
  RATING = 'RATING',
  RAW_JSON = 'RAW_JSON',
  RELATION = 'RELATION',
  RICH_TEXT = 'RICH_TEXT',
  RICH_TEXT_V2 = 'RICH_TEXT_V2',
  SELECT = 'SELECT',
  TEXT = 'TEXT',
  TS_VECTOR = 'TS_VECTOR',
  UUID = 'UUID'
}

export enum FileFolder {
  Attachment = 'Attachment',
  BillingSubscriptionBill = 'BillingSubscriptionBill',
  ChargeBill = 'ChargeBill',
  PersonPicture = 'PersonPicture',
  ProfilePicture = 'ProfilePicture',
  ServerlessFunction = 'ServerlessFunction',
  WorkspaceLogo = 'WorkspaceLogo'
}

export enum FilterIs {
  NotNull = 'NotNull',
  Null = 'Null'
}

export type FindAvailableSsoidpOutput = {
  __typename?: 'FindAvailableSSOIDPOutput';
  id: Scalars['String']['output'];
  issuer: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
  workspace: WorkspaceNameAndId;
};

export type FindManyRemoteTablesInput = {
  /** The id of the remote server. */
  id: Scalars['ID']['input'];
  /** Indicates if pending schema updates status should be computed. */
  shouldFetchPendingSchemaUpdates?: InputMaybe<Scalars['Boolean']['input']>;
};

export type FocusNfeIntegrationPublicDto = {
  __typename?: 'FocusNfeIntegrationPublicDto';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  integrationName?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workspace?: Maybe<Workspace>;
};

export type FullName = {
  __typename?: 'FullName';
  firstName: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
};

export type GetAuthorizationUrlForSsoInput = {
  identityProviderId: Scalars['String']['input'];
  workspaceInviteHash?: InputMaybe<Scalars['String']['input']>;
};

export type GetAuthorizationUrlForSsoOutput = {
  __typename?: 'GetAuthorizationUrlForSSOOutput';
  authorizationURL: Scalars['String']['output'];
  id: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type GetLoginTokenFromEmailVerificationTokenOutput = {
  __typename?: 'GetLoginTokenFromEmailVerificationTokenOutput';
  loginToken: AuthToken;
  workspaceUrls: WorkspaceUrls;
};

export type GetServerlessFunctionSourceCodeInput = {
  /** The id of the function. */
  id: Scalars['ID']['input'];
  /** The version of the function */
  version?: Scalars['String']['input'];
};

export enum HealthIndicatorId {
  app = 'app',
  connectedAccount = 'connectedAccount',
  database = 'database',
  redis = 'redis',
  worker = 'worker'
}

export enum IdentityProviderType {
  OIDC = 'OIDC',
  SAML = 'SAML'
}

export type ImpersonateOutput = {
  __typename?: 'ImpersonateOutput';
  loginToken: AuthToken;
  workspace: WorkspaceUrlsAndId;
};

export type Inbox = {
  __typename?: 'Inbox';
  agents: Array<WorkspaceAgent>;
  id: Scalars['UUID']['output'];
  integrationType: IntegrationType;
  whatsappIntegrationId: Scalars['String']['output'];
  workspace: Workspace;
};

export type Index = {
  __typename?: 'Index';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  indexFieldMetadatas: IndexIndexFieldMetadatasConnection;
  indexType: IndexType;
  indexWhereClause?: Maybe<Scalars['String']['output']>;
  isCustom?: Maybe<Scalars['Boolean']['output']>;
  isUnique: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  objectMetadata: IndexObjectMetadataConnection;
  updatedAt: Scalars['DateTime']['output'];
};


export type IndexIndexFieldMetadatasArgs = {
  filter?: IndexFieldFilter;
  paging?: CursorPaging;
};


export type IndexObjectMetadataArgs = {
  filter?: ObjectFilter;
  paging?: CursorPaging;
};

export type IndexConnection = {
  __typename?: 'IndexConnection';
  /** Array of edges. */
  edges: Array<IndexEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type IndexEdge = {
  __typename?: 'IndexEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the Index */
  node: Index;
};

export type IndexField = {
  __typename?: 'IndexField';
  createdAt: Scalars['DateTime']['output'];
  fieldMetadataId: Scalars['UUID']['output'];
  id: Scalars['UUID']['output'];
  order: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type IndexFieldEdge = {
  __typename?: 'IndexFieldEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the IndexField */
  node: IndexField;
};

export type IndexFieldFilter = {
  and?: InputMaybe<Array<IndexFieldFilter>>;
  fieldMetadataId?: InputMaybe<UuidFilterComparison>;
  id?: InputMaybe<UuidFilterComparison>;
  or?: InputMaybe<Array<IndexFieldFilter>>;
};

export type IndexFilter = {
  and?: InputMaybe<Array<IndexFilter>>;
  id?: InputMaybe<UuidFilterComparison>;
  isCustom?: InputMaybe<BooleanFieldComparison>;
  or?: InputMaybe<Array<IndexFilter>>;
};

export type IndexIndexFieldMetadatasConnection = {
  __typename?: 'IndexIndexFieldMetadatasConnection';
  /** Array of edges. */
  edges: Array<IndexFieldEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type IndexObjectMetadataConnection = {
  __typename?: 'IndexObjectMetadataConnection';
  /** Array of edges. */
  edges: Array<ObjectEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

/** Type of the index */
export enum IndexType {
  BTREE = 'BTREE',
  GIN = 'GIN'
}

/** Available integration types */
export enum IntegrationType {
  MESSENGER = 'MESSENGER',
  WHATSAPP = 'WHATSAPP'
}

export type InterCreateChargeDto = {
  address: Scalars['String']['input'];
  cep: Scalars['String']['input'];
  city: Scalars['String']['input'];
  cpfCnpj: Scalars['String']['input'];
  legalEntity: InterCustomerType;
  name: Scalars['String']['input'];
  stateUnity: InterCustomerUf;
};

/** Tipos de pessoa para o cliente Inter */
export enum InterCustomerType {
  FISICA = 'FISICA',
  JURIDICA = 'JURIDICA'
}

/** Estados brasileiros para o cliente Inter */
export enum InterCustomerUf {
  AC = 'AC',
  AL = 'AL',
  AM = 'AM',
  AP = 'AP',
  BA = 'BA',
  CE = 'CE',
  DF = 'DF',
  ES = 'ES',
  GO = 'GO',
  MA = 'MA',
  MG = 'MG',
  MS = 'MS',
  MT = 'MT',
  PA = 'PA',
  PB = 'PB',
  PE = 'PE',
  PI = 'PI',
  PR = 'PR',
  RJ = 'RJ',
  RN = 'RN',
  RO = 'RO',
  RR = 'RR',
  RS = 'RS',
  SC = 'SC',
  SE = 'SE',
  SP = 'SP',
  TO = 'TO'
}

export type InterIntegration = {
  __typename?: 'InterIntegration';
  certificate?: Maybe<Scalars['String']['output']>;
  clientId: Scalars['String']['output'];
  clientSecret: Scalars['String']['output'];
  expirationDate?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['UUID']['output'];
  integrationName: Scalars['String']['output'];
  privateKey?: Maybe<Scalars['String']['output']>;
  status: Scalars['String']['output'];
  workspace: Workspace;
};

export type InvalidatePassword = {
  __typename?: 'InvalidatePassword';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean']['output'];
};

export type IssuerDto = {
  __typename?: 'IssuerDto';
  cep: Scalars['String']['output'];
  city: Scalars['String']['output'];
  cnaeCode?: Maybe<Scalars['String']['output']>;
  cnpj: Scalars['String']['output'];
  cpf?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  ie?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  neighborhood: Scalars['String']['output'];
  number: Scalars['String']['output'];
  state: Scalars['String']['output'];
  street: Scalars['String']['output'];
  taxRegime: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  workspace: Workspace;
};

export type LinkLogsWorkspaceEntity = {
  __typename?: 'LinkLogsWorkspaceEntity';
  id: Scalars['String']['output'];
  linkId?: Maybe<Scalars['String']['output']>;
  linkName?: Maybe<Scalars['String']['output']>;
  product: Scalars['String']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
  userIp?: Maybe<Scalars['String']['output']>;
  utmCampaign: Scalars['String']['output'];
  utmMedium: Scalars['String']['output'];
  utmSource: Scalars['String']['output'];
};

export type LinkMetadata = {
  __typename?: 'LinkMetadata';
  label: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type LinksMetadata = {
  __typename?: 'LinksMetadata';
  primaryLinkLabel: Scalars['String']['output'];
  primaryLinkUrl: Scalars['String']['output'];
  secondaryLinks?: Maybe<Array<LinkMetadata>>;
};

export type LoginToken = {
  __typename?: 'LoginToken';
  loginToken: AuthToken;
};

export type MessageAgent = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export enum MessageChannelVisibility {
  METADATA = 'METADATA',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
  SUBJECT = 'SUBJECT'
}

export type MessageSector = {
  id: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export enum ModelProvider {
  ANTHROPIC = 'ANTHROPIC',
  OPENAI = 'OPENAI'
}

export type Mutation = {
  __typename?: 'Mutation';
  activateWorkflowVersion: Scalars['Boolean']['output'];
  activateWorkspace: Workspace;
  authorizeApp: AuthorizeApp;
  checkCustomDomainValidRecords?: Maybe<CustomDomainValidRecords>;
  checkoutSession: BillingSessionOutput;
  computeStepOutputSchema: Scalars['JSON']['output'];
  createAgent: WorkspaceAgent;
  createApprovedAccessDomain: ApprovedAccessDomain;
  createBillingPlans: BillingPlans;
  createDatabaseConfigVariable: Scalars['Boolean']['output'];
  createDialingPlan: PabxDialingPlanResponseType;
  createDraftFromWorkflowVersion: WorkflowVersion;
  createFocusNfeIntegration: FocusNfeIntegrationPublicDto;
  createInterIntegration: InterIntegration;
  createIssuer: IssuerDto;
  createOIDCIdentityProvider: SetupSsoOutput;
  createObjectEvent: Analytics;
  createOneAgent: Agent;
  createOneAppToken: AppToken;
  createOneField: Field;
  createOneObject: Object;
  createOneRemoteServer: RemoteServer;
  createOneRole: Role;
  createOneServerlessFunction: ServerlessFunction;
  createPabxCompany: PabxCompanyResponseType;
  createPabxTrunk: PabxTrunkResponseType;
  createSAMLIdentityProvider: SetupSsoOutput;
  createSector: Sector;
  createStripeIntegration: StripeIntegration;
  createTelephony: Telephony;
  createWhatsappIntegration: WhatsappWorkspaceEntity;
  createWorkflowVersionStep: WorkflowAction;
  deactivateWorkflowVersion: Scalars['Boolean']['output'];
  deleteAgent: WorkspaceAgent;
  deleteApprovedAccessDomain: Scalars['Boolean']['output'];
  deleteCurrentWorkspace: Workspace;
  deleteDatabaseConfigVariable: Scalars['Boolean']['output'];
  deleteFocusNfeIntegration: Scalars['Boolean']['output'];
  deleteIssuer: Scalars['Boolean']['output'];
  deleteOneAgent: Agent;
  deleteOneField: Field;
  deleteOneObject: Object;
  deleteOneRemoteServer: RemoteServer;
  deleteOneRole: Scalars['String']['output'];
  deleteOneServerlessFunction: ServerlessFunction;
  deleteSSOIdentityProvider: DeleteSsoOutput;
  deleteSector: Scalars['Boolean']['output'];
  deleteTelephony: Scalars['Boolean']['output'];
  deleteUser: User;
  deleteWorkflowVersionStep: WorkflowAction;
  deleteWorkspaceInvitation: Scalars['String']['output'];
  disablePostgresProxy: PostgresCredentials;
  editSSOIdentityProvider: EditSsoOutput;
  emailPasswordResetLink: EmailPasswordResetLink;
  enablePostgresProxy: PostgresCredentials;
  endSubscriptionTrialPeriod: BillingEndTrialPeriodOutput;
  executeOneServerlessFunction: ServerlessFunctionExecutionResult;
  generateApiKeyToken: ApiKeyToken;
  generateTransientToken: TransientToken;
  getAuthTokensFromLoginToken: AuthTokens;
  getAuthorizationUrlForSSO: GetAuthorizationUrlForSsoOutput;
  getLoginTokenFromCredentials: LoginToken;
  getLoginTokenFromEmailVerificationToken: GetLoginTokenFromEmailVerificationTokenOutput;
  impersonate: ImpersonateOutput;
  publishServerlessFunction: ServerlessFunction;
  removeBillingPlan: Scalars['Boolean']['output'];
  removeStripeIntegration: Scalars['Boolean']['output'];
  renewToken: AuthTokens;
  resendEmailVerificationToken: ResendEmailVerificationTokenOutput;
  resendWorkspaceInvitation: SendInvitationsOutput;
  runWorkflowVersion: WorkflowRun;
  saveBillingPlanId: BillingPlans;
  saveStripeAccountId: StripeIntegration;
  sendEventMessage: Scalars['Boolean']['output'];
  sendInvitations: SendInvitationsOutput;
  sendMessage: Scalars['Boolean']['output'];
  sendTemplate: Scalars['Boolean']['output'];
  setupOneSignalApp: Workspace;
  setupPabxEnvironment: SetupPabxEnvironmentResponseType;
  signIn: AvailableWorkspacesAndAccessTokensOutput;
  signUp: AvailableWorkspacesAndAccessTokensOutput;
  signUpInNewWorkspace: SignUpOutput;
  signUpInWorkspace: SignUpOutput;
  skipBookOnboardingStep: OnboardingStepSuccess;
  skipSyncEmailOnboardingStep: OnboardingStepSuccess;
  submitFormStep: Scalars['Boolean']['output'];
  switchPlan: BillingSwitchPlanOutput;
  switchToEnterprisePlan: BillingUpdateOutput;
  switchToYearlyInterval: BillingUpdateOutput;
  syncInterData: Scalars['Boolean']['output'];
  syncRemoteTable: RemoteTable;
  syncRemoteTableSchemaChanges: RemoteTable;
  toggleAgentStatus: Scalars['Boolean']['output'];
  toggleFocusNfeIntegrationStatus: Scalars['String']['output'];
  toggleInterIntegrationStatus: Scalars['String']['output'];
  toggleWhatsappIntegrationStatus: Scalars['Boolean']['output'];
  trackAnalytics: Analytics;
  unsyncRemoteTable: RemoteTable;
  updateAgent: WorkspaceAgent;
  updateBillingPlans: BillingPlans;
  updateChatbotFlow: ChatbotFlow;
  updateDatabaseConfigVariable: Scalars['Boolean']['output'];
  updateFocusNfeIntegration: FocusNfeIntegrationPublicDto;
  updateInterIntegration: InterIntegration;
  updateIssuer: IssuerDto;
  updateLabPublicFeatureFlag: FeatureFlagDto;
  updateOneAgent: Agent;
  updateOneField: Field;
  updateOneObject: Object;
  updateOneRemoteServer: RemoteServer;
  updateOneRole: Role;
  updateOneServerlessFunction: ServerlessFunction;
  updateOneTimePaidSubscription: BillingUpdateOneTimePaidSubscriptionOutput;
  updatePasswordViaResetToken: InvalidatePassword;
  updateRoutingRules: UpdateRoutingRulesResponseType;
  updateSector: Sector;
  updateStripeIntegration: StripeIntegration;
  updateTelephony: Telephony;
  updateWhatsappIntegration: WhatsappWorkspaceEntity;
  updateWhatsappIntegrationServiceLevel: WhatsappWorkspaceEntity;
  updateWorkflowRunStep: WorkflowAction;
  updateWorkflowVersionStep: WorkflowAction;
  updateWorkspace: Workspace;
  updateWorkspaceFeatureFlag: Scalars['Boolean']['output'];
  updateWorkspaceMemberRole: WorkspaceMember;
  uploadFile: SignedFileDto;
  uploadFileToBucket: Scalars['String']['output'];
  uploadImage: SignedFileDto;
  uploadProfilePicture: SignedFileDto;
  uploadWorkspaceLogo: SignedFileDto;
  upsertObjectPermissions: Array<ObjectPermission>;
  upsertSettingPermissions: Array<SettingPermission>;
  userLookupAdminPanel: UserLookup;
  validateApprovedAccessDomain: ApprovedAccessDomain;
  validateChatbotFlow: ChatbotFlow;
};


export type MutationActivateWorkflowVersionArgs = {
  workflowVersionId: Scalars['String']['input'];
};


export type MutationActivateWorkspaceArgs = {
  data: ActivateWorkspaceInput;
};


export type MutationAuthorizeAppArgs = {
  clientId: Scalars['String']['input'];
  codeChallenge?: InputMaybe<Scalars['String']['input']>;
  redirectUrl: Scalars['String']['input'];
};


export type MutationCheckoutSessionArgs = {
  interChargeData?: InputMaybe<InterCreateChargeDto>;
  paymentProvider?: BillingPaymentProviders;
  plan?: BillingPlanKey;
  recurringInterval: SubscriptionInterval;
  requirePaymentMethod?: Scalars['Boolean']['input'];
  successUrlPath?: InputMaybe<Scalars['String']['input']>;
};


export type MutationComputeStepOutputSchemaArgs = {
  input: ComputeStepOutputSchemaInput;
};


export type MutationCreateAgentArgs = {
  createInput: CreateWorkspaceAgentInput;
};


export type MutationCreateApprovedAccessDomainArgs = {
  input: CreateApprovedAccessDomainInput;
};


export type MutationCreateBillingPlansArgs = {
  createBillingPlansInput: CreateBillingPlansInput;
};


export type MutationCreateDatabaseConfigVariableArgs = {
  key: Scalars['String']['input'];
  value: Scalars['JSON']['input'];
};


export type MutationCreateDialingPlanArgs = {
  input: CreateDialingPlanInput;
};


export type MutationCreateDraftFromWorkflowVersionArgs = {
  input: CreateDraftFromWorkflowVersionInput;
};


export type MutationCreateFocusNfeIntegrationArgs = {
  createInput: CreateFocusNfeIntegrationInput;
};


export type MutationCreateInterIntegrationArgs = {
  createInput: CreateInterIntegrationInput;
};


export type MutationCreateIssuerArgs = {
  createInput: CreateIssuerInput;
};


export type MutationCreateOidcIdentityProviderArgs = {
  input: SetupOidcSsoInput;
};


export type MutationCreateObjectEventArgs = {
  event: Scalars['String']['input'];
  objectMetadataId: Scalars['String']['input'];
  properties?: InputMaybe<Scalars['JSON']['input']>;
  recordId: Scalars['String']['input'];
};


export type MutationCreateOneAgentArgs = {
  input: CreateAgentInput;
};


export type MutationCreateOneAppTokenArgs = {
  input: CreateOneAppTokenInput;
};


export type MutationCreateOneFieldArgs = {
  input: CreateOneFieldMetadataInput;
};


export type MutationCreateOneObjectArgs = {
  input: CreateOneObjectInput;
};


export type MutationCreateOneRemoteServerArgs = {
  input: CreateRemoteServerInput;
};


export type MutationCreateOneRoleArgs = {
  createRoleInput: CreateRoleInput;
};


export type MutationCreateOneServerlessFunctionArgs = {
  input: CreateServerlessFunctionInput;
};


export type MutationCreatePabxCompanyArgs = {
  input: CreatePabxCompanyInput;
};


export type MutationCreatePabxTrunkArgs = {
  input: CreatePabxTrunkInput;
};


export type MutationCreateSamlIdentityProviderArgs = {
  input: SetupSamlSsoInput;
};


export type MutationCreateSectorArgs = {
  createInput: CreateSectorInput;
};


export type MutationCreateStripeIntegrationArgs = {
  createStripeIntegrationInput: CreateStripeIntegrationInput;
};


export type MutationCreateTelephonyArgs = {
  createTelephonyInput: CreateTelephonyInput;
};


export type MutationCreateWhatsappIntegrationArgs = {
  createInput: CreateWhatsappIntegrationInput;
};


export type MutationCreateWorkflowVersionStepArgs = {
  input: CreateWorkflowVersionStepInput;
};


export type MutationDeactivateWorkflowVersionArgs = {
  workflowVersionId: Scalars['String']['input'];
};


export type MutationDeleteAgentArgs = {
  agentId: Scalars['String']['input'];
};


export type MutationDeleteApprovedAccessDomainArgs = {
  input: DeleteApprovedAccessDomainInput;
};


export type MutationDeleteDatabaseConfigVariableArgs = {
  key: Scalars['String']['input'];
};


export type MutationDeleteFocusNfeIntegrationArgs = {
  focusNfeIntegrationId: Scalars['String']['input'];
};


export type MutationDeleteIssuerArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteOneAgentArgs = {
  input: AgentIdInput;
};


export type MutationDeleteOneFieldArgs = {
  input: DeleteOneFieldInput;
};


export type MutationDeleteOneObjectArgs = {
  input: DeleteOneObjectInput;
};


export type MutationDeleteOneRemoteServerArgs = {
  input: RemoteServerIdInput;
};


export type MutationDeleteOneRoleArgs = {
  roleId: Scalars['String']['input'];
};


export type MutationDeleteOneServerlessFunctionArgs = {
  input: ServerlessFunctionIdInput;
};


export type MutationDeleteSsoIdentityProviderArgs = {
  input: DeleteSsoInput;
};


export type MutationDeleteSectorArgs = {
  sectorId: Scalars['String']['input'];
};


export type MutationDeleteTelephonyArgs = {
  telephonyId: Scalars['ID']['input'];
};


export type MutationDeleteWorkflowVersionStepArgs = {
  input: DeleteWorkflowVersionStepInput;
};


export type MutationDeleteWorkspaceInvitationArgs = {
  appTokenId: Scalars['String']['input'];
};


export type MutationEditSsoIdentityProviderArgs = {
  input: EditSsoInput;
};


export type MutationEmailPasswordResetLinkArgs = {
  email: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationExecuteOneServerlessFunctionArgs = {
  input: ExecuteServerlessFunctionInput;
};


export type MutationGenerateApiKeyTokenArgs = {
  apiKeyId: Scalars['String']['input'];
  expiresAt: Scalars['String']['input'];
};


export type MutationGetAuthTokensFromLoginTokenArgs = {
  loginToken: Scalars['String']['input'];
  origin: Scalars['String']['input'];
};


export type MutationGetAuthorizationUrlForSsoArgs = {
  input: GetAuthorizationUrlForSsoInput;
};


export type MutationGetLoginTokenFromCredentialsArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  origin: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationGetLoginTokenFromEmailVerificationTokenArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  emailVerificationToken: Scalars['String']['input'];
  origin: Scalars['String']['input'];
};


export type MutationImpersonateArgs = {
  userId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationPublishServerlessFunctionArgs = {
  input: PublishServerlessFunctionInput;
};


export type MutationRemoveBillingPlanArgs = {
  planId: Scalars['String']['input'];
};


export type MutationRemoveStripeIntegrationArgs = {
  accountId: Scalars['String']['input'];
};


export type MutationRenewTokenArgs = {
  appToken: Scalars['String']['input'];
};


export type MutationResendEmailVerificationTokenArgs = {
  email: Scalars['String']['input'];
  origin: Scalars['String']['input'];
};


export type MutationResendWorkspaceInvitationArgs = {
  appTokenId: Scalars['String']['input'];
};


export type MutationRunWorkflowVersionArgs = {
  input: RunWorkflowVersionInput;
};


export type MutationSaveBillingPlanIdArgs = {
  planId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationSaveStripeAccountIdArgs = {
  accountId: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationSendEventMessageArgs = {
  sendEventMessageInput: SendEventMessageInput;
};


export type MutationSendInvitationsArgs = {
  emails: Array<Scalars['String']['input']>;
};


export type MutationSendMessageArgs = {
  sendMessageInput: SendMessageInput;
};


export type MutationSendTemplateArgs = {
  sendTemplateInput: SendTemplateInput;
};


export type MutationSetupPabxEnvironmentArgs = {
  input: SetupPabxEnvironmentInput;
};


export type MutationSignInArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationSignUpArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationSignUpInWorkspaceArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  locale?: InputMaybe<Scalars['String']['input']>;
  password: Scalars['String']['input'];
  verifyEmailNextPath?: InputMaybe<Scalars['String']['input']>;
  workspaceId?: InputMaybe<Scalars['String']['input']>;
  workspaceInviteHash?: InputMaybe<Scalars['String']['input']>;
  workspacePersonalInviteToken?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSubmitFormStepArgs = {
  input: SubmitFormStepInput;
};


export type MutationSwitchPlanArgs = {
  plan: BillingPlanKey;
};


export type MutationSyncInterDataArgs = {
  integrationId: Scalars['String']['input'];
};


export type MutationSyncRemoteTableArgs = {
  input: RemoteTableInput;
};


export type MutationSyncRemoteTableSchemaChangesArgs = {
  input: RemoteTableInput;
};


export type MutationToggleAgentStatusArgs = {
  agentId: Scalars['String']['input'];
};


export type MutationToggleFocusNfeIntegrationStatusArgs = {
  focusNfeIntegrationId: Scalars['String']['input'];
};


export type MutationToggleInterIntegrationStatusArgs = {
  integrationId: Scalars['String']['input'];
};


export type MutationToggleWhatsappIntegrationStatusArgs = {
  integrationId: Scalars['String']['input'];
};


export type MutationTrackAnalyticsArgs = {
  event?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  properties?: InputMaybe<Scalars['JSON']['input']>;
  type: AnalyticsType;
};


export type MutationUnsyncRemoteTableArgs = {
  input: RemoteTableInput;
};


export type MutationUpdateAgentArgs = {
  updateInput: UpdateWorkspaceAgentInput;
};


export type MutationUpdateBillingPlansArgs = {
  updateBillingPlansInput: UpdateBillingPlansInput;
};


export type MutationUpdateChatbotFlowArgs = {
  updateChatbotInput: UpdateChatbotFlowInput;
};


export type MutationUpdateDatabaseConfigVariableArgs = {
  key: Scalars['String']['input'];
  value: Scalars['JSON']['input'];
};


export type MutationUpdateFocusNfeIntegrationArgs = {
  updateInput: UpdateFocusNfeIntegrationInput;
};


export type MutationUpdateInterIntegrationArgs = {
  updateInput: UpdateInterIntegrationInput;
};


export type MutationUpdateIssuerArgs = {
  id: Scalars['ID']['input'];
  updateInput: UpdateIssuerInput;
};


export type MutationUpdateLabPublicFeatureFlagArgs = {
  input: UpdateLabPublicFeatureFlagInput;
};


export type MutationUpdateOneAgentArgs = {
  input: UpdateAgentInput;
};


export type MutationUpdateOneFieldArgs = {
  input: UpdateOneFieldMetadataInput;
};


export type MutationUpdateOneObjectArgs = {
  input: UpdateOneObjectInput;
};


export type MutationUpdateOneRemoteServerArgs = {
  input: UpdateRemoteServerInput;
};


export type MutationUpdateOneRoleArgs = {
  updateRoleInput: UpdateRoleInput;
};


export type MutationUpdateOneServerlessFunctionArgs = {
  input: UpdateServerlessFunctionInput;
};


export type MutationUpdatePasswordViaResetTokenArgs = {
  newPassword: Scalars['String']['input'];
  passwordResetToken: Scalars['String']['input'];
};


export type MutationUpdateRoutingRulesArgs = {
  input: UpdateRoutingRulesInput;
};


export type MutationUpdateSectorArgs = {
  updateInput: UpdateSectorInput;
};


export type MutationUpdateStripeIntegrationArgs = {
  updateStripeIntegrationInput: UpdateStripeIntegrationInput;
};


export type MutationUpdateTelephonyArgs = {
  id: Scalars['ID']['input'];
  updateTelephonyInput: UpdateTelephonyInput;
};


export type MutationUpdateWhatsappIntegrationArgs = {
  updateInput: UpdateWhatsappIntegrationInput;
};


export type MutationUpdateWhatsappIntegrationServiceLevelArgs = {
  integrationId: Scalars['String']['input'];
  sla: Scalars['Int']['input'];
};


export type MutationUpdateWorkflowRunStepArgs = {
  input: UpdateWorkflowRunStepInput;
};


export type MutationUpdateWorkflowVersionStepArgs = {
  input: UpdateWorkflowVersionStepInput;
};


export type MutationUpdateWorkspaceArgs = {
  data: UpdateWorkspaceInput;
};


export type MutationUpdateWorkspaceFeatureFlagArgs = {
  featureFlag: Scalars['String']['input'];
  value: Scalars['Boolean']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationUpdateWorkspaceMemberRoleArgs = {
  roleId: Scalars['String']['input'];
  workspaceMemberId: Scalars['String']['input'];
};


export type MutationUploadFileArgs = {
  file: Scalars['Upload']['input'];
  fileFolder?: InputMaybe<FileFolder>;
};


export type MutationUploadFileToBucketArgs = {
  file: Scalars['Upload']['input'];
  isInternal?: InputMaybe<Scalars['Boolean']['input']>;
  type: Scalars['String']['input'];
  workspaceId: Scalars['String']['input'];
};


export type MutationUploadImageArgs = {
  file: Scalars['Upload']['input'];
  fileFolder?: InputMaybe<FileFolder>;
};


export type MutationUploadProfilePictureArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationUploadWorkspaceLogoArgs = {
  file: Scalars['Upload']['input'];
};


export type MutationUpsertObjectPermissionsArgs = {
  upsertObjectPermissionsInput: UpsertObjectPermissionsInput;
};


export type MutationUpsertSettingPermissionsArgs = {
  upsertSettingPermissionsInput: UpsertSettingPermissionsInput;
};


export type MutationUserLookupAdminPanelArgs = {
  userIdentifier: Scalars['String']['input'];
};


export type MutationValidateApprovedAccessDomainArgs = {
  input: ValidateApprovedAccessDomainInput;
};


export type MutationValidateChatbotFlowArgs = {
  chatbotInput: ChatbotFlowInput;
};

export type Object = {
  __typename?: 'Object';
  createdAt: Scalars['DateTime']['output'];
  dataSourceId: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  duplicateCriteria?: Maybe<Array<Array<Scalars['String']['output']>>>;
  fields: ObjectFieldsConnection;
  fieldsList: Array<Field>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  imageIdentifierFieldMetadataId?: Maybe<Scalars['String']['output']>;
  indexMetadataList: Array<Index>;
  indexMetadatas: ObjectIndexMetadatasConnection;
  isActive: Scalars['Boolean']['output'];
  isCustom: Scalars['Boolean']['output'];
  isLabelSyncedWithName: Scalars['Boolean']['output'];
  isRemote: Scalars['Boolean']['output'];
  isSearchable: Scalars['Boolean']['output'];
  isSystem: Scalars['Boolean']['output'];
  labelIdentifierFieldMetadataId?: Maybe<Scalars['String']['output']>;
  labelPlural: Scalars['String']['output'];
  labelSingular: Scalars['String']['output'];
  namePlural: Scalars['String']['output'];
  nameSingular: Scalars['String']['output'];
  shortcut?: Maybe<Scalars['String']['output']>;
  standardOverrides?: Maybe<ObjectStandardOverrides>;
  updatedAt: Scalars['DateTime']['output'];
};


export type ObjectFieldsArgs = {
  filter?: FieldFilter;
  paging?: CursorPaging;
};


export type ObjectIndexMetadatasArgs = {
  filter?: IndexFilter;
  paging?: CursorPaging;
};

export type ObjectConnection = {
  __typename?: 'ObjectConnection';
  /** Array of edges. */
  edges: Array<ObjectEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type ObjectEdge = {
  __typename?: 'ObjectEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the Object */
  node: Object;
};

export type ObjectFieldsConnection = {
  __typename?: 'ObjectFieldsConnection';
  /** Array of edges. */
  edges: Array<FieldEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type ObjectFilter = {
  and?: InputMaybe<Array<ObjectFilter>>;
  id?: InputMaybe<UuidFilterComparison>;
  isActive?: InputMaybe<BooleanFieldComparison>;
  isCustom?: InputMaybe<BooleanFieldComparison>;
  isRemote?: InputMaybe<BooleanFieldComparison>;
  isSearchable?: InputMaybe<BooleanFieldComparison>;
  isSystem?: InputMaybe<BooleanFieldComparison>;
  or?: InputMaybe<Array<ObjectFilter>>;
};

export type ObjectIndexMetadatasConnection = {
  __typename?: 'ObjectIndexMetadatasConnection';
  /** Array of edges. */
  edges: Array<IndexEdge>;
  /** Paging information */
  pageInfo: PageInfo;
};

export type ObjectPermission = {
  __typename?: 'ObjectPermission';
  canDestroyObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canReadObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canSoftDeleteObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  canUpdateObjectRecords?: Maybe<Scalars['Boolean']['output']>;
  objectMetadataId: Scalars['String']['output'];
};

export type ObjectPermissionInput = {
  canDestroyObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canReadObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canSoftDeleteObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdateObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  objectMetadataId: Scalars['String']['input'];
};

export type ObjectRecordFilterInput = {
  and?: InputMaybe<Array<ObjectRecordFilterInput>>;
  createdAt?: InputMaybe<DateFilter>;
  deletedAt?: InputMaybe<DateFilter>;
  id?: InputMaybe<UuidFilter>;
  not?: InputMaybe<ObjectRecordFilterInput>;
  or?: InputMaybe<Array<ObjectRecordFilterInput>>;
  updatedAt?: InputMaybe<DateFilter>;
};

export type ObjectStandardOverrides = {
  __typename?: 'ObjectStandardOverrides';
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  labelPlural?: Maybe<Scalars['String']['output']>;
  labelSingular?: Maybe<Scalars['String']['output']>;
  translations?: Maybe<Scalars['JSON']['output']>;
};

export type OnDbEventDto = {
  __typename?: 'OnDbEventDTO';
  action: DatabaseEventAction;
  eventDate: Scalars['DateTime']['output'];
  objectNameSingular: Scalars['String']['output'];
  record: Scalars['JSON']['output'];
  updatedFields?: Maybe<Array<Scalars['String']['output']>>;
};

export type OnDbEventInput = {
  action?: InputMaybe<DatabaseEventAction>;
  objectNameSingular?: InputMaybe<Scalars['String']['input']>;
  recordId?: InputMaybe<Scalars['String']['input']>;
};

/** Onboarding status */
export enum OnboardingStatus {
  BOOK_ONBOARDING = 'BOOK_ONBOARDING',
  COMPLETED = 'COMPLETED',
  INVITE_TEAM = 'INVITE_TEAM',
  PLAN_REQUIRED = 'PLAN_REQUIRED',
  PROFILE_CREATION = 'PROFILE_CREATION',
  SYNC_EMAIL = 'SYNC_EMAIL',
  WORKSPACE_ACTIVATION = 'WORKSPACE_ACTIVATION'
}

export type OnboardingStepSuccess = {
  __typename?: 'OnboardingStepSuccess';
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean']['output'];
};

export type PabxCompanyCreationDetailsInput = {
  acao_limite_espaco: Scalars['Int']['input'];
  aviso_disco_email_alerta?: InputMaybe<Scalars['Int']['input']>;
  aviso_disco_email_urgente?: InputMaybe<Scalars['Int']['input']>;
  bairro?: InputMaybe<Scalars['String']['input']>;
  cel?: InputMaybe<Scalars['String']['input']>;
  cep?: InputMaybe<Scalars['String']['input']>;
  cidade?: InputMaybe<Scalars['String']['input']>;
  cliente_bloqueado?: InputMaybe<Scalars['Int']['input']>;
  cnpj?: InputMaybe<Scalars['String']['input']>;
  compl?: InputMaybe<Scalars['String']['input']>;
  cortar_prefixo_ramal?: InputMaybe<Scalars['Int']['input']>;
  dias_aviso_remocao_mailings?: InputMaybe<Scalars['Int']['input']>;
  dias_remocao_mailings?: InputMaybe<Scalars['Int']['input']>;
  email_cliente?: InputMaybe<Scalars['String']['input']>;
  end?: InputMaybe<Scalars['String']['input']>;
  espaco_disco?: InputMaybe<Scalars['Int']['input']>;
  estado?: InputMaybe<Scalars['String']['input']>;
  faixa_max?: InputMaybe<Scalars['Int']['input']>;
  faixa_min?: InputMaybe<Scalars['Int']['input']>;
  forma_arredondamento?: InputMaybe<Scalars['Int']['input']>;
  formato_numeros_contatos?: InputMaybe<Scalars['Int']['input']>;
  habilita_prefixo_sainte?: InputMaybe<Scalars['Int']['input']>;
  habilitar_aviso_disco_email?: InputMaybe<Scalars['Int']['input']>;
  login: Scalars['String']['input'];
  max_chamadas_simultaneas?: InputMaybe<Scalars['Int']['input']>;
  modulos?: InputMaybe<Scalars['String']['input']>;
  nome: Scalars['String']['input'];
  prefixo?: InputMaybe<Scalars['String']['input']>;
  prefixo_sainte?: InputMaybe<Scalars['Int']['input']>;
  qtd_ramais_max_pa: Scalars['Int']['input'];
  qtd_ramais_max_pabx: Scalars['Int']['input'];
  ramal_resp?: InputMaybe<Scalars['String']['input']>;
  razao_social?: InputMaybe<Scalars['String']['input']>;
  remover_mailings?: InputMaybe<Scalars['Int']['input']>;
  resp?: InputMaybe<Scalars['String']['input']>;
  salas_conf_num_max: Scalars['Int']['input'];
  senha: Scalars['String']['input'];
  tel?: InputMaybe<Scalars['String']['input']>;
  tipo: Scalars['Int']['input'];
  usuario_padrao_id?: InputMaybe<Scalars['Int']['input']>;
};

export type PabxCompanyResponseType = {
  __typename?: 'PabxCompanyResponseType';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type PabxDialingPlanCreationDetailsInput = {
  nome: Scalars['String']['input'];
  plano_discagem_id: Scalars['Int']['input'];
};

export type PabxDialingPlanResponseType = {
  __typename?: 'PabxDialingPlanResponseType';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type PabxTrunkCreationDetailsInput = {
  autentica_user_pass?: InputMaybe<Scalars['Int']['input']>;
  endereco: Scalars['String']['input'];
  host_dinamico?: InputMaybe<Scalars['Int']['input']>;
  insere_digitos?: InputMaybe<Scalars['String']['input']>;
  nome: Scalars['String']['input'];
  qtd_digitos_cortados?: InputMaybe<Scalars['Int']['input']>;
  senha?: InputMaybe<Scalars['String']['input']>;
  tarifas?: InputMaybe<Array<TarifaTroncoInput>>;
  tronco_id: Scalars['Int']['input'];
  usuario?: InputMaybe<Scalars['String']['input']>;
};

export type PabxTrunkResponseType = {
  __typename?: 'PabxTrunkResponseType';
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  /** The cursor of the last returned record. */
  endCursor?: Maybe<Scalars['ConnectionCursor']['output']>;
  /** true if paging forward and there are more records. */
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  /** true if paging backwards and there are more records. */
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  /** The cursor of the first returned record. */
  startCursor?: Maybe<Scalars['ConnectionCursor']['output']>;
};

export enum PermissionsOnAllObjectRecords {
  DESTROY_ALL_OBJECT_RECORDS = 'DESTROY_ALL_OBJECT_RECORDS',
  READ_ALL_OBJECT_RECORDS = 'READ_ALL_OBJECT_RECORDS',
  SOFT_DELETE_ALL_OBJECT_RECORDS = 'SOFT_DELETE_ALL_OBJECT_RECORDS',
  UPDATE_ALL_OBJECT_RECORDS = 'UPDATE_ALL_OBJECT_RECORDS'
}

export type Phones = {
  __typename?: 'Phones';
  additionalPhones?: Maybe<Scalars['RawJSONScalar']['output']>;
  primaryPhoneCallingCode: Scalars['String']['output'];
  primaryPhoneCountryCode: Scalars['String']['output'];
  primaryPhoneNumber: Scalars['String']['output'];
};

export type PostgresCredentials = {
  __typename?: 'PostgresCredentials';
  id: Scalars['UUID']['output'];
  password: Scalars['String']['output'];
  user: Scalars['String']['output'];
  workspaceId: Scalars['String']['output'];
};

export type PublicFeatureFlag = {
  __typename?: 'PublicFeatureFlag';
  key: FeatureFlagKey;
  metadata: PublicFeatureFlagMetadata;
};

export type PublicFeatureFlagMetadata = {
  __typename?: 'PublicFeatureFlagMetadata';
  description: Scalars['String']['output'];
  imagePath: Scalars['String']['output'];
  label: Scalars['String']['output'];
};

export type PublicWorkspaceDataOutput = {
  __typename?: 'PublicWorkspaceDataOutput';
  authProviders: AuthProviders;
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  workspaceUrls: WorkspaceUrls;
};

export type PublishServerlessFunctionInput = {
  /** The id of the function. */
  id: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  agentById: WorkspaceAgent;
  agentsByWorkspace: Array<WorkspaceAgent>;
  billingPortalSession: BillingSessionOutput;
  checkUserExists: CheckUserExistOutput;
  checkWorkspaceInviteHashIsValid: WorkspaceInviteHashValid;
  currentUser: User;
  currentWorkspace: Workspace;
  field: Field;
  fields: FieldConnection;
  findAllTelephony: Array<Telephony>;
  findDistantTablesWithStatus: Array<RemoteTable>;
  findManyAgents: Array<Agent>;
  findManyRemoteServersByType: Array<RemoteServer>;
  findManyServerlessFunctions: Array<ServerlessFunction>;
  findOneAgent: Agent;
  findOneRemoteServerById: RemoteServer;
  findOneServerlessFunction: ServerlessFunction;
  findWorkspaceFromInviteHash: Workspace;
  findWorkspaceInvitations: Array<WorkspaceInvitation>;
  getAllBillingPlans: Array<BillingPlans>;
  getAllExtensions?: Maybe<Array<TelephonyExtension>>;
  getAllStripeIntegrations: Array<StripeIntegration>;
  getApprovedAccessDomains: Array<ApprovedAccessDomain>;
  getAvailablePackages: Scalars['JSON']['output'];
  getBillingPlansById: BillingPlans;
  getChatbotFlowById: ChatbotFlow;
  getChatbots: Array<ChatbotWorkspaceEntity>;
  getConfigVariablesGrouped: ConfigVariablesOutput;
  getDashboardLinklogs: Array<LinkLogsWorkspaceEntity>;
  getDatabaseConfigVariable: ConfigVariable;
  getFocusNfeIntegrationById: FocusNfeIntegrationPublicDto;
  getFocusNfeIntegrationsByWorkspace: Array<FocusNfeIntegrationPublicDto>;
  getIndicatorHealthStatus: AdminPanelHealthServiceData;
  getInterAccountInfo: Scalars['String']['output'];
  getIssuerById: IssuerDto;
  getIssuersByWorkspace: Array<IssuerDto>;
  getMeteredProductsUsage: Array<BillingMeteredProductUsageOutput>;
  getPostgresCredentials?: Maybe<PostgresCredentials>;
  getPublicWorkspaceDataByDomain: PublicWorkspaceDataOutput;
  getQueueMetrics: QueueMetricsData;
  getRoles: Array<Role>;
  getSSOIdentityProviders: Array<FindAvailableSsoidpOutput>;
  getServerlessFunctionSourceCode?: Maybe<Scalars['JSON']['output']>;
  getStripeIntegrationById: StripeIntegration;
  getSystemHealthStatus: SystemHealth;
  getTelephonyCallFlows?: Maybe<Array<TelephonyCallFlow>>;
  getTelephonyDids?: Maybe<Array<TelephonyDids>>;
  getTelephonyPlans?: Maybe<Array<TelephonyDialingPlan>>;
  getTelephonyURAs?: Maybe<Array<Campaign>>;
  getTimelineCalendarEventsFromCompanyId: TimelineCalendarEventsWithTotal;
  getTimelineCalendarEventsFromPersonId: TimelineCalendarEventsWithTotal;
  getTimelineThreadsFromCompanyId: TimelineThreadsWithTotal;
  getTimelineThreadsFromPersonId: TimelineThreadsWithTotal;
  getUserSoftfone?: Maybe<TelephonyExtension>;
  getWhatsappTemplates: WhatsappTemplatesResponse;
  inboxesByWorkspace: Array<Inbox>;
  index: Index;
  indexMetadatas: IndexConnection;
  interIntegrationById?: Maybe<InterIntegration>;
  interIntegrationsByWorkspace: Array<InterIntegration>;
  object: Object;
  objects: ObjectConnection;
  plans: Array<BillingPlanOutput>;
  search: SearchResultConnection;
  sectorById: Sector;
  sectorsByWorkspace: Array<Sector>;
  validatePasswordResetToken: ValidatePasswordResetToken;
  versionInfo: VersionInfo;
  whatsappIntegrationById: WhatsappWorkspaceEntity;
  whatsappIntegrationsByWorkspace: Array<WhatsappWorkspaceEntity>;
};


export type QueryAgentByIdArgs = {
  agentId: Scalars['String']['input'];
};


export type QueryAgentsByWorkspaceArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryBillingPortalSessionArgs = {
  returnUrlPath?: InputMaybe<Scalars['String']['input']>;
};


export type QueryCheckUserExistsArgs = {
  captchaToken?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
};


export type QueryCheckWorkspaceInviteHashIsValidArgs = {
  inviteHash: Scalars['String']['input'];
};


export type QueryFieldArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryFieldsArgs = {
  filter?: FieldFilter;
  paging?: CursorPaging;
};


export type QueryFindAllTelephonyArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryFindDistantTablesWithStatusArgs = {
  input: FindManyRemoteTablesInput;
};


export type QueryFindManyRemoteServersByTypeArgs = {
  input: RemoteServerTypeInput;
};


export type QueryFindOneAgentArgs = {
  input: AgentIdInput;
};


export type QueryFindOneRemoteServerByIdArgs = {
  input: RemoteServerIdInput;
};


export type QueryFindOneServerlessFunctionArgs = {
  input: ServerlessFunctionIdInput;
};


export type QueryFindWorkspaceFromInviteHashArgs = {
  inviteHash: Scalars['String']['input'];
};


export type QueryGetAllBillingPlansArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryGetAllExtensionsArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryGetAllStripeIntegrationsArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryGetAvailablePackagesArgs = {
  input: ServerlessFunctionIdInput;
};


export type QueryGetBillingPlansByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetChatbotFlowByIdArgs = {
  chatbotId: Scalars['String']['input'];
};


export type QueryGetDatabaseConfigVariableArgs = {
  key: Scalars['String']['input'];
};


export type QueryGetFocusNfeIntegrationByIdArgs = {
  focusNfeIntegrationId: Scalars['String']['input'];
};


export type QueryGetFocusNfeIntegrationsByWorkspaceArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryGetIndicatorHealthStatusArgs = {
  indicatorId: HealthIndicatorId;
};


export type QueryGetInterAccountInfoArgs = {
  integrationId: Scalars['String']['input'];
};


export type QueryGetIssuerByIdArgs = {
  id: Scalars['ID']['input'];
};


export type QueryGetPublicWorkspaceDataByDomainArgs = {
  origin?: InputMaybe<Scalars['String']['input']>;
};


export type QueryGetQueueMetricsArgs = {
  queueName: Scalars['String']['input'];
  timeRange?: InputMaybe<QueueMetricsTimeRange>;
};


export type QueryGetServerlessFunctionSourceCodeArgs = {
  input: GetServerlessFunctionSourceCodeInput;
};


export type QueryGetStripeIntegrationByIdArgs = {
  id: Scalars['String']['input'];
};


export type QueryGetTelephonyCallFlowsArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryGetTelephonyDidsArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryGetTelephonyPlansArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryGetTelephonyUrAsArgs = {
  workspaceId: Scalars['ID']['input'];
};


export type QueryGetTimelineCalendarEventsFromCompanyIdArgs = {
  companyId: Scalars['UUID']['input'];
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
};


export type QueryGetTimelineCalendarEventsFromPersonIdArgs = {
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
  personId: Scalars['UUID']['input'];
};


export type QueryGetTimelineThreadsFromCompanyIdArgs = {
  companyId: Scalars['UUID']['input'];
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
};


export type QueryGetTimelineThreadsFromPersonIdArgs = {
  page: Scalars['Int']['input'];
  pageSize: Scalars['Int']['input'];
  personId: Scalars['UUID']['input'];
};


export type QueryGetUserSoftfoneArgs = {
  extNum?: InputMaybe<Scalars['String']['input']>;
  workspaceId: Scalars['ID']['input'];
};


export type QueryGetWhatsappTemplatesArgs = {
  integrationId: Scalars['String']['input'];
};


export type QueryInboxesByWorkspaceArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryIndexArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryIndexMetadatasArgs = {
  filter?: IndexFilter;
  paging?: CursorPaging;
};


export type QueryInterIntegrationByIdArgs = {
  integrationId: Scalars['String']['input'];
};


export type QueryInterIntegrationsByWorkspaceArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryObjectArgs = {
  id: Scalars['UUID']['input'];
};


export type QueryObjectsArgs = {
  filter?: ObjectFilter;
  paging?: CursorPaging;
};


export type QuerySearchArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  excludedObjectNameSingulars?: InputMaybe<Array<Scalars['String']['input']>>;
  filter?: InputMaybe<ObjectRecordFilterInput>;
  includedObjectNameSingulars?: InputMaybe<Array<Scalars['String']['input']>>;
  limit: Scalars['Int']['input'];
  searchInput: Scalars['String']['input'];
};


export type QuerySectorByIdArgs = {
  sectorId: Scalars['String']['input'];
};


export type QuerySectorsByWorkspaceArgs = {
  workspaceId: Scalars['String']['input'];
};


export type QueryValidatePasswordResetTokenArgs = {
  passwordResetToken: Scalars['String']['input'];
};


export type QueryWhatsappIntegrationByIdArgs = {
  integrationId: Scalars['String']['input'];
};

export type QueueMetricsData = {
  __typename?: 'QueueMetricsData';
  data: Array<QueueMetricsSeries>;
  details?: Maybe<WorkerQueueMetrics>;
  queueName: Scalars['String']['output'];
  timeRange: QueueMetricsTimeRange;
  workers: Scalars['Float']['output'];
};

export type QueueMetricsDataPoint = {
  __typename?: 'QueueMetricsDataPoint';
  x: Scalars['Float']['output'];
  y: Scalars['Float']['output'];
};

export type QueueMetricsSeries = {
  __typename?: 'QueueMetricsSeries';
  data: Array<QueueMetricsDataPoint>;
  id: Scalars['String']['output'];
};

export enum QueueMetricsTimeRange {
  FourHours = 'FourHours',
  OneDay = 'OneDay',
  OneHour = 'OneHour',
  SevenDays = 'SevenDays',
  TwelveHours = 'TwelveHours'
}

export type RegionInput = {
  regiao_id: Scalars['Int']['input'];
  regiao_nome: Scalars['String']['input'];
  roteamentos: Array<RoutingRuleInput>;
};

export type Relation = {
  __typename?: 'Relation';
  sourceFieldMetadata: Field;
  sourceObjectMetadata: Object;
  targetFieldMetadata: Field;
  targetObjectMetadata: Object;
  type: RelationType;
};

/** Relation type */
export enum RelationType {
  MANY_TO_ONE = 'MANY_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY'
}

export type RemoteServer = {
  __typename?: 'RemoteServer';
  createdAt: Scalars['DateTime']['output'];
  foreignDataWrapperId: Scalars['ID']['output'];
  foreignDataWrapperOptions?: Maybe<Scalars['JSON']['output']>;
  foreignDataWrapperType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  schema?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userMappingOptions?: Maybe<UserMappingOptionsUser>;
};

export type RemoteServerIdInput = {
  /** The id of the record. */
  id: Scalars['ID']['input'];
};

export type RemoteServerTypeInput = {
  foreignDataWrapperType: Scalars['String']['input'];
};

export type RemoteTable = {
  __typename?: 'RemoteTable';
  id?: Maybe<Scalars['UUID']['output']>;
  name: Scalars['String']['output'];
  schema?: Maybe<Scalars['String']['output']>;
  schemaPendingUpdates?: Maybe<Array<DistantTableUpdate>>;
  status: RemoteTableStatus;
};

export type RemoteTableInput = {
  name: Scalars['String']['input'];
  remoteServerId: Scalars['ID']['input'];
};

/** Status of the table */
export enum RemoteTableStatus {
  NOT_SYNCED = 'NOT_SYNCED',
  SYNCED = 'SYNCED'
}

export type ResendEmailVerificationTokenOutput = {
  __typename?: 'ResendEmailVerificationTokenOutput';
  success: Scalars['Boolean']['output'];
};

export type Role = {
  __typename?: 'Role';
  canDestroyAllObjectRecords: Scalars['Boolean']['output'];
  canReadAllObjectRecords: Scalars['Boolean']['output'];
  canSoftDeleteAllObjectRecords: Scalars['Boolean']['output'];
  canUpdateAllObjectRecords: Scalars['Boolean']['output'];
  canUpdateAllSettings: Scalars['Boolean']['output'];
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  isEditable: Scalars['Boolean']['output'];
  label: Scalars['String']['output'];
  objectPermissions?: Maybe<Array<ObjectPermission>>;
  settingPermissions?: Maybe<Array<SettingPermission>>;
  workspaceMembers: Array<WorkspaceMember>;
};

export type RoutingRuleInput = {
  prioridade: Scalars['Int']['input'];
  tronco_id?: InputMaybe<Scalars['Int']['input']>;
  tronco_nome: Scalars['String']['input'];
};

export type RunWorkflowVersionInput = {
  /** Execution result in JSON format */
  payload?: InputMaybe<Scalars['JSON']['input']>;
  /** Workflow run ID */
  workflowRunId?: InputMaybe<Scalars['String']['input']>;
  /** Workflow version ID */
  workflowVersionId: Scalars['String']['input'];
};

export type SsoConnection = {
  __typename?: 'SSOConnection';
  id: Scalars['String']['output'];
  issuer: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export type SsoIdentityProvider = {
  __typename?: 'SSOIdentityProvider';
  id: Scalars['String']['output'];
  issuer: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export enum SsoIdentityProviderStatus {
  Active = 'Active',
  Error = 'Error',
  Inactive = 'Inactive'
}

export type SearchRecord = {
  __typename?: 'SearchRecord';
  imageUrl?: Maybe<Scalars['String']['output']>;
  label: Scalars['String']['output'];
  objectNameSingular: Scalars['String']['output'];
  recordId: Scalars['String']['output'];
  tsRank: Scalars['Float']['output'];
  tsRankCD: Scalars['Float']['output'];
};

export type SearchResultConnection = {
  __typename?: 'SearchResultConnection';
  edges: Array<SearchResultEdge>;
  pageInfo: SearchResultPageInfo;
};

export type SearchResultEdge = {
  __typename?: 'SearchResultEdge';
  cursor: Scalars['String']['output'];
  node: SearchRecord;
};

export type SearchResultPageInfo = {
  __typename?: 'SearchResultPageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type Sector = {
  __typename?: 'Sector';
  agents: Array<WorkspaceAgent>;
  createdAt: Scalars['DateTime']['output'];
  icon: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  topics?: Maybe<Array<Scalars['JSON']['output']>>;
  updatedAt: Scalars['DateTime']['output'];
  workspace: Workspace;
};

export type SendEventMessageInput = {
  agent?: InputMaybe<MessageAgent>;
  eventStatus: Scalars['String']['input'];
  from: Scalars['String']['input'];
  integrationId: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  sector?: InputMaybe<MessageSector>;
  status: Scalars['String']['input'];
  to: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type SendInvitationsOutput = {
  __typename?: 'SendInvitationsOutput';
  errors: Array<Scalars['String']['output']>;
  result: Array<WorkspaceInvitation>;
  /** Boolean that confirms query was dispatched */
  success: Scalars['Boolean']['output'];
};

export type SendMessageInput = {
  fileId?: InputMaybe<Scalars['String']['input']>;
  from: Scalars['String']['input'];
  integrationId: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
  to: Scalars['String']['input'];
  type: Scalars['String']['input'];
};

export type SendTemplateInput = {
  agent?: InputMaybe<MessageAgent>;
  from: Scalars['String']['input'];
  integrationId: Scalars['String']['input'];
  language: Scalars['String']['input'];
  message: Scalars['String']['input'];
  templateName: Scalars['String']['input'];
  to: Scalars['String']['input'];
};

export type Sentry = {
  __typename?: 'Sentry';
  dsn?: Maybe<Scalars['String']['output']>;
  environment?: Maybe<Scalars['String']['output']>;
  release?: Maybe<Scalars['String']['output']>;
};

export type ServerlessFunction = {
  __typename?: 'ServerlessFunction';
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  latestVersion?: Maybe<Scalars['String']['output']>;
  latestVersionInputSchema?: Maybe<Scalars['JSON']['output']>;
  name: Scalars['String']['output'];
  publishedVersions: Array<Scalars['String']['output']>;
  runtime: Scalars['String']['output'];
  timeoutSeconds: Scalars['Float']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type ServerlessFunctionExecutionResult = {
  __typename?: 'ServerlessFunctionExecutionResult';
  /** Execution result in JSON format */
  data?: Maybe<Scalars['JSON']['output']>;
  /** Execution duration in milliseconds */
  duration: Scalars['Float']['output'];
  /** Execution error in JSON format */
  error?: Maybe<Scalars['JSON']['output']>;
  /** Execution Logs */
  logs: Scalars['String']['output'];
  /** Execution status */
  status: ServerlessFunctionExecutionStatus;
};

/** Status of the serverless function execution */
export enum ServerlessFunctionExecutionStatus {
  ERROR = 'ERROR',
  IDLE = 'IDLE',
  SUCCESS = 'SUCCESS'
}

export type ServerlessFunctionIdInput = {
  /** The id of the function. */
  id: Scalars['ID']['input'];
};

export type SettingPermission = {
  __typename?: 'SettingPermission';
  id: Scalars['String']['output'];
  roleId: Scalars['String']['output'];
  setting: SettingPermissionType;
};

export enum SettingPermissionType {
  ADMIN_PANEL = 'ADMIN_PANEL',
  API_KEYS_AND_WEBHOOKS = 'API_KEYS_AND_WEBHOOKS',
  DATA_MODEL = 'DATA_MODEL',
  ROLES = 'ROLES',
  SECURITY = 'SECURITY',
  WORKFLOWS = 'WORKFLOWS',
  WORKSPACE = 'WORKSPACE',
  WORKSPACE_MEMBERS = 'WORKSPACE_MEMBERS'
}

export type SetupOidcSsoInput = {
  clientID: Scalars['String']['input'];
  clientSecret: Scalars['String']['input'];
  issuer: Scalars['String']['input'];
  name: Scalars['String']['input'];
};

export type SetupPabxEnvironmentInput = {
  companyDetails: PabxCompanyCreationDetailsInput;
  dialingPlanDetails: PabxDialingPlanCreationDetailsInput;
  routingRulesData: UpdateRoutingRulesDataInput;
  trunkDetails: PabxTrunkCreationDetailsInput;
  workspaceId: Scalars['ID']['input'];
};

export type SetupPabxEnvironmentResponseType = {
  __typename?: 'SetupPabxEnvironmentResponseType';
  companyId?: Maybe<Scalars['ID']['output']>;
  dialingPlanId?: Maybe<Scalars['ID']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  success: Scalars['Boolean']['output'];
  trunkId?: Maybe<Scalars['ID']['output']>;
};

export type SetupSamlSsoInput = {
  certificate: Scalars['String']['input'];
  fingerprint?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  issuer: Scalars['String']['input'];
  name: Scalars['String']['input'];
  ssoURL: Scalars['String']['input'];
};

export type SetupSsoOutput = {
  __typename?: 'SetupSsoOutput';
  id: Scalars['String']['output'];
  issuer: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: SsoIdentityProviderStatus;
  type: IdentityProviderType;
};

export type SignUpOutput = {
  __typename?: 'SignUpOutput';
  loginToken: AuthToken;
  workspace: WorkspaceUrlsAndId;
};

export type SignedFileDto = {
  __typename?: 'SignedFileDTO';
  path: Scalars['String']['output'];
  token: Scalars['String']['output'];
};

export type StandardOverrides = {
  __typename?: 'StandardOverrides';
  description?: Maybe<Scalars['String']['output']>;
  icon?: Maybe<Scalars['String']['output']>;
  label?: Maybe<Scalars['String']['output']>;
  translations?: Maybe<Scalars['JSON']['output']>;
};

export type StripeIntegration = {
  __typename?: 'StripeIntegration';
  accountId: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  workspace: Workspace;
};

export type SubmitFormStepInput = {
  /** Form response in JSON format */
  response: Scalars['JSON']['input'];
  /** Workflow version ID */
  stepId: Scalars['String']['input'];
  /** Workflow run ID */
  workflowRunId: Scalars['String']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  onDbEvent: OnDbEventDto;
};


export type SubscriptionOnDbEventArgs = {
  input: OnDbEventInput;
};

export enum SubscriptionInterval {
  Day = 'Day',
  Month = 'Month',
  Week = 'Week',
  Year = 'Year'
}

export enum SubscriptionStatus {
  Active = 'Active',
  Canceled = 'Canceled',
  Expired = 'Expired',
  Incomplete = 'Incomplete',
  IncompleteExpired = 'IncompleteExpired',
  PastDue = 'PastDue',
  Paused = 'Paused',
  Trialing = 'Trialing',
  Unpaid = 'Unpaid'
}

export type Support = {
  __typename?: 'Support';
  supportDriver: SupportDriver;
  supportFrontChatId?: Maybe<Scalars['String']['output']>;
};

export enum SupportDriver {
  FRONT = 'FRONT',
  NONE = 'NONE'
}

export type SystemHealth = {
  __typename?: 'SystemHealth';
  services: Array<SystemHealthService>;
};

export type SystemHealthService = {
  __typename?: 'SystemHealthService';
  id: HealthIndicatorId;
  label: Scalars['String']['output'];
  status: AdminPanelHealthServiceStatus;
};

export type TarifaTroncoInput = {
  fracionamento: Scalars['String']['input'];
  regiao_id: Scalars['Int']['input'];
  tarifa: Scalars['Int']['input'];
};

export type Telephony = {
  __typename?: 'Telephony';
  SIPPassword?: Maybe<Scalars['String']['output']>;
  advancedFowarding1?: Maybe<Scalars['String']['output']>;
  advancedFowarding1Value?: Maybe<Scalars['String']['output']>;
  advancedFowarding2?: Maybe<Scalars['String']['output']>;
  advancedFowarding2Value?: Maybe<Scalars['String']['output']>;
  advancedFowarding3?: Maybe<Scalars['String']['output']>;
  advancedFowarding3Value?: Maybe<Scalars['String']['output']>;
  advancedFowarding4?: Maybe<Scalars['String']['output']>;
  advancedFowarding4Value?: Maybe<Scalars['String']['output']>;
  advancedFowarding5?: Maybe<Scalars['String']['output']>;
  advancedFowarding5Value?: Maybe<Scalars['String']['output']>;
  areaCode?: Maybe<Scalars['String']['output']>;
  blockExtension?: Maybe<Scalars['Boolean']['output']>;
  callerExternalID?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  destinyMailboxAllCallsOrOffline?: Maybe<Scalars['String']['output']>;
  destinyMailboxBusy?: Maybe<Scalars['String']['output']>;
  dialingPlan?: Maybe<Scalars['String']['output']>;
  emailForMailbox?: Maybe<Scalars['String']['output']>;
  enableMailbox?: Maybe<Scalars['Boolean']['output']>;
  extensionAllCallsOrOffline?: Maybe<Scalars['String']['output']>;
  extensionBusy?: Maybe<Scalars['String']['output']>;
  extensionGroup?: Maybe<Scalars['String']['output']>;
  extensionName?: Maybe<Scalars['String']['output']>;
  externalNumberAllCallsOrOffline?: Maybe<Scalars['String']['output']>;
  externalNumberBusy?: Maybe<Scalars['String']['output']>;
  fowardAllCalls?: Maybe<Scalars['String']['output']>;
  fowardBusyNotAvailable?: Maybe<Scalars['String']['output']>;
  fowardOfflineWithoutService?: Maybe<Scalars['String']['output']>;
  id: Scalars['UUID']['output'];
  listenToCalls?: Maybe<Scalars['Boolean']['output']>;
  memberId: Scalars['String']['output'];
  numberExtension: Scalars['String']['output'];
  pullCalls?: Maybe<Scalars['String']['output']>;
  ramal_id?: Maybe<Scalars['String']['output']>;
  recordCalls?: Maybe<Scalars['Boolean']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  workspace: Workspace;
};

export type TelephonyCallFlow = {
  __typename?: 'TelephonyCallFlow';
  fluxo_chamada_id?: Maybe<Scalars['ID']['output']>;
  fluxo_chamada_nome?: Maybe<Scalars['String']['output']>;
};

export type TelephonyDialingPlan = {
  __typename?: 'TelephonyDialingPlan';
  cliente_id?: Maybe<Scalars['String']['output']>;
  nome?: Maybe<Scalars['String']['output']>;
  plano_discagem_id?: Maybe<Scalars['ID']['output']>;
};

export type TelephonyDids = {
  __typename?: 'TelephonyDids';
  apontar_para?: Maybe<Scalars['String']['output']>;
  cliente_id?: Maybe<Scalars['String']['output']>;
  destino?: Maybe<Scalars['String']['output']>;
  did_id?: Maybe<Scalars['ID']['output']>;
  gravar_chamadas?: Maybe<Scalars['String']['output']>;
  habilitar_horario_funcionamento?: Maybe<Scalars['String']['output']>;
  habilitar_registro?: Maybe<Scalars['String']['output']>;
  horario_funcionamento_dias_semana?: Maybe<Array<Scalars['String']['output']>>;
  horario_funcionamento_fim?: Maybe<Scalars['String']['output']>;
  horario_funcionamento_inicio?: Maybe<Scalars['String']['output']>;
  horario_funcionamento_lista_feriados?: Maybe<Array<Scalars['String']['output']>>;
  maximo_chamadas_simultaneas?: Maybe<Scalars['String']['output']>;
  numero?: Maybe<Scalars['String']['output']>;
  registro_dominio?: Maybe<Scalars['String']['output']>;
  registro_senha?: Maybe<Scalars['String']['output']>;
  registro_usuario?: Maybe<Scalars['String']['output']>;
};

export type TelephonyExtension = {
  __typename?: 'TelephonyExtension';
  bloquear_ramal?: Maybe<Scalars['String']['output']>;
  caller_id_externo?: Maybe<Scalars['String']['output']>;
  centro_custo?: Maybe<Scalars['String']['output']>;
  cliente_id?: Maybe<Scalars['String']['output']>;
  codigo_area?: Maybe<Scalars['String']['output']>;
  codigo_incorporacao?: Maybe<Scalars['String']['output']>;
  dupla_autenticacao_ip_permitido?: Maybe<Scalars['String']['output']>;
  dupla_autenticacao_mascara?: Maybe<Scalars['String']['output']>;
  encaminhar_ocupado_indisponivel?: Maybe<Encaminhamento>;
  encaminhar_offline_sem_atendimento?: Maybe<Encaminhamento>;
  encaminhar_todas_chamadas?: Maybe<Encaminhamento>;
  escutar_chamadas?: Maybe<Scalars['String']['output']>;
  gravar_chamadas?: Maybe<Scalars['String']['output']>;
  grupo_musica_espera?: Maybe<Scalars['String']['output']>;
  grupo_ramais?: Maybe<Scalars['String']['output']>;
  habilitar_blf?: Maybe<Scalars['String']['output']>;
  habilitar_dupla_autenticacao?: Maybe<Scalars['String']['output']>;
  habilitar_timers?: Maybe<Scalars['String']['output']>;
  nome?: Maybe<Scalars['String']['output']>;
  numero?: Maybe<Scalars['String']['output']>;
  plano_discagem_id?: Maybe<Scalars['String']['output']>;
  puxar_chamadas?: Maybe<Scalars['String']['output']>;
  ramal_id?: Maybe<Scalars['ID']['output']>;
  senha_sip?: Maybe<Scalars['String']['output']>;
  senha_web?: Maybe<Scalars['String']['output']>;
  tipo?: Maybe<Scalars['String']['output']>;
  usuario_autenticacao?: Maybe<Scalars['String']['output']>;
};

export type Template = {
  __typename?: 'Template';
  category: Scalars['String']['output'];
  components: Array<Component>;
  id: Scalars['String']['output'];
  language: Scalars['String']['output'];
  name: Scalars['String']['output'];
  parameter_format: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type TimelineCalendarEvent = {
  __typename?: 'TimelineCalendarEvent';
  conferenceLink: LinksMetadata;
  conferenceSolution: Scalars['String']['output'];
  description: Scalars['String']['output'];
  endsAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  isCanceled: Scalars['Boolean']['output'];
  isFullDay: Scalars['Boolean']['output'];
  location: Scalars['String']['output'];
  participants: Array<TimelineCalendarEventParticipant>;
  startsAt: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
  visibility: CalendarChannelVisibility;
};

export type TimelineCalendarEventParticipant = {
  __typename?: 'TimelineCalendarEventParticipant';
  avatarUrl: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  handle: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  personId?: Maybe<Scalars['UUID']['output']>;
  workspaceMemberId?: Maybe<Scalars['UUID']['output']>;
};

export type TimelineCalendarEventsWithTotal = {
  __typename?: 'TimelineCalendarEventsWithTotal';
  timelineCalendarEvents: Array<TimelineCalendarEvent>;
  totalNumberOfCalendarEvents: Scalars['Int']['output'];
};

export type TimelineThread = {
  __typename?: 'TimelineThread';
  firstParticipant: TimelineThreadParticipant;
  id: Scalars['UUID']['output'];
  lastMessageBody: Scalars['String']['output'];
  lastMessageReceivedAt: Scalars['DateTime']['output'];
  lastTwoParticipants: Array<TimelineThreadParticipant>;
  numberOfMessagesInThread: Scalars['Float']['output'];
  participantCount: Scalars['Float']['output'];
  read: Scalars['Boolean']['output'];
  subject: Scalars['String']['output'];
  visibility: MessageChannelVisibility;
};

export type TimelineThreadParticipant = {
  __typename?: 'TimelineThreadParticipant';
  avatarUrl: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  handle: Scalars['String']['output'];
  lastName: Scalars['String']['output'];
  personId?: Maybe<Scalars['UUID']['output']>;
  workspaceMemberId?: Maybe<Scalars['UUID']['output']>;
};

export type TimelineThreadsWithTotal = {
  __typename?: 'TimelineThreadsWithTotal';
  timelineThreads: Array<TimelineThread>;
  totalNumberOfThreads: Scalars['Int']['output'];
};

export type TransientToken = {
  __typename?: 'TransientToken';
  transientToken: AuthToken;
};

export type UuidFilter = {
  eq?: InputMaybe<Scalars['UUID']['input']>;
  gt?: InputMaybe<Scalars['UUID']['input']>;
  gte?: InputMaybe<Scalars['UUID']['input']>;
  in?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<FilterIs>;
  lt?: InputMaybe<Scalars['UUID']['input']>;
  lte?: InputMaybe<Scalars['UUID']['input']>;
  neq?: InputMaybe<Scalars['UUID']['input']>;
};

export type UuidFilterComparison = {
  eq?: InputMaybe<Scalars['UUID']['input']>;
  gt?: InputMaybe<Scalars['UUID']['input']>;
  gte?: InputMaybe<Scalars['UUID']['input']>;
  iLike?: InputMaybe<Scalars['UUID']['input']>;
  in?: InputMaybe<Array<Scalars['UUID']['input']>>;
  is?: InputMaybe<Scalars['Boolean']['input']>;
  isNot?: InputMaybe<Scalars['Boolean']['input']>;
  like?: InputMaybe<Scalars['UUID']['input']>;
  lt?: InputMaybe<Scalars['UUID']['input']>;
  lte?: InputMaybe<Scalars['UUID']['input']>;
  neq?: InputMaybe<Scalars['UUID']['input']>;
  notILike?: InputMaybe<Scalars['UUID']['input']>;
  notIn?: InputMaybe<Array<Scalars['UUID']['input']>>;
  notLike?: InputMaybe<Scalars['UUID']['input']>;
};

export type UpdateAgentInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['UUID']['input'];
  modelId: Scalars['String']['input'];
  name: Scalars['String']['input'];
  prompt: Scalars['String']['input'];
  responseFormat?: InputMaybe<Scalars['JSON']['input']>;
};

export type UpdateBillingPlansInput = {
  id: Scalars['String']['input'];
  planId?: InputMaybe<Scalars['String']['input']>;
  planPrice?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateChatbotFlowInput = {
  chatbotId: Scalars['String']['input'];
  edges: Scalars['JSON']['input'];
  nodes: Scalars['JSON']['input'];
  viewport?: InputMaybe<Scalars['JSON']['input']>;
};

export type UpdateFieldInput = {
  defaultValue?: InputMaybe<Scalars['JSON']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']['input']>;
  isNullable?: InputMaybe<Scalars['Boolean']['input']>;
  isSystem?: InputMaybe<Scalars['Boolean']['input']>;
  isUnique?: InputMaybe<Scalars['Boolean']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  options?: InputMaybe<Scalars['JSON']['input']>;
  settings?: InputMaybe<Scalars['JSON']['input']>;
};

export type UpdateFocusNfeIntegrationInput = {
  id: Scalars['String']['input'];
  integrationName?: InputMaybe<Scalars['String']['input']>;
  status?: Scalars['String']['input'];
  token?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateInterIntegrationInput = {
  certificate?: InputMaybe<Scalars['String']['input']>;
  clientId?: InputMaybe<Scalars['String']['input']>;
  clientSecret?: InputMaybe<Scalars['String']['input']>;
  expirationDate?: InputMaybe<Scalars['DateTime']['input']>;
  id: Scalars['String']['input'];
  integrationName?: InputMaybe<Scalars['String']['input']>;
  privateKey?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateIssuerInput = {
  cep?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  cnaeCode?: InputMaybe<Scalars['String']['input']>;
  cnpj?: InputMaybe<Scalars['String']['input']>;
  cpf?: InputMaybe<Scalars['String']['input']>;
  ie?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  neighborhood?: InputMaybe<Scalars['String']['input']>;
  number?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  taxRegime?: InputMaybe<Scalars['String']['input']>;
  workspaceId?: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateLabPublicFeatureFlagInput = {
  publicFeatureFlag: Scalars['String']['input'];
  value: Scalars['Boolean']['input'];
};

export type UpdateObjectPayload = {
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  imageIdentifierFieldMetadataId?: InputMaybe<Scalars['String']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isLabelSyncedWithName?: InputMaybe<Scalars['Boolean']['input']>;
  labelIdentifierFieldMetadataId?: InputMaybe<Scalars['String']['input']>;
  labelPlural?: InputMaybe<Scalars['String']['input']>;
  labelSingular?: InputMaybe<Scalars['String']['input']>;
  namePlural?: InputMaybe<Scalars['String']['input']>;
  nameSingular?: InputMaybe<Scalars['String']['input']>;
  shortcut?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOneFieldMetadataInput = {
  /** The id of the record to update */
  id: Scalars['UUID']['input'];
  /** The record to update */
  update: UpdateFieldInput;
};

export type UpdateOneObjectInput = {
  /** The id of the object to update */
  id: Scalars['UUID']['input'];
  update: UpdateObjectPayload;
};

export type UpdateRemoteServerInput = {
  foreignDataWrapperOptions?: InputMaybe<Scalars['JSON']['input']>;
  id: Scalars['String']['input'];
  label?: InputMaybe<Scalars['String']['input']>;
  schema?: InputMaybe<Scalars['String']['input']>;
  userMappingOptions?: InputMaybe<UserMappingOptionsUpdateInput>;
};

export type UpdateRoleInput = {
  /** The id of the role to update */
  id: Scalars['UUID']['input'];
  update: UpdateRolePayload;
};

export type UpdateRolePayload = {
  canDestroyAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canReadAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canSoftDeleteAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdateAllObjectRecords?: InputMaybe<Scalars['Boolean']['input']>;
  canUpdateAllSettings?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  icon?: InputMaybe<Scalars['String']['input']>;
  label?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateRoutingRulesDataInput = {
  regioes: Array<RegionInput>;
};

export type UpdateRoutingRulesInput = {
  cliente_id: Scalars['Int']['input'];
  dados: UpdateRoutingRulesDataInput;
  plano_discagem_id: Scalars['Int']['input'];
};

export type UpdateRoutingRulesResponseType = {
  __typename?: 'UpdateRoutingRulesResponseType';
  message: Scalars['String']['output'];
  success: Scalars['Boolean']['output'];
};

export type UpdateSectorInput = {
  icon?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  topics?: InputMaybe<Array<Scalars['JSON']['input']>>;
};

export type UpdateServerlessFunctionInput = {
  code: Scalars['JSON']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  /** Id of the serverless function to execute */
  id: Scalars['UUID']['input'];
  name: Scalars['String']['input'];
  timeoutSeconds?: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateStripeIntegrationInput = {
  accountId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
};

export type UpdateTelephonyInput = {
  SIPPassword?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding1?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding1Value?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding2?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding2Value?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding3?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding3Value?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding4?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding4Value?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding5?: InputMaybe<Scalars['String']['input']>;
  advancedFowarding5Value?: InputMaybe<Scalars['String']['input']>;
  areaCode?: InputMaybe<Scalars['String']['input']>;
  blockExtension?: InputMaybe<Scalars['Boolean']['input']>;
  callerExternalID?: InputMaybe<Scalars['String']['input']>;
  destinyMailboxAllCallsOrOffline?: InputMaybe<Scalars['String']['input']>;
  destinyMailboxBusy?: InputMaybe<Scalars['String']['input']>;
  dialingPlan?: InputMaybe<Scalars['String']['input']>;
  emailForMailbox?: InputMaybe<Scalars['String']['input']>;
  enableMailbox?: InputMaybe<Scalars['Boolean']['input']>;
  extensionAllCallsOrOffline?: InputMaybe<Scalars['String']['input']>;
  extensionBusy?: InputMaybe<Scalars['String']['input']>;
  extensionGroup?: InputMaybe<Scalars['String']['input']>;
  extensionName?: InputMaybe<Scalars['String']['input']>;
  externalNumberAllCallsOrOffline?: InputMaybe<Scalars['String']['input']>;
  externalNumberBusy?: InputMaybe<Scalars['String']['input']>;
  fowardAllCalls?: InputMaybe<Scalars['String']['input']>;
  fowardBusyNotAvailable?: InputMaybe<Scalars['String']['input']>;
  fowardOfflineWithoutService?: InputMaybe<Scalars['String']['input']>;
  listenToCalls?: InputMaybe<Scalars['Boolean']['input']>;
  memberId?: InputMaybe<Scalars['ID']['input']>;
  numberExtension: Scalars['ID']['input'];
  pullCalls?: InputMaybe<Scalars['String']['input']>;
  ramal_id?: InputMaybe<Scalars['String']['input']>;
  recordCalls?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWhatsappIntegrationInput = {
  accessToken?: InputMaybe<Scalars['String']['input']>;
  appId?: InputMaybe<Scalars['String']['input']>;
  appKey?: InputMaybe<Scalars['String']['input']>;
  businessAccountId?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  phoneId?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateWorkflowRunStepInput = {
  /** Step to update in JSON format */
  step: Scalars['JSON']['input'];
  /** Workflow run ID */
  workflowRunId: Scalars['String']['input'];
};

export type UpdateWorkflowVersionStepInput = {
  /** Step to update in JSON format */
  step: Scalars['JSON']['input'];
  /** Workflow version ID */
  workflowVersionId: Scalars['String']['input'];
};

export type UpdateWorkspaceAgentInput = {
  id: Scalars['String']['input'];
  inboxesIds: Array<Scalars['String']['input']>;
  isAdmin: Scalars['Boolean']['input'];
  memberId: Scalars['ID']['input'];
  sectorIds: Array<Scalars['String']['input']>;
};

export type UpdateWorkspaceInput = {
  allowImpersonation?: InputMaybe<Scalars['Boolean']['input']>;
  customDomain?: InputMaybe<Scalars['String']['input']>;
  defaultRoleId?: InputMaybe<Scalars['String']['input']>;
  displayName?: InputMaybe<Scalars['String']['input']>;
  inviteHash?: InputMaybe<Scalars['String']['input']>;
  isGoogleAuthEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isMicrosoftAuthEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isPasswordAuthEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  isPublicInviteLinkEnabled?: InputMaybe<Scalars['Boolean']['input']>;
  logo?: InputMaybe<Scalars['String']['input']>;
  onesignalApiKey?: InputMaybe<Scalars['String']['input']>;
  onesignalAppId?: InputMaybe<Scalars['String']['input']>;
  subdomain?: InputMaybe<Scalars['String']['input']>;
};

export type UpsertObjectPermissionsInput = {
  objectPermissions: Array<ObjectPermissionInput>;
  roleId: Scalars['String']['input'];
};

export type UpsertSettingPermissionsInput = {
  roleId: Scalars['String']['input'];
  settingPermissionKeys: Array<SettingPermissionType>;
};

export type User = {
  __typename?: 'User';
  availableWorkspaces: AvailableWorkspaces;
  canAccessFullAdminPanel: Scalars['Boolean']['output'];
  canImpersonate: Scalars['Boolean']['output'];
  createdAt: Scalars['DateTime']['output'];
  currentUserWorkspace?: Maybe<UserWorkspace>;
  currentWorkspace?: Maybe<Workspace>;
  defaultAvatarUrl?: Maybe<Scalars['String']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedWorkspaceMembers?: Maybe<Array<DeletedWorkspaceMember>>;
  disabled?: Maybe<Scalars['Boolean']['output']>;
  email: Scalars['String']['output'];
  firstName: Scalars['String']['output'];
  id: Scalars['UUID']['output'];
  isEmailVerified: Scalars['Boolean']['output'];
  lastName: Scalars['String']['output'];
  locale: Scalars['String']['output'];
  onboardingStatus?: Maybe<OnboardingStatus>;
  passwordHash?: Maybe<Scalars['String']['output']>;
  supportUserHash?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  userVars?: Maybe<Scalars['JSONObject']['output']>;
  workspaceMember?: Maybe<WorkspaceMember>;
  workspaceMembers?: Maybe<Array<WorkspaceMember>>;
  workspaces: Array<UserWorkspace>;
};

export type UserEdge = {
  __typename?: 'UserEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the User */
  node: User;
};

export type UserInfo = {
  __typename?: 'UserInfo';
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
};

export type UserLookup = {
  __typename?: 'UserLookup';
  user: UserInfo;
  workspaces: Array<WorkspaceInfo>;
};

export type UserMappingOptions = {
  password?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Scalars['String']['input']>;
};

export type UserMappingOptionsUpdateInput = {
  password?: InputMaybe<Scalars['String']['input']>;
  user?: InputMaybe<Scalars['String']['input']>;
};

export type UserMappingOptionsUser = {
  __typename?: 'UserMappingOptionsUser';
  user?: Maybe<Scalars['String']['output']>;
};

export type UserWorkspace = {
  __typename?: 'UserWorkspace';
  createdAt: Scalars['DateTime']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['UUID']['output'];
  objectPermissions?: Maybe<Array<ObjectPermission>>;
  /** @deprecated Use objectPermissions instead */
  objectRecordsPermissions?: Maybe<Array<PermissionsOnAllObjectRecords>>;
  settingsPermissions?: Maybe<Array<SettingPermissionType>>;
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['String']['output'];
  workspace?: Maybe<Workspace>;
  workspaceId: Scalars['String']['output'];
};

export type ValidateApprovedAccessDomainInput = {
  approvedAccessDomainId: Scalars['String']['input'];
  validationToken: Scalars['String']['input'];
};

export type ValidatePasswordResetToken = {
  __typename?: 'ValidatePasswordResetToken';
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
};

export type VersionInfo = {
  __typename?: 'VersionInfo';
  currentVersion?: Maybe<Scalars['String']['output']>;
  latestVersion: Scalars['String']['output'];
};

export type WhatsappTemplatesResponse = {
  __typename?: 'WhatsappTemplatesResponse';
  templates: Array<Template>;
};

export type WhatsappWorkspaceEntity = {
  __typename?: 'WhatsappWorkspaceEntity';
  accessToken: Scalars['String']['output'];
  appId: Scalars['String']['output'];
  appKey: Scalars['String']['output'];
  businessAccountId: Scalars['String']['output'];
  chatbot?: Maybe<ChatbotWorkspaceEntity>;
  disabled: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  phoneId: Scalars['String']['output'];
  sla: Scalars['Float']['output'];
  verifyToken: Scalars['String']['output'];
};

export type WorkerQueueMetrics = {
  __typename?: 'WorkerQueueMetrics';
  active: Scalars['Float']['output'];
  completed: Scalars['Float']['output'];
  completedData?: Maybe<Array<Scalars['Float']['output']>>;
  delayed: Scalars['Float']['output'];
  failed: Scalars['Float']['output'];
  failedData?: Maybe<Array<Scalars['Float']['output']>>;
  failureRate: Scalars['Float']['output'];
  waiting: Scalars['Float']['output'];
};

export type WorkflowAction = {
  __typename?: 'WorkflowAction';
  id: Scalars['UUID']['output'];
  name: Scalars['String']['output'];
  nextStepIds?: Maybe<Array<Scalars['UUID']['output']>>;
  settings: Scalars['JSON']['output'];
  type: Scalars['String']['output'];
  valid: Scalars['Boolean']['output'];
};

export type WorkflowRun = {
  __typename?: 'WorkflowRun';
  workflowRunId: Scalars['UUID']['output'];
};

export type WorkflowVersion = {
  __typename?: 'WorkflowVersion';
  id: Scalars['UUID']['output'];
};

export type Workspace = {
  __typename?: 'Workspace';
  activationStatus: WorkspaceActivationStatus;
  allowImpersonation: Scalars['Boolean']['output'];
  billingSubscriptions: Array<BillingSubscription>;
  createdAt: Scalars['DateTime']['output'];
  creatorEmail?: Maybe<Scalars['String']['output']>;
  currentBillingSubscription?: Maybe<BillingSubscription>;
  customDomain?: Maybe<Scalars['String']['output']>;
  databaseSchema: Scalars['String']['output'];
  databaseUrl: Scalars['String']['output'];
  defaultRole?: Maybe<Role>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  displayName?: Maybe<Scalars['String']['output']>;
  featureFlags?: Maybe<Array<FeatureFlagDto>>;
  hasValidEnterpriseKey: Scalars['Boolean']['output'];
  id: Scalars['UUID']['output'];
  inviteHash?: Maybe<Scalars['String']['output']>;
  isCustomDomainEnabled: Scalars['Boolean']['output'];
  isGoogleAuthEnabled: Scalars['Boolean']['output'];
  isMicrosoftAuthEnabled: Scalars['Boolean']['output'];
  isPasswordAuthEnabled: Scalars['Boolean']['output'];
  isPublicInviteLinkEnabled: Scalars['Boolean']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  metadataVersion: Scalars['Float']['output'];
  onesignalApiKey?: Maybe<Scalars['String']['output']>;
  onesignalAppId?: Maybe<Scalars['String']['output']>;
  pabxCompanyId?: Maybe<Scalars['Float']['output']>;
  pabxDialingPlanId?: Maybe<Scalars['Float']['output']>;
  pabxTrunkId?: Maybe<Scalars['Float']['output']>;
  stripeIntegrations: Array<StripeIntegration>;
  subdomain: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  version?: Maybe<Scalars['String']['output']>;
  workspaceMembersCount?: Maybe<Scalars['Float']['output']>;
  workspaceUrls: WorkspaceUrls;
};

export enum WorkspaceActivationStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ONGOING_CREATION = 'ONGOING_CREATION',
  PENDING_CREATION = 'PENDING_CREATION',
  SUSPENDED = 'SUSPENDED'
}

export type WorkspaceAgent = {
  __typename?: 'WorkspaceAgent';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
  inboxes: Array<Inbox>;
  isActive: Scalars['Boolean']['output'];
  isAdmin: Scalars['Boolean']['output'];
  memberId: Scalars['String']['output'];
  sectors: Array<Sector>;
  updatedAt: Scalars['DateTime']['output'];
  workspace: Workspace;
};

export type WorkspaceEdge = {
  __typename?: 'WorkspaceEdge';
  /** Cursor for this node. */
  cursor: Scalars['ConnectionCursor']['output'];
  /** The node containing the Workspace */
  node: Workspace;
};

export type WorkspaceInfo = {
  __typename?: 'WorkspaceInfo';
  allowImpersonation: Scalars['Boolean']['output'];
  featureFlags: Array<FeatureFlag>;
  id: Scalars['String']['output'];
  logo?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  totalUsers: Scalars['Float']['output'];
  users: Array<UserInfo>;
};

export type WorkspaceInvitation = {
  __typename?: 'WorkspaceInvitation';
  email: Scalars['String']['output'];
  expiresAt: Scalars['DateTime']['output'];
  id: Scalars['UUID']['output'];
};

export type WorkspaceInviteHashValid = {
  __typename?: 'WorkspaceInviteHashValid';
  isValid: Scalars['Boolean']['output'];
};

export type WorkspaceMember = {
  __typename?: 'WorkspaceMember';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  colorScheme: Scalars['String']['output'];
  dateFormat?: Maybe<WorkspaceMemberDateFormatEnum>;
  id: Scalars['UUID']['output'];
  locale?: Maybe<Scalars['String']['output']>;
  name: FullName;
  roles?: Maybe<Array<Role>>;
  timeFormat?: Maybe<WorkspaceMemberTimeFormatEnum>;
  timeZone?: Maybe<Scalars['String']['output']>;
  userDocument?: Maybe<Scalars['String']['output']>;
  userEmail: Scalars['String']['output'];
  userPhone?: Maybe<Phones>;
  userWorkspaceId?: Maybe<Scalars['String']['output']>;
};

/** Date format as Month first, Day first, Year first or system as default */
export enum WorkspaceMemberDateFormatEnum {
  DAY_FIRST = 'DAY_FIRST',
  MONTH_FIRST = 'MONTH_FIRST',
  SYSTEM = 'SYSTEM',
  YEAR_FIRST = 'YEAR_FIRST'
}

/** Time time as Military, Standard or system as default */
export enum WorkspaceMemberTimeFormatEnum {
  HOUR_12 = 'HOUR_12',
  HOUR_24 = 'HOUR_24',
  SYSTEM = 'SYSTEM'
}

export type WorkspaceNameAndId = {
  __typename?: 'WorkspaceNameAndId';
  displayName?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
};

export type WorkspaceUrls = {
  __typename?: 'WorkspaceUrls';
  customUrl?: Maybe<Scalars['String']['output']>;
  subdomainUrl: Scalars['String']['output'];
};

export type WorkspaceUrlsAndId = {
  __typename?: 'WorkspaceUrlsAndId';
  id: Scalars['String']['output'];
  workspaceUrls: WorkspaceUrls;
};

export type RemoteServerFieldsFragment = { __typename?: 'RemoteServer', id: string, createdAt: any, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: any, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null };

export type RemoteTableFieldsFragment = { __typename?: 'RemoteTable', id?: any | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null };

export type CreateServerMutationVariables = Exact<{
  input: CreateRemoteServerInput;
}>;


export type CreateServerMutation = { __typename?: 'Mutation', createOneRemoteServer: { __typename?: 'RemoteServer', id: string, createdAt: any, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: any, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null } };

export type DeleteServerMutationVariables = Exact<{
  input: RemoteServerIdInput;
}>;


export type DeleteServerMutation = { __typename?: 'Mutation', deleteOneRemoteServer: { __typename?: 'RemoteServer', id: string } };

export type SyncRemoteTableMutationVariables = Exact<{
  input: RemoteTableInput;
}>;


export type SyncRemoteTableMutation = { __typename?: 'Mutation', syncRemoteTable: { __typename?: 'RemoteTable', id?: any | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null } };

export type SyncRemoteTableSchemaChangesMutationVariables = Exact<{
  input: RemoteTableInput;
}>;


export type SyncRemoteTableSchemaChangesMutation = { __typename?: 'Mutation', syncRemoteTableSchemaChanges: { __typename?: 'RemoteTable', id?: any | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null } };

export type UnsyncRemoteTableMutationVariables = Exact<{
  input: RemoteTableInput;
}>;


export type UnsyncRemoteTableMutation = { __typename?: 'Mutation', unsyncRemoteTable: { __typename?: 'RemoteTable', id?: any | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null } };

export type UpdateServerMutationVariables = Exact<{
  input: UpdateRemoteServerInput;
}>;


export type UpdateServerMutation = { __typename?: 'Mutation', updateOneRemoteServer: { __typename?: 'RemoteServer', id: string, createdAt: any, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: any, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null } };

export type GetManyDatabaseConnectionsQueryVariables = Exact<{
  input: RemoteServerTypeInput;
}>;


export type GetManyDatabaseConnectionsQuery = { __typename?: 'Query', findManyRemoteServersByType: Array<{ __typename?: 'RemoteServer', id: string, createdAt: any, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: any, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null }> };

export type GetManyRemoteTablesQueryVariables = Exact<{
  input: FindManyRemoteTablesInput;
}>;


export type GetManyRemoteTablesQuery = { __typename?: 'Query', findDistantTablesWithStatus: Array<{ __typename?: 'RemoteTable', id?: any | null, name: string, schema?: string | null, status: RemoteTableStatus, schemaPendingUpdates?: Array<DistantTableUpdate> | null }> };

export type GetOneDatabaseConnectionQueryVariables = Exact<{
  input: RemoteServerIdInput;
}>;


export type GetOneDatabaseConnectionQuery = { __typename?: 'Query', findOneRemoteServerById: { __typename?: 'RemoteServer', id: string, createdAt: any, foreignDataWrapperId: string, foreignDataWrapperOptions?: any | null, foreignDataWrapperType: string, updatedAt: any, schema?: string | null, label: string, userMappingOptions?: { __typename?: 'UserMappingOptionsUser', user?: string | null } | null } };

export type CreateOneObjectMetadataItemMutationVariables = Exact<{
  input: CreateOneObjectInput;
}>;


export type CreateOneObjectMetadataItemMutation = { __typename?: 'Mutation', createOneObject: { __typename?: 'Object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, isSearchable: boolean, createdAt: any, updatedAt: any, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, isLabelSyncedWithName: boolean } };

export type CreateOneFieldMetadataItemMutationVariables = Exact<{
  input: CreateOneFieldMetadataInput;
}>;


export type CreateOneFieldMetadataItemMutation = { __typename?: 'Mutation', createOneField: { __typename?: 'Field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isNullable?: boolean | null, createdAt: any, updatedAt: any, settings?: any | null, defaultValue?: any | null, options?: any | null, isLabelSyncedWithName?: boolean | null } };

export type UpdateOneFieldMetadataItemMutationVariables = Exact<{
  idToUpdate: Scalars['UUID']['input'];
  updatePayload: UpdateFieldInput;
}>;


export type UpdateOneFieldMetadataItemMutation = { __typename?: 'Mutation', updateOneField: { __typename?: 'Field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isNullable?: boolean | null, createdAt: any, updatedAt: any, settings?: any | null, isLabelSyncedWithName?: boolean | null } };

export type UpdateOneObjectMetadataItemMutationVariables = Exact<{
  idToUpdate: Scalars['UUID']['input'];
  updatePayload: UpdateObjectPayload;
}>;


export type UpdateOneObjectMetadataItemMutation = { __typename?: 'Mutation', updateOneObject: { __typename?: 'Object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, isSearchable: boolean, createdAt: any, updatedAt: any, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, isLabelSyncedWithName: boolean } };

export type DeleteOneObjectMetadataItemMutationVariables = Exact<{
  idToDelete: Scalars['UUID']['input'];
}>;


export type DeleteOneObjectMetadataItemMutation = { __typename?: 'Mutation', deleteOneObject: { __typename?: 'Object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isActive: boolean, isSearchable: boolean, createdAt: any, updatedAt: any, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, isLabelSyncedWithName: boolean } };

export type DeleteOneFieldMetadataItemMutationVariables = Exact<{
  idToDelete: Scalars['UUID']['input'];
}>;


export type DeleteOneFieldMetadataItemMutation = { __typename?: 'Mutation', deleteOneField: { __typename?: 'Field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isNullable?: boolean | null, createdAt: any, updatedAt: any, settings?: any | null } };

export type ObjectMetadataItemsQueryVariables = Exact<{ [key: string]: never; }>;


export type ObjectMetadataItemsQuery = { __typename?: 'Query', objects: { __typename?: 'ObjectConnection', edges: Array<{ __typename?: 'ObjectEdge', node: { __typename?: 'Object', id: any, dataSourceId: string, nameSingular: string, namePlural: string, labelSingular: string, labelPlural: string, description?: string | null, icon?: string | null, isCustom: boolean, isRemote: boolean, isActive: boolean, isSystem: boolean, createdAt: any, updatedAt: any, labelIdentifierFieldMetadataId?: string | null, imageIdentifierFieldMetadataId?: string | null, shortcut?: string | null, isLabelSyncedWithName: boolean, isSearchable: boolean, duplicateCriteria?: Array<Array<string>> | null, indexMetadataList: Array<{ __typename?: 'Index', id: any, createdAt: any, updatedAt: any, name: string, indexWhereClause?: string | null, indexType: IndexType, isUnique: boolean }>, fieldsList: Array<{ __typename?: 'Field', id: any, type: FieldMetadataType, name: string, label: string, description?: string | null, icon?: string | null, isCustom?: boolean | null, isActive?: boolean | null, isSystem?: boolean | null, isNullable?: boolean | null, isUnique?: boolean | null, createdAt: any, updatedAt: any, defaultValue?: any | null, options?: any | null, settings?: any | null, isLabelSyncedWithName?: boolean | null, relation?: { __typename?: 'Relation', type: RelationType, sourceObjectMetadata: { __typename?: 'Object', id: any, nameSingular: string, namePlural: string }, targetObjectMetadata: { __typename?: 'Object', id: any, nameSingular: string, namePlural: string }, sourceFieldMetadata: { __typename?: 'Field', id: any, name: string }, targetFieldMetadata: { __typename?: 'Field', id: any, name: string } } | null }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, hasPreviousPage?: boolean | null, startCursor?: any | null, endCursor?: any | null } } };

export type ServerlessFunctionFieldsFragment = { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any };

export type CreateOneServerlessFunctionItemMutationVariables = Exact<{
  input: CreateServerlessFunctionInput;
}>;


export type CreateOneServerlessFunctionItemMutation = { __typename?: 'Mutation', createOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any } };

export type DeleteOneServerlessFunctionMutationVariables = Exact<{
  input: ServerlessFunctionIdInput;
}>;


export type DeleteOneServerlessFunctionMutation = { __typename?: 'Mutation', deleteOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any } };

export type ExecuteOneServerlessFunctionMutationVariables = Exact<{
  input: ExecuteServerlessFunctionInput;
}>;


export type ExecuteOneServerlessFunctionMutation = { __typename?: 'Mutation', executeOneServerlessFunction: { __typename?: 'ServerlessFunctionExecutionResult', data?: any | null, logs: string, duration: number, status: ServerlessFunctionExecutionStatus, error?: any | null } };

export type PublishOneServerlessFunctionMutationVariables = Exact<{
  input: PublishServerlessFunctionInput;
}>;


export type PublishOneServerlessFunctionMutation = { __typename?: 'Mutation', publishServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any } };

export type UpdateOneServerlessFunctionMutationVariables = Exact<{
  input: UpdateServerlessFunctionInput;
}>;


export type UpdateOneServerlessFunctionMutation = { __typename?: 'Mutation', updateOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any } };

export type FindManyAvailablePackagesQueryVariables = Exact<{
  input: ServerlessFunctionIdInput;
}>;


export type FindManyAvailablePackagesQuery = { __typename?: 'Query', getAvailablePackages: any };

export type GetManyServerlessFunctionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetManyServerlessFunctionsQuery = { __typename?: 'Query', findManyServerlessFunctions: Array<{ __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any }> };

export type GetOneServerlessFunctionQueryVariables = Exact<{
  input: ServerlessFunctionIdInput;
}>;


export type GetOneServerlessFunctionQuery = { __typename?: 'Query', findOneServerlessFunction: { __typename?: 'ServerlessFunction', id: any, name: string, description?: string | null, runtime: string, timeoutSeconds: number, latestVersion?: string | null, latestVersionInputSchema?: any | null, publishedVersions: Array<string>, createdAt: any, updatedAt: any } };

export type FindOneServerlessFunctionSourceCodeQueryVariables = Exact<{
  input: GetServerlessFunctionSourceCodeInput;
}>;


export type FindOneServerlessFunctionSourceCodeQuery = { __typename?: 'Query', getServerlessFunctionSourceCode?: any | null };

export const RemoteServerFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteServerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperId"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperOptions"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperType"}},{"kind":"Field","name":{"kind":"Name","value":"userMappingOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<RemoteServerFieldsFragment, unknown>;
export const RemoteTableFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteTableFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTable"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"schemaPendingUpdates"}}]}}]} as unknown as DocumentNode<RemoteTableFieldsFragment, unknown>;
export const ServerlessFunctionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"timeoutSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ServerlessFunctionFieldsFragment, unknown>;
export const CreateServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"createServer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateRemoteServerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneRemoteServer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteServerFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteServerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperId"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperOptions"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperType"}},{"kind":"Field","name":{"kind":"Name","value":"userMappingOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<CreateServerMutation, CreateServerMutationVariables>;
export const DeleteServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"deleteServer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServerIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneRemoteServer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteServerMutation, DeleteServerMutationVariables>;
export const SyncRemoteTableDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"syncRemoteTable"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTableInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncRemoteTable"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteTableFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteTableFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTable"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"schemaPendingUpdates"}}]}}]} as unknown as DocumentNode<SyncRemoteTableMutation, SyncRemoteTableMutationVariables>;
export const SyncRemoteTableSchemaChangesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"syncRemoteTableSchemaChanges"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTableInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"syncRemoteTableSchemaChanges"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteTableFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteTableFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTable"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"schemaPendingUpdates"}}]}}]} as unknown as DocumentNode<SyncRemoteTableSchemaChangesMutation, SyncRemoteTableSchemaChangesMutationVariables>;
export const UnsyncRemoteTableDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"unsyncRemoteTable"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTableInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unsyncRemoteTable"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteTableFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteTableFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTable"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"schemaPendingUpdates"}}]}}]} as unknown as DocumentNode<UnsyncRemoteTableMutation, UnsyncRemoteTableMutationVariables>;
export const UpdateServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"updateServer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateRemoteServerInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOneRemoteServer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteServerFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteServerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperId"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperOptions"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperType"}},{"kind":"Field","name":{"kind":"Name","value":"userMappingOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<UpdateServerMutation, UpdateServerMutationVariables>;
export const GetManyDatabaseConnectionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetManyDatabaseConnections"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServerTypeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findManyRemoteServersByType"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteServerFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteServerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperId"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperOptions"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperType"}},{"kind":"Field","name":{"kind":"Name","value":"userMappingOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<GetManyDatabaseConnectionsQuery, GetManyDatabaseConnectionsQueryVariables>;
export const GetManyRemoteTablesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetManyRemoteTables"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"FindManyRemoteTablesInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findDistantTablesWithStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteTableFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteTableFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteTable"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"schemaPendingUpdates"}}]}}]} as unknown as DocumentNode<GetManyRemoteTablesQuery, GetManyRemoteTablesQueryVariables>;
export const GetOneDatabaseConnectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOneDatabaseConnection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServerIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findOneRemoteServerById"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RemoteServerFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RemoteServerFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RemoteServer"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperId"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperOptions"}},{"kind":"Field","name":{"kind":"Name","value":"foreignDataWrapperType"}},{"kind":"Field","name":{"kind":"Name","value":"userMappingOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"schema"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]} as unknown as DocumentNode<GetOneDatabaseConnectionQuery, GetOneDatabaseConnectionQueryVariables>;
export const CreateOneObjectMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOneObjectMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOneObjectInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneObject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isSearchable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"labelIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"imageIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}}]}}]}}]} as unknown as DocumentNode<CreateOneObjectMetadataItemMutation, CreateOneObjectMetadataItemMutationVariables>;
export const CreateOneFieldMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOneFieldMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOneFieldMetadataInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}}]}}]}}]} as unknown as DocumentNode<CreateOneFieldMetadataItemMutation, CreateOneFieldMetadataItemMutationVariables>;
export const UpdateOneFieldMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOneFieldMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateFieldInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOneField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"update"},"value":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}}]}}]}}]} as unknown as DocumentNode<UpdateOneFieldMetadataItemMutation, UpdateOneFieldMetadataItemMutationVariables>;
export const UpdateOneObjectMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOneObjectMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateObjectPayload"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOneObject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToUpdate"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"update"},"value":{"kind":"Variable","name":{"kind":"Name","value":"updatePayload"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isSearchable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"labelIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"imageIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}}]}}]}}]} as unknown as DocumentNode<UpdateOneObjectMetadataItemMutation, UpdateOneObjectMetadataItemMutationVariables>;
export const DeleteOneObjectMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOneObjectMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneObject"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isSearchable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"labelIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"imageIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}}]}}]}}]} as unknown as DocumentNode<DeleteOneObjectMetadataItemMutation, DeleteOneObjectMetadataItemMutationVariables>;
export const DeleteOneFieldMetadataItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOneFieldMetadataItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UUID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneField"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"idToDelete"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}}]}}]}}]} as unknown as DocumentNode<DeleteOneFieldMetadataItemMutation, DeleteOneFieldMetadataItemMutationVariables>;
export const ObjectMetadataItemsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ObjectMetadataItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"objects"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"paging"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"dataSourceId"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}},{"kind":"Field","name":{"kind":"Name","value":"labelSingular"}},{"kind":"Field","name":{"kind":"Name","value":"labelPlural"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isRemote"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isSystem"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"labelIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"imageIdentifierFieldMetadataId"}},{"kind":"Field","name":{"kind":"Name","value":"shortcut"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}},{"kind":"Field","name":{"kind":"Name","value":"isSearchable"}},{"kind":"Field","name":{"kind":"Name","value":"duplicateCriteria"}},{"kind":"Field","name":{"kind":"Name","value":"indexMetadataList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"indexWhereClause"}},{"kind":"Field","name":{"kind":"Name","value":"indexType"}},{"kind":"Field","name":{"kind":"Name","value":"isUnique"}}]}},{"kind":"Field","name":{"kind":"Name","value":"fieldsList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"isCustom"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"isSystem"}},{"kind":"Field","name":{"kind":"Name","value":"isNullable"}},{"kind":"Field","name":{"kind":"Name","value":"isUnique"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"defaultValue"}},{"kind":"Field","name":{"kind":"Name","value":"options"}},{"kind":"Field","name":{"kind":"Name","value":"settings"}},{"kind":"Field","name":{"kind":"Name","value":"isLabelSyncedWithName"}},{"kind":"Field","name":{"kind":"Name","value":"relation"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"sourceObjectMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}}]}},{"kind":"Field","name":{"kind":"Name","value":"targetObjectMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"nameSingular"}},{"kind":"Field","name":{"kind":"Name","value":"namePlural"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sourceFieldMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"targetFieldMetadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"hasPreviousPage"}},{"kind":"Field","name":{"kind":"Name","value":"startCursor"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}}]}}]}}]} as unknown as DocumentNode<ObjectMetadataItemsQuery, ObjectMetadataItemsQueryVariables>;
export const CreateOneServerlessFunctionItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOneServerlessFunctionItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateServerlessFunctionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOneServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"timeoutSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<CreateOneServerlessFunctionItemMutation, CreateOneServerlessFunctionItemMutationVariables>;
export const DeleteOneServerlessFunctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteOneServerlessFunction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunctionIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteOneServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"timeoutSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<DeleteOneServerlessFunctionMutation, DeleteOneServerlessFunctionMutationVariables>;
export const ExecuteOneServerlessFunctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ExecuteOneServerlessFunction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ExecuteServerlessFunctionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"executeOneServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"logs"}},{"kind":"Field","name":{"kind":"Name","value":"duration"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"error"}}]}}]}}]} as unknown as DocumentNode<ExecuteOneServerlessFunctionMutation, ExecuteOneServerlessFunctionMutationVariables>;
export const PublishOneServerlessFunctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PublishOneServerlessFunction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PublishServerlessFunctionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publishServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"timeoutSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<PublishOneServerlessFunctionMutation, PublishOneServerlessFunctionMutationVariables>;
export const UpdateOneServerlessFunctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOneServerlessFunction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateServerlessFunctionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOneServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"timeoutSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<UpdateOneServerlessFunctionMutation, UpdateOneServerlessFunctionMutationVariables>;
export const FindManyAvailablePackagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FindManyAvailablePackages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunctionIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getAvailablePackages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<FindManyAvailablePackagesQuery, FindManyAvailablePackagesQueryVariables>;
export const GetManyServerlessFunctionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetManyServerlessFunctions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findManyServerlessFunctions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"timeoutSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetManyServerlessFunctionsQuery, GetManyServerlessFunctionsQueryVariables>;
export const GetOneServerlessFunctionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetOneServerlessFunction"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunctionIdInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"findOneServerlessFunction"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ServerlessFunctionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ServerlessFunctionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ServerlessFunction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"runtime"}},{"kind":"Field","name":{"kind":"Name","value":"timeoutSeconds"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersion"}},{"kind":"Field","name":{"kind":"Name","value":"latestVersionInputSchema"}},{"kind":"Field","name":{"kind":"Name","value":"publishedVersions"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<GetOneServerlessFunctionQuery, GetOneServerlessFunctionQueryVariables>;
export const FindOneServerlessFunctionSourceCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FindOneServerlessFunctionSourceCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"GetServerlessFunctionSourceCodeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getServerlessFunctionSourceCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<FindOneServerlessFunctionSourceCodeQuery, FindOneServerlessFunctionSourceCodeQueryVariables>;