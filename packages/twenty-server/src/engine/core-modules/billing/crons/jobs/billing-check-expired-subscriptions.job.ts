// packages/twenty-server/src/engine/core-modules/billing/crons/jobs/check-inter-payment-expiration.job.ts
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

import { BillingSubscription } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { SubscriptionStatus } from 'src/engine/core-modules/billing/enums/billing-subscription-status.enum';
import { SentryCronMonitor } from 'src/engine/core-modules/cron/sentry-cron-monitor.decorator';
import { Process } from 'src/engine/core-modules/message-queue/decorators/process.decorator';
import { Processor } from 'src/engine/core-modules/message-queue/decorators/processor.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export const CHECK_EXPIRED_SUBSCRIPTIONS_CRON_PATTERN = '15 * * * *'; // Run every 15 minutes

@Processor(MessageQueue.cronQueue)
export class CheckExpiredSubscriptionsJob {
  private readonly logger = new Logger(CheckExpiredSubscriptionsJob.name);

  constructor(
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(BillingSubscription, 'core')
    private readonly billingSubscriptionRepository: Repository<BillingSubscription>,
  ) {}

  @Process(CheckExpiredSubscriptionsJob.name)
  @SentryCronMonitor(
    CheckExpiredSubscriptionsJob.name,
    CHECK_EXPIRED_SUBSCRIPTIONS_CRON_PATTERN,
  )
  async handle() {
    this.logger.log('Checking for expired subscriptions');

    const now = new Date();

    // Find all active workspaces with Inter payments
    const workspaces = await this.workspaceRepository.find({
      where: {
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      },
    });

    const workspacesCount = workspaces.length;

    this.logger.log(`Found ${workspacesCount} active workspaces`);

    for (const workspace of workspaces) {
      const subscription = await this.billingSubscriptionRepository.findOne({
        where: {
          workspaceId: workspace.id,
          status: SubscriptionStatus.Active,
        },
        relations: ['billingSubscriptionItems'],
      });

      if (!subscription) continue;

      let supendedWorkspacesCount = 0;

      if (
        subscription.currentPeriodEnd &&
        subscription.currentPeriodEnd < now
      ) {
        await this.workspaceRepository.update(workspace.id, {
          activationStatus: WorkspaceActivationStatus.SUSPENDED,
        });

        await this.billingSubscriptionRepository.update(subscription.id, {
          status: SubscriptionStatus.Expired,
        });

        supendedWorkspacesCount += 1;

        this.logger.warn(
          `Suspended workspace ${workspace.id} due to expired subscription`,
        );
      }

      const ExpiredCheckConclusionMsg =
        supendedWorkspacesCount === 0
          ? 'No workspaces have been suspended'
          : `Suspended ${supendedWorkspacesCount} worksaces.`;

      this.logger.log(
        `Finished epxired subscription check. ${ExpiredCheckConclusionMsg}`,
      );
    }
  }
}
