/* @kvoip-woulz proprietary */
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { PaymentMethod } from '../enums/payment-method.enum';
import { CardData, Customer } from '../interfaces/payment-provider.interface';

export class CreateChargeDto {
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  amount: number;

  @IsObject()
  @IsNotEmpty()
  payerInfo: Customer;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  dueDate?: Date;

  @IsOptional()
  @IsNumber()
  expirationMinutes?: number;

  @IsOptional()
  @IsObject()
  cardData?: CardData;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
