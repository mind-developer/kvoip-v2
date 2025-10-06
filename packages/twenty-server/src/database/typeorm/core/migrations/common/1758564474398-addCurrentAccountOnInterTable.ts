import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCurrentAccountOnInterTable1758564474398 implements MigrationInterface {
    name = 'AddCurrentAccountOnInterTable1758564474398'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."financialClosing" DROP CONSTRAINT "FK_c176bcc98c7320160bc53e61609"`);
        await queryRunner.query(`ALTER TABLE "core"."interIntegration" ADD "currentAccount" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "core"."financialClosing" ALTER COLUMN "workspaceId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "core"."financialClosing" ADD CONSTRAINT "FK_ef1219977374044adf8fbcb89b1" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."financialClosing" DROP CONSTRAINT "FK_ef1219977374044adf8fbcb89b1"`);
        await queryRunner.query(`ALTER TABLE "core"."financialClosing" ALTER COLUMN "workspaceId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "core"."interIntegration" DROP COLUMN "currentAccount"`);
        await queryRunner.query(`ALTER TABLE "core"."financialClosing" ADD CONSTRAINT "FK_c176bcc98c7320160bc53e61609" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
