import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TelephonyDids {
  @Field(() => ID, { nullable: true })
  did_id?: string;

  @Field({ nullable: true })
  cliente_id?: string;

  @Field({ nullable: true })
  numero?: string;

  @Field({ nullable: true })
  apontar_para?: string;

  @Field({ nullable: true })
  destino?: string;

  @Field({ nullable: true })
  habilitar_registro?: string;

  @Field({ nullable: true })
  registro_dominio?: string;

  @Field({ nullable: true })
  registro_usuario?: string;

  @Field({ nullable: true })
  registro_senha?: string;

  @Field({ nullable: true })
  gravar_chamadas?: string;

  @Field({ nullable: true })
  maximo_chamadas_simultaneas?: string;

  @Field({ nullable: true })
  habilitar_horario_funcionamento?: string;

  @Field({ nullable: true })
  horario_funcionamento_inicio?: string;

  @Field({ nullable: true })
  horario_funcionamento_fim?: string;

  @Field(() => [String], { nullable: true })
  horario_funcionamento_dias_semana?: string[];

  @Field(() => [String], { nullable: true })
  horario_funcionamento_lista_feriados?: string[];
}
