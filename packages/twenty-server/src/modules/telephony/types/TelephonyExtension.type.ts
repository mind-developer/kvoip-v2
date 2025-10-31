import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
class EncaminhamentoDestino {
  @Field(() => Int, { nullable: true })
  tipo?: number;

  @Field({ nullable: true })
  destino?: string;
}

@ObjectType()
class Encaminhamento {
  @Field(() => Int, { nullable: true })
  encaminhamento_tipo?: number;

  @Field(() => [EncaminhamentoDestino], { nullable: true })
  encaminhamento_destino?: EncaminhamentoDestino[];

  @Field(() => [EncaminhamentoDestino], { nullable: true })
  encaminhamento_destinos?: EncaminhamentoDestino[];
}

@ObjectType()
export class TelephonyExtension {
  @Field(() => ID, { nullable: true })
  ramal_id?: string;

  @Field({ nullable: true })
  cliente_id?: string;

  @Field({ nullable: true })
  nome?: string;

  @Field({ nullable: true })
  tipo?: string;

  @Field({ nullable: true })
  usuario_autenticacao?: string;

  @Field({ nullable: true })
  numero?: string;

  @Field({ nullable: true })
  senha_sip?: string;

  @Field({ nullable: true })
  senha_web?: string;

  @Field({ nullable: true })
  caller_id_externo?: string;

  @Field({ nullable: true })
  grupo_ramais?: string;

  @Field({ nullable: true })
  centro_custo?: string;

  @Field({ nullable: true })
  plano_discagem_id?: string;

  @Field({ nullable: true })
  grupo_musica_espera?: string;

  @Field({ nullable: true })
  puxar_chamadas?: string;

  @Field({ nullable: true })
  habilitar_timers?: string;

  @Field({ nullable: true })
  habilitar_blf?: string;

  @Field({ nullable: true })
  escutar_chamadas?: string;

  @Field({ nullable: true })
  gravar_chamadas?: string;

  @Field({ nullable: true })
  bloquear_ramal?: string;

  @Field({ nullable: true })
  codigo_incorporacao?: string;

  @Field({ nullable: true })
  codigo_area?: string;

  @Field({ nullable: true })
  habilitar_dupla_autenticacao?: string;

  @Field({ nullable: true })
  dupla_autenticacao_ip_permitido?: string;

  @Field({ nullable: true })
  dupla_autenticacao_mascara?: string;

  @Field(() => Encaminhamento, { nullable: true })
  encaminhar_todas_chamadas?: Encaminhamento;

  @Field(() => Encaminhamento, { nullable: true })
  encaminhar_offline_sem_atendimento?: Encaminhamento;

  @Field(() => Encaminhamento, { nullable: true })
  encaminhar_ocupado_indisponivel?: Encaminhamento;
}
