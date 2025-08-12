import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateFocusNfeIntegrationInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  token: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  companyName: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cnpj: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cpf: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  ie: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  inscricaoMunicipal: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cnaeCode: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  cep: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  street: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  number: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  neighborhood: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  city: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  state: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  taxRegime: string;
}
