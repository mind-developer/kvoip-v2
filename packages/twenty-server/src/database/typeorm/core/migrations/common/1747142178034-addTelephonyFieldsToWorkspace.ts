import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTelephonyFieldsToWorkspace1747142178034
  implements MigrationInterface
{
  name = 'AddTelephonyFieldsToWorkspace1747142178034';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "pabxCompanyId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "pabxTrunkId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "pabxDialingPlanId" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "softSwitchClientId" varchar`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" ADD "originIpId" varchar`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "pabxDialingPlanId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "pabxTrunkId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "pabxCompanyId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "softSwitchClientId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "core"."workspace" DROP COLUMN "originIpId"`,
    );
  }
}
