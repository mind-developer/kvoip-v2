import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBillingProductLimit1752862951460 implements MigrationInterface {
  name = 'AddBillingProductLimit1752862951460';

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
      `CREATE TYPE "core"."billingProductLimit_productkey_enum" AS ENUM('BASE_PRODUCT', 'WORKFLOW_NODE_EXECUTION', 'WORSPACE_MEMBERS')`,
    );
    await queryRunner.query(
      `CREATE TYPE "core"."billingProductLimit_type_enum" AS ENUM('MAX_UNITS', 'EXECUTIONS')`,
    );
    await queryRunner.query(
      `CREATE TABLE "core"."billingProductLimit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "productKey" "core"."billingProductLimit_productkey_enum" NOT NULL, "type" "core"."billingProductLimit_type_enum" NOT NULL, "limit" numeric NOT NULL, "productId" uuid NOT NULL, "deletedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a85c585b4afc080cc153731ea0f" PRIMARY KEY ("id"))`,
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
    await queryRunner.query(
      `ALTER TABLE "core"."billingProductLimit" ADD CONSTRAINT "FK_9b56d87315ee7030a2401a6c1f0" FOREIGN KEY ("productId") REFERENCES "core"."billingProduct"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingProductLimit" DROP CONSTRAINT "FK_9b56d87315ee7030a2401a6c1f0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP CONSTRAINT "IDX_BILLING_SUBSCRIPTION_ITEM_BILLING_SUBSCRIPTION_ID_STRIPE_PRODUCT_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingEntitlement" DROP CONSTRAINT "IDX_BILLING_ENTITLEMENT_KEY_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(
      `DROP INDEX "core"."IDX_BILLING_SUBSCRIPTION_WORKSPACE_ID_UNIQUE"`,
    );
    await queryRunner.query(`DROP TABLE "core"."billingProductLimit"`);
    await queryRunner.query(`DROP TYPE "core"."billingProductLimit_type_enum"`);
    await queryRunner.query(
      `DROP TYPE "core"."billingProductLimit_productkey_enum"`,
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
