import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateFocusNfeIntegrationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  token: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @Field()
  @IsString()
  @IsOptional()
  cnpj: string;

  @Field()
  @IsString()
  @IsOptional()
  cpf: string;

  @Field()
  @IsString()
  @IsOptional()
  ie: string;

  @Field()
  @IsString()
  @IsOptional()
  inscricaoMunicipal: string;

  @Field()
  @IsString()
  @IsOptional()
  cnaeCode: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  cep: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  street: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  number: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  city: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  state: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  taxRegime: string;
}
