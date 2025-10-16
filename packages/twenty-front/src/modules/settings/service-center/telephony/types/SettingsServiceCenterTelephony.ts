export interface Telephony {
  // __typename: 'Telephony';
  // id: string;
  // memberId: string;
  // numberExtension: string;
  // type: string;
  // extensionName: string;
  // extensionGroup: string;
  // dialingPlan: string;
  // areaCode: string;
  // SIPPassword: string;
  // callerExternalID: string;
  // pullCalls: string;
  // listenToCalls: boolean;
  // recordCalls: boolean;
  // blockExtension: boolean;
  // enableMailbox: boolean;
  // emailForMailbox: string;
  // fowardAllCalls: string;
  // fowardOfflineWithoutService: string;
  // extensionAllCallsOrOffline: string;
  // externalNumberAllCallsOrOffline?: string;
  // destinyMailboxAllCallsOrOffline?: string;
  // fowardBusyNotAvailable: string;
  // extensionBusy: string;
  // externalNumberBusy?: string;
  // destinyMailboxBusy?: string;
  // createdAt: Date;
  // updatedAt: Date;
  // advancedFowarding1: string;
  // advancedFowarding2: string;
  // advancedFowarding3: string;
  // advancedFowarding4: string;
  // advancedFowarding5: string;
  // advancedFowarding1Value: string;
  // advancedFowarding2Value: string;
  // advancedFowarding3Value: string;
  // advancedFowarding4Value: string;
  // advancedFowarding5Value: string;

  __typename: 'Telephony';
  id: string;
  createdAt: string;
  updatedAt: string;
  memberId: string;
  numberExtension: string;
  extensionName?: string | null;
  extensionGroup?: string | null;
  type?: string | null;
  dialingPlan?: string | null;
  areaCode?: string | null;
  SIPPassword?: string | null;
  callerExternalID?: string | null;
  pullCalls?: string | null;
  listenToCalls?: boolean | null;
  recordCalls?: boolean | null;
  blockExtension?: boolean | null;
  enableMailbox?: boolean | null;
  emailForMailbox?: string | null;
  fowardAllCalls?: string | null;
  fowardBusyNotAvailable?: string | null;
  fowardOfflineWithoutService?: string | null;
  extensionAllCallsOrOffline?: string | null;
  externalNumberAllCallsOrOffline?: string | null;
  destinyMailboxAllCallsOrOffline?: string | null;
  extensionBusy?: string | null;
  externalNumberBusy?: string | null;
  destinyMailboxBusy?: string | null;
  ramal_id?: string | null;
  advancedFowarding1?: string | null;
  advancedFowarding2?: string | null;
  advancedFowarding3?: string | null;
  advancedFowarding4?: string | null;
  advancedFowarding5?: string | null;
  advancedFowarding1Value?: string | null;
  advancedFowarding2Value?: string | null;
  advancedFowarding3Value?: string | null;
  advancedFowarding4Value?: string | null;
  advancedFowarding5Value?: string | null;
  searchVector?: string | null;
}

export interface TelephonyExtension {
  ramal_id: string | undefined;
  cliente_id: string;
  nome: string;
  tipo: string;
  usuario_autenticacao: string;
  numero: string;
  senha_sip: string;
  senha_web: string;
  caller_id_externo: string;
  grupo_ramais: string;
  centro_custo: string;
  plano_discagem_id: string;
  grupo_musica_espera: string | null;
  puxar_chamadas: string;
  habilitar_timers: string;
  habilitar_blf: string;
  escutar_chamadas: string;
  gravar_chamadas: string;
  bloquear_ramal: string;
  codigo_incorporacao: string;
  codigo_area: string;
  habilitar_dupla_autenticacao: string;
  dupla_autenticacao_ip_permitido: string;
  dupla_autenticacao_mascara: string;
  encaminhar_todas_chamadas: Encaminhamento;
  encaminhar_offline_sem_atendimento: Encaminhamento;
  encaminhar_ocupado_indisponivel: Encaminhamento;
}

export interface DialingPlans {
  plano_discagem_id?: string;
  nome?: string;
  cliente_id?: string;
}

export interface Dids {
  did_id?: string;
  cliente_id?: string;
  numero?: string;
  apontar_para?: string;
  destino?: string;
  habilitar_registro?: string;
  registro_dominio?: string;
  registro_usuario?: string;
  registro_senha?: string;
  gravar_chamadas?: string;
  maximo_chamadas_simultaneas?: string;
  habilitar_horario_funcionamento?: string;
  horario_funcionamento_inicio?: string;
  horario_funcionamento_fim?: string;
  horario_funcionamento_dias_semana?: string[];
  horario_funcionamento_lista_feriados?: string[];
}
export interface TelephonyCallFlow {
  fluxo_chamada_id?: string;
  fluxo_chamada_nome?: string;
  fluxo_chamada_variaveis_configuracao: [
    {
      titulo: string;
      nome: string;
      codigo_identificador: string;
      valor: string;
    },
  ];
}

export interface Campaign {
  campanha_id: string;
  cliente_id: string;
  nome: string;
}

export interface Encaminhamento {
  encaminhamento_tipo: string;
  encaminhamento_destino: string[];
  encaminhamento_destinos: string[];
}

export interface CreateTelephonyInput {
  memberId: string;
  numberExtension: string;
  type: string;
  extensionName: string;
  extensionGroup: string;
  dialingPlan: string;
  areaCode: string;
  SIPPassword: string;
  callerExternalID: string;
  pullCalls: string;
  listenToCalls: boolean;
  recordCalls: boolean;
  blockExtension: boolean;
  enableMailbox: boolean;
  emailForMailbox: string;
  fowardAllCalls: string;
  fowardBusyNotAvailable: string;
  fowardOfflineWithoutService: string;
  extensionAllCallsOrOffline: string;
  externalNumberAllCallsOrOffline?: string;
  destinyMailboxAllCallsOrOffline?: string;
  extensionBusy: string;
  externalNumberBusy?: string;
  destinyMailboxBusy?: string;
  advancedFowarding1?: string;
  advancedFowarding2?: string;
  advancedFowarding3?: string;
  advancedFowarding4?: string;
  advancedFowarding5?: string;
  advancedFowarding1Value?: string;
  advancedFowarding2Value?: string;
  advancedFowarding3Value?: string;
  advancedFowarding4Value?: string;
  advancedFowarding5Value?: string;
}

export interface UpdateTelephonyInput {
  memberId: string;
  numberExtension: string;
  type: string;
  extensionName: string;
  // extensionGroup: string;
  dialingPlan: string;
  areaCode: string;
  SIPPassword: string;
  callerExternalID: string;
  pullCalls: string;
  listenToCalls: boolean;
  recordCalls: boolean;
  blockExtension: boolean;
  enableMailbox: boolean;
  emailForMailbox: string;
  fowardAllCalls: string;
  fowardBusyNotAvailable: string;
  fowardOfflineWithoutService: string;
  extensionAllCallsOrOffline: string;
  externalNumberAllCallsOrOffline?: string;
  destinyMailboxAllCallsOrOffline?: string;
  extensionBusy: string;
  externalNumberBusy?: string;
  destinyMailboxBusy?: string;
  advancedFowarding1?: string;
  advancedFowarding2?: string;
  advancedFowarding3?: string;
  advancedFowarding4?: string;
  advancedFowarding5?: string;
  advancedFowarding1Value?: string;
  advancedFowarding2Value?: string;
  advancedFowarding3Value?: string;
  advancedFowarding4Value?: string;
  advancedFowarding5Value?: string;
}
