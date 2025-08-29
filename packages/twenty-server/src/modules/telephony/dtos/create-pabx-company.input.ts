import { Field, ID, InputType, Int } from '@nestjs/graphql';

import { IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreatePabxCompanyInput {
  @Field()
  @IsString()
  login: string;

  @Field()
  @IsString()
  senha: string;

  @Field(() => Int)
  @IsNumber()
  tipo: number;

  @Field()
  @IsString()
  nome: string;

  @Field(() => Int)
  @IsNumber()
  qtd_ramais_max_pabx: number;

  @Field(() => Int)
  @IsNumber()
  qtd_ramais_max_pa: number;

  @Field(() => Int)
  @IsNumber()
  salas_conf_num_max: number;

  @Field(() => Int)
  @IsNumber()
  acao_limite_espaco: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  email_cliente?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  max_chamadas_simultaneas?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  faixa_min?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  faixa_max?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  prefixo?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  habilita_prefixo_sainte?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  prefixo_sainte?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  razao_social?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cnpj?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  end?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  compl?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cep?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bairro?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cidade?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  estado?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  resp?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  tel?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cel?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ramal_resp?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  espaco_disco?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  usuario_padrao_id?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  cliente_bloqueado?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  modulos?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  cortar_prefixo_ramal?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  habilitar_aviso_disco_email?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  aviso_disco_email_alerta?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  aviso_disco_email_urgente?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  forma_arredondamento?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  formato_numeros_contatos?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  remover_mailings?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  dias_remocao_mailings?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  dias_aviso_remocao_mailings?: number;

  @Field(() => ID)
  @IsString()
  workspaceId: string;
}
