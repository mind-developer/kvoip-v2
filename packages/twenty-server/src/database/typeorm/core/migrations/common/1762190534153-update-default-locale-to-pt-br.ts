/* @kvoip-woulz proprietary */
import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class UpdateDefaultLocaleToPtBr1762190534153
  implements MigrationInterface
{
  name = 'UpdateDefaultLocaleToPtBr1762190534153';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update existing users with 'en' locale to 'pt-BR'
    await queryRunner.query(
      `UPDATE "core"."user" SET "locale" = 'pt-BR' WHERE "locale" = 'en'`,
    );

    // Update default value for future users
    await queryRunner.query(
      `ALTER TABLE "core"."user" ALTER COLUMN "locale" SET DEFAULT 'pt-BR'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert to 'en' default
    await queryRunner.query(
      `ALTER TABLE "core"."user" ALTER COLUMN "locale" SET DEFAULT 'en'`,
    );

    // Revert existing users back to 'en'
    await queryRunner.query(
      `UPDATE "core"."user" SET "locale" = 'en' WHERE "locale" = 'pt-BR'`,
    );
  }
}
