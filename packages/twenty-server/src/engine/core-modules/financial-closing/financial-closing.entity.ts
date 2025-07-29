import { Field, ObjectType } from '@nestjs/graphql';
import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'financialClosing', schema: 'core' })
@ObjectType()
export class FinancialClosing {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  lastDayMonth: boolean;

  @Field()
  @Column()
  time: string;

  @Field()
  @Column({ type: 'int' })
  day: number;

  @Field(() => [UUIDScalarType])
  @Column('jsonb')
  billingModelIds: string[];

  @Field(() => Workspace)
  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  workspace: Relation<Workspace>;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
