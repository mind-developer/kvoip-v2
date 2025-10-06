import { Field, InputType, Int } from '@nestjs/graphql';

import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

import { TarifaTroncoInput } from 'src/modules/telephony/dtos/tarifa-tronco.input';

@InputType()
export class PabxTrunkCreationDetailsInput {
  @Field(() => Int)
  @IsNumber()
  tronco_id: number; // This seems like an external ID provided by the user

  @Field()
  @IsString()
  nome: string;

  @Field()
  @IsString()
  endereco: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  host_dinamico?: number;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  qtd_digitos_cortados?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  insere_digitos?: string;

  @Field(() => Int, { nullable: true })
  @IsNumber()
  @IsOptional()
  autentica_user_pass?: number;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  usuario?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  senha?: string;

  @Field(() => [TarifaTroncoInput], { nullable: true })
  @IsArray()
  @IsOptional()
  tarifas?: TarifaTroncoInput[];
}
