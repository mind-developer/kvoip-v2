import { Module } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { WorkspaceQueryRunnerModule } from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.module';
import { ActorModule } from 'src/engine/core-modules/actor/actor.module';
import { AdminPanelModule } from 'src/engine/core-modules/admin-panel/admin-panel.module';
import { AiModule } from 'src/engine/core-modules/ai/ai.module';
import { ApiKeyModule } from 'src/engine/core-modules/api-key/api-key.module';
import { AppTokenModule } from 'src/engine/core-modules/app-token/app-token.module';
import { ApprovedAccessDomainModule } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { BillingPlansModule } from 'src/engine/core-modules/billing-plans/billing-plans.module';
import { BillingWebhookModule } from 'src/engine/core-modules/billing-webhook/billing-webhook.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { CacheStorageModule } from 'src/engine/core-modules/cache-storage/cache-storage.module';
import { TimelineCalendarEventModule } from 'src/engine/core-modules/calendar/timeline-calendar-event.module';
import { CaptchaModule } from 'src/engine/core-modules/captcha/captcha.module';
import { captchaModuleFactory } from 'src/engine/core-modules/captcha/captcha.module-factory';
import { ChatbotFlowModule } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.module';
import { DashboardLinklogsModule } from 'src/engine/core-modules/dadshboard-linklogs/dashboard-linlogs.module';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { ExceptionHandlerModule } from 'src/engine/core-modules/exception-handler/exception-handler.module';
import { exceptionHandlerModuleFactory } from 'src/engine/core-modules/exception-handler/exception-handler.module-factory';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { FileStorageService } from 'src/engine/core-modules/file-storage/file-storage.service';
import { GeoMapModule } from 'src/engine/core-modules/geo-map/geo-map-module';
import { GoogleStorageModule } from 'src/engine/core-modules/google-cloud/google-storage.module';
import { HealthModule } from 'src/engine/core-modules/health/health.module';
import { ImapSmtpCaldavModule } from 'src/engine/core-modules/imap-smtp-caldav-connection/imap-smtp-caldav-connection.module';
import { InboxModule } from 'src/engine/core-modules/inbox/inbox.module';
import { InterModule } from 'src/engine/core-modules/inter/inter.module';
import { KvoipAdminModule } from 'src/engine/core-modules/kvoip-admin/kvoip-admin.module';
import { LabModule } from 'src/engine/core-modules/lab/lab.module';
import { LoggerModule } from 'src/engine/core-modules/logger/logger.module';
import { loggerModuleFactory } from 'src/engine/core-modules/logger/logger.module-factory';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { messageQueueModuleFactory } from 'src/engine/core-modules/message-queue/message-queue.module-factory';
import { TimelineMessagingModule } from 'src/engine/core-modules/messaging/timeline-messaging.module';
import { MetaModule } from 'src/engine/core-modules/meta/meta.module';
import { OnboardingPlansModule } from 'src/engine/core-modules/onboarding-plans/onboarding-plans.module';
import { OpenApiModule } from 'src/engine/core-modules/open-api/open-api.module';
import { PostgresCredentialsModule } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.module';
import { RedisClientModule } from 'src/engine/core-modules/redis-client/redis-client.module';
import { RedisClientService } from 'src/engine/core-modules/redis-client/redis-client.service';
import { SearchModule } from 'src/engine/core-modules/search/search.module';
import { SectorModule } from 'src/engine/core-modules/sector/sector.module';
import { serverlessModuleFactory } from 'src/engine/core-modules/serverless/serverless-module.factory';
import { ServerlessModule } from 'src/engine/core-modules/serverless/serverless.module';
import { WorkspaceSSOModule } from 'src/engine/core-modules/sso/sso.module';
import { TelemetryModule } from 'src/engine/core-modules/telemetry/telemetry.module';
import { TelephonyModule } from 'src/engine/core-modules/telephony/telephony.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { CoreViewModule } from 'src/engine/core-modules/view/view.module';
import { WebhookModule } from 'src/engine/core-modules/webhook/webhook.module';
import { WorkflowApiModule } from 'src/engine/core-modules/workflow/workflow-api.module';
import { AgentModule } from 'src/engine/core-modules/workspace-agent/workspace-agent.module';
import { WorkspaceInvitationModule } from 'src/engine/core-modules/workspace-invitation/workspace-invitation.module';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { RoleModule } from 'src/engine/metadata-modules/role/role.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { WorkspaceEventEmitterModule } from 'src/engine/workspace-event-emitter/workspace-event-emitter.module';
import { FocusNfeModule } from 'src/modules/focus-nfe/focus-nfe-integration.module';

import { AuditModule } from './audit/audit.module';
import { ClientConfigModule } from './client-config/client-config.module';
import { FileModule } from './file/file.module';
import { IssuerModule } from './issuer/issuer.module';
import { StripeModule } from './stripe/stripe.module';

@Module({
  imports: [
    TwentyConfigModule.forRoot(),
    HealthModule,
    AuditModule,
    AuthModule,
    BillingModule,
    KvoipAdminModule,
    BillingWebhookModule,
    ClientConfigModule,
    FeatureFlagModule,
    FileModule,
    OpenApiModule,
    OnboardingPlansModule,
    AppTokenModule,
    TimelineMessagingModule,
    TimelineCalendarEventModule,
    UserModule,
    WorkspaceModule,
    WorkspaceInvitationModule,
    WorkspaceSSOModule,
    ApprovedAccessDomainModule,
    PostgresCredentialsModule,
    WorkflowApiModule,
    WorkspaceEventEmitterModule,
    ActorModule,
    TelemetryModule,
    AdminPanelModule,
    LabModule,
    RoleModule,
    StripeModule,
    BillingPlansModule,
    InterModule,
    IssuerModule,
    TwentyConfigModule,
    RedisClientModule,
    MetaModule,
    SectorModule,
    AgentModule,
    InboxModule,
    GoogleStorageModule,
    TelephonyModule,
    DashboardLinklogsModule,
    ChatbotFlowModule,
    WorkspaceQueryRunnerModule,
    GeoMapModule,
    SubscriptionsModule,
    FocusNfeModule,
    ImapSmtpCaldavModule,
    FileStorageModule.forRoot(),
    LoggerModule.forRootAsync({
      useFactory: loggerModuleFactory,
      inject: [TwentyConfigService],
    }),
    MessageQueueModule.registerAsync({
      useFactory: messageQueueModuleFactory,
      inject: [TwentyConfigService, RedisClientService],
    }),
    ExceptionHandlerModule.forRootAsync({
      useFactory: exceptionHandlerModuleFactory,
      inject: [TwentyConfigService, HttpAdapterHost],
    }),
    EmailModule.forRoot(),
    CaptchaModule.forRoot({
      useFactory: captchaModuleFactory,
      inject: [TwentyConfigService],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    CacheStorageModule,
    AiModule,
    ServerlessModule.forRootAsync({
      useFactory: serverlessModuleFactory,
      inject: [TwentyConfigService, FileStorageService],
    }),
    SearchModule,
    ApiKeyModule,
    WebhookModule,
    CoreViewModule,
  ],
  exports: [
    AuditModule,
    AuthModule,
    FeatureFlagModule,
    TimelineMessagingModule,
    TimelineCalendarEventModule,
    UserModule,
    WorkspaceModule,
    WorkspaceInvitationModule,
    WorkspaceSSOModule,
    StripeModule,
    InterModule,
    OnboardingPlansModule,
    BillingPlansModule,
    FocusNfeModule,
    IssuerModule,
    ImapSmtpCaldavModule,
  ],
})
export class CoreEngineModule {}
