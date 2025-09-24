import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFinancialClosingTable1753795561802 implements MigrationInterface {
    name = 'AddFinancialClosingTable1753795561802'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "core"."financialClosing" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "lastDayMonth" boolean NOT NULL, "time" character varying NOT NULL, "day" integer NOT NULL, "billingModelIds" jsonb NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "workspaceId" uuid, CONSTRAINT "PK_5de22d943615d6c6a1b8d29338d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "core"."financialClosing" ADD CONSTRAINT "FK_c176bcc98c7320160bc53e61609" FOREIGN KEY ("workspaceId") REFERENCES "core"."workspace"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "core"."financialClosing" DROP CONSTRAINT "FK_c176bcc98c7320160bc53e61609"`);
        await queryRunner.query(`DROP TABLE "core"."financialClosing"`);
    }
}
