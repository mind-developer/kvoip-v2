import { MigrationInterface, QueryRunner } from 'typeorm';

export class OnePointZeroVersionBillingChanges1753122753548
  implements MigrationInterface
{
  name = 'OnePointZeroVersionBillingChanges1753122753548';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "core"."IndexOnActiveSubscriptionPerWorkspace"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" DROP CONSTRAINT "IndexOnFeatureKeyAndWorkspaceIdUnique"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP CONSTRAINT "IndexOnBillingSubscriptionIdAndStripeProductIdUnique"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_BILLING_SUBSCRIPTION_WORKSPACE_ID_UNIQUE" ON "core"."billingSubscription" ("workspaceId") WHERE status IN ('trialing', 'active', 'past_due')`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" ADD CONSTRAINT "IDX_BILLING_ENTITLEMENT_KEY_WORKSPACE_ID_UNIQUE" UNIQUE ("key", "workspaceId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD CONSTRAINT "IDX_BILLING_SUBSCRIPTION_ITEM_BILLING_SUBSCRIPTION_ID_STRIPE_PRODUCT_ID_UNIQUE" UNIQUE ("billingSubscriptionId", "stripeProductId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP CONSTRAINT "IDX_BILLING_SUBSCRIPTION_ITEM_BILLING_SUBSCRIPTION_ID_STRIPE_PRODUCT_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" DROP CONSTRAINT "IDX_BILLING_ENTITLEMENT_KEY_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_BILLING_SUBSCRIPTION_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD CONSTRAINT "IndexOnBillingSubscriptionIdAndStripeProductIdUnique" UNIQUE ("billingSubscriptionId", "stripeProductId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" ADD CONSTRAINT "IndexOnFeatureKeyAndWorkspaceIdUnique" UNIQUE ("key", "workspaceId")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IndexOnActiveSubscriptionPerWorkspace" ON "core"."billingSubscription" ("workspaceId") WHERE (status = ANY (ARRAY['trialing'::core."billingSubscription_status_enum", 'active'::core."billingSubscription_status_enum", 'past_due'::core."billingSubscription_status_enum"]))`,
    );
  }
}
