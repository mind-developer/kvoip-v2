import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBillingProductLimitsUniqueIndex1753124060304
  implements MigrationInterface
{
  name = 'AddBillingProductLimitsUniqueIndex1753124060304';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."billingProductLimit" DROP CONSTRAINT "UQ_product_limit_per_key"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" DROP CONSTRAINT "IDX_BILLING_SUBSCRIPTION_ITEM_BILLING_SUBSCRIPTION_ID_STRIPE_PR"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingProductLimit" ADD CONSTRAINT "IDX_PRODUCT_LIMIT_PER_KEY" UNIQUE ("productId", "productKey")`,
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
      `ALTER TABLE "core"."billingProductLimit" DROP CONSTRAINT "IDX_PRODUCT_LIMIT_PER_KEY"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingSubscriptionItem" ADD CONSTRAINT "IDX_BILLING_SUBSCRIPTION_ITEM_BILLING_SUBSCRIPTION_ID_STRIPE_PR" UNIQUE ("billingSubscriptionId", "stripeProductId")`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."billingProductLimit" ADD CONSTRAINT "UQ_product_limit_per_key" UNIQUE ("productKey", "productId")`,
    );
  }
}
