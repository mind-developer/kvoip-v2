/* @kvoip-woulz proprietary */
import { Field, InputType } from '@nestjs/graphql';

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

import {
  InterCustomerType,
  InterCustomerUf,
} from 'src/engine/core-modules/inter/interfaces/charge.interface';
import { IsInterDateString } from 'src/engine/core-modules/inter/validators/is-inter-date-string.validator';
import { IsInterDecimalString } from 'src/engine/core-modules/inter/validators/is-inter-decimal-string.validator';

@InputType()
export class InterCreateChargePagadorDto {
  @Field(() => String)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field(() => String)
  @Length(11, 18)
  @IsNumberString()
  @IsNotEmpty()
  cpfCnpj: string;

  @Field(() => InterCustomerType)
  @IsEnum(InterCustomerType)
  @IsNotEmpty()
  tipoPessoa: InterCustomerType;

  @Field(() => String)
  @Length(1, 100)
  @IsString()
  @IsNotEmpty()
  nome: string;

  @Field(() => String)
  @Length(1, 100)
  @IsString()
  @IsNotEmpty()
  endereco: string;

  @Field(() => String)
  @Length(1, 60)
  @IsString()
  @IsNotEmpty()
  cidade: string;

  @Field(() => InterCustomerUf)
  @IsEnum(InterCustomerUf)
  @IsNotEmpty()
  uf: InterCustomerUf;

  @Field(() => String)
  @IsNumberString()
  @Length(8, 8)
  @IsNotEmpty()
  cep: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  bairro?: string;
}

@InputType()
export class InterCreateChargeMultaDto {
  @Field(() => String)
  @IsEnum(['PERCENTUAL', 'VALORFIXO'])
  @IsNotEmpty()
  codigo: 'PERCENTUAL' | 'VALORFIXO';

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  taxa?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  valor?: string;
}

@InputType()
export class InterCreateChargeMoraDto {
  @Field(() => String)
  @IsEnum(['TAXAMENSAL', 'VALORDIA'])
  @IsNotEmpty()
  codigo: 'TAXAMENSAL' | 'VALORDIA';

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  taxa?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  valor?: string;
}

@InputType()
export class InterCreateChargeDescontoDto {
  @Field(() => Number)
  @IsNumber()
  @IsNotEmpty()
  quantidadeDias: number;

  @Field(() => Number, { nullable: true })
  @IsNumber()
  @IsOptional()
  taxa?: number;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  valor?: string;

  @Field(() => String)
  @IsEnum(['VALORFIXODATAINFORMADA', 'PERCENTUALDATAINFORMADA'])
  @IsNotEmpty()
  codigo: 'VALORFIXODATAINFORMADA' | 'PERCENTUALDATAINFORMADA';
}

@InputType()
export class InterCreateChargeDto {
  @Field(() => String)
  @IsInterDecimalString()
  @IsNotEmpty()
  valorNominal: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  seuNumero: string;

  @Field(() => String)
  @IsInterDateString()
  @IsNotEmpty()
  dataVencimento: string;

  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  numDiasAgenda: string;

  @Field(() => InterCreateChargePagadorDto)
  @ValidateNested()
  @Type(() => InterCreateChargePagadorDto)
  @IsNotEmpty()
  pagador: InterCreateChargePagadorDto;

  @Field(() => InterCreateChargeMultaDto, { nullable: true })
  @ValidateNested()
  @Type(() => InterCreateChargeMultaDto)
  @IsOptional()
  multa?: InterCreateChargeMultaDto;

  @Field(() => InterCreateChargeMoraDto, { nullable: true })
  @ValidateNested()
  @Type(() => InterCreateChargeMoraDto)
  @IsOptional()
  mora?: InterCreateChargeMoraDto;

  @Field(() => InterCreateChargeDescontoDto, { nullable: true })
  @ValidateNested()
  @Type(() => InterCreateChargeDescontoDto)
  @IsOptional()
  desconto?: InterCreateChargeDescontoDto;
}
