import { Field, ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { BillingProduct } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { BillingProductKey } from 'src/engine/core-modules/billing/enums/billing-product-key.enum';
import { BillingProductLimitType } from 'src/engine/core-modules/billing/enums/billing-product-limit-type-enum';

@Entity({ name: 'billingProductLimit', schema: 'core' })
@Unique('IDX_PRODUCT_LIMIT_PER_KEY', ['productId', 'productKey'])
@ObjectType()
export class BillingProductLimit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => BillingProductKey)
  @Column({
    type: 'enum',
    enum: BillingProductKey,
  })
  productKey: BillingProductKey;

  @Field(() => BillingProductLimitType)
  @Column({
    type: 'enum',
    enum: BillingProductLimitType,
  })
  type: BillingProductLimitType;

  @Field(() => Number)
  @Column({
    type: 'decimal',
  })
  limit: number;

  @ManyToOne(() => BillingProduct, (product) => product.limits)
  @JoinColumn({
    name: 'productId',
  })
  product: Relation<BillingProduct>;

  @Column()
  productId: string;

  @Column({ nullable: true, type: 'timestamptz' })
  deletedAt?: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
