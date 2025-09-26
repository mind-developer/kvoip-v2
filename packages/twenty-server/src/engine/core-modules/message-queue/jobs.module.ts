import { Module } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { AuditJobModule } from 'src/engine/core-modules/audit/jobs/audit-job.module';
import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { CheckExpiredSubscriptionsJob } from 'src/engine/core-modules/billing/crons/jobs/billing-check-expired-subscriptions.job';
import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { UpdateSubscriptionQuantityJob } from 'src/engine/core-modules/billing/jobs/update-subscription-quantity.job';
import { StripeModule } from 'src/engine/core-modules/billing/stripe/stripe.module';
import { ChatMessageManagerModule } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.module';
import { ChatMessageManagerService } from 'src/engine/core-modules/chat-message-manager/chat-message-manager.service';
import { ChatbotRunnerModule } from 'src/engine/core-modules/chatbot-runner/chatbot-runner.module';
import { ChatbotRunnerService } from 'src/engine/core-modules/chatbot-runner/chatbot-runner.service';
import { HandlersModule } from 'src/engine/core-modules/chatbot-runner/engine/handlers/handlers.module';
import { EmailSenderJob } from 'src/engine/core-modules/email/email-sender.job';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { FileService } from 'src/engine/core-modules/file/services/file.service';
import { GoogleStorageService } from 'src/engine/core-modules/google-cloud/google-storage.service';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { MessageQueueModule } from 'src/engine/core-modules/message-queue/message-queue.module';
import { MetaModule } from 'src/engine/core-modules/meta/meta.module';
import { FirebaseService } from 'src/engine/core-modules/meta/services/firebase.service';
import { WhatsappEmmitResolvedChatsCronJob } from 'src/engine/core-modules/meta/whatsapp/cron/jobs/whatsapp-chats-emmit-resolved-status.cron.job';
import { WhatsappEmmitWaitingChatsCronJob } from 'src/engine/core-modules/meta/whatsapp/cron/jobs/whatsapp-chats-emmit-waiting-status.cron.job';
import { WhatsappIntegration } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.entity';
import { WhatsAppService } from 'src/engine/core-modules/meta/whatsapp/whatsapp.service';
import { Sector } from 'src/engine/core-modules/sector/sector.entity';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { WebhookJobModule } from 'src/engine/core-modules/webhook/jobs/webhook-job.module';
import { WorkspaceAgent } from 'src/engine/core-modules/workspace-agent/workspace-agent.entity';
import { HandleWorkspaceMemberDeletedJob } from 'src/engine/core-modules/workspace/handle-workspace-member-deleted.job';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { ObjectMetadataModule } from 'src/engine/metadata-modules/object-metadata/object-metadata.module';
import { ServerlessFunctionModule } from 'src/engine/metadata-modules/serverless-function/serverless-function.module';
import { TriggerModule } from 'src/engine/metadata-modules/trigger/trigger.module';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';
import { CleanOnboardingWorkspacesJob } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-onboarding-workspaces.job';
import { CleanSuspendedWorkspacesJob } from 'src/engine/workspace-manager/workspace-cleaner/crons/clean-suspended-workspaces.job';
import { CleanWorkspaceDeletionWarningUserVarsJob } from 'src/engine/workspace-manager/workspace-cleaner/jobs/clean-workspace-deletion-warning-user-vars.job';
import { WorkspaceCleanerModule } from 'src/engine/workspace-manager/workspace-cleaner/workspace-cleaner.module';
import { CalendarEventParticipantManagerModule } from 'src/modules/calendar/calendar-event-participant-manager/calendar-event-participant-manager.module';
import { CalendarModule } from 'src/modules/calendar/calendar.module';
import { AutoCompaniesAndContactsCreationJobModule } from 'src/modules/contact-creation-manager/jobs/auto-companies-and-contacts-creation-job.module';
import { FavoriteModule } from 'src/modules/favorite/favorite.module';
import { MessagingModule } from 'src/modules/messaging/messaging.module';
import { TimelineJobModule } from 'src/modules/timeline/jobs/timeline-job.module';
import { TimelineActivityModule } from 'src/modules/timeline/timeline-activity.module';
import { WorkflowModule } from 'src/modules/workflow/workflow.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workspace,
      BillingSubscription,
      WhatsappIntegration,
      Sector,
      WorkspaceAgent,
    ]),
    DataSourceModule,
    ObjectMetadataModule,
    TypeORMModule,
    UserModule,
    UserVarsModule,
    EmailModule,
    BillingModule,
    UserWorkspaceModule,
    WorkspaceModule,
    AuthModule,
    MessagingModule,
    CalendarModule,
    CalendarEventParticipantManagerModule,
    TimelineActivityModule,
    StripeModule,
    AutoCompaniesAndContactsCreationJobModule,
    TimelineJobModule,
    WebhookJobModule,
    WorkflowModule,
    FavoriteModule,
    WorkspaceCleanerModule,
    SubscriptionsModule,
    AuditJobModule,
    MetaModule,
    HandlersModule,
    ChatbotRunnerModule,
    ChatMessageManagerModule,
    MessageQueueModule,
    TriggerModule,
    ServerlessFunctionModule,
  ],
  providers: [
    CleanSuspendedWorkspacesJob,
    CleanOnboardingWorkspacesJob,
    EmailSenderJob,
    UpdateSubscriptionQuantityJob,
    HandleWorkspaceMemberDeletedJob,
    CleanWorkspaceDeletionWarningUserVarsJob,
    CheckExpiredSubscriptionsJob,
    WhatsAppService,
    GoogleStorageService,
    FirebaseService,
    WhatsappEmmitWaitingChatsCronJob,
    WhatsappEmmitResolvedChatsCronJob,
    ChatbotRunnerService,
    ChatMessageManagerService,
    FileService,
    JwtService,
    JwtWrapperService,
  ],
})
export class JobsModule {
  static moduleRef: ModuleRef;

  constructor(private moduleRef: ModuleRef) {
    JobsModule.moduleRef = this.moduleRef;
  }
}
