import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { StripeIntegration } from 'src/engine/core-modules/stripe/integrations/stripe-integration.entity';
import { StripeIntegrationResolver } from 'src/engine/core-modules/stripe/integrations/stripe-integration.resolver';
import { StripeIntegrationService } from 'src/engine/core-modules/stripe/integrations/stripe-integration.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

import { SripeController } from './stripe.controller';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [StripeIntegration, Workspace],
          'core',
        ),
        WorkspaceModule,
      ],
    }),
    HttpModule,
    EnvironmentModule,
  ],
  controllers: [SripeController],
  providers: [
    StripeIntegrationResolver,
    StripeIntegrationService,
    EnvironmentService,
  ],
  exports: [],
})
export class StripeModule {}
