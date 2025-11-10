import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTipoApiToWhatsappIntegration1749999999999 implements MigrationInterface {
  name = 'AddTipoApiToWhatsappIntegration1749999999999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."whatsappIntegration" ADD COLUMN "tipoApi" character varying'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE "core"."whatsappIntegration" DROP COLUMN "tipoApi"'
    );
  }
}