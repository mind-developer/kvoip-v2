/* eslint-disable import/order */
import { ObjectType } from '@nestjs/graphql';
import {
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'linkTrackingIntegration', schema: 'core' })
@ObjectType('LinkTrackingIntegration')
export class LinkTrackingIntegration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  link_name: string;

  @Column('text')
  website_url: string;

  @Column('text')
  generated_url: string;

  @Column('text')
  campaign_name: string;

  @Column('text')
  campaign_source: string;

  @Column('text')
  means_of_communication: string;

  @Column('text', { nullable: true })
  keyword?: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'NOW()' })
  updated_at: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updated_at = new Date();
  }
}
