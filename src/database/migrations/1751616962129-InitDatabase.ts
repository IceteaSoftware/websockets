import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDatabase1751616962129 implements MigrationInterface {
    name = 'InitDatabase1751616962129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "connected_users" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "socket_id" character varying NOT NULL, CONSTRAINT "PK_fc08e5b21fc1fac75c078db6afe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "room" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "type" character varying NOT NULL, "created_by" character varying NOT NULL, "updated_by" character varying NOT NULL, CONSTRAINT "UQ_535c742a3606d2e3122f441b26c" UNIQUE ("name"), CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "message" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "room_id" character varying NOT NULL, "text" character varying NOT NULL, "created_by" uuid NOT NULL, "updated_by" character varying NOT NULL, "roomId" uuid, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "wallet_address" character varying NOT NULL, CONSTRAINT "UQ_196ef3e52525d3cd9e203bdb1de" UNIQUE ("wallet_address"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "room_participants_user" ("room_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_018d3e78bb28c0ad4c4ed0f75ef" PRIMARY KEY ("room_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_71d7bbb62b50e9ca77c7d1fd1f" ON "room_participants_user" ("room_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_5f42353cf9deff10af19291b2f" ON "room_participants_user" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "connected_users" ADD CONSTRAINT "FK_bdd2f61e14e03a6019c70bde9cc" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_fdfe54a21d1542c564384b74d5c" FOREIGN KEY ("roomId") REFERENCES "room"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "message" ADD CONSTRAINT "FK_6dba64e650488c2002acf3fd18a" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "room_participants_user" ADD CONSTRAINT "FK_71d7bbb62b50e9ca77c7d1fd1f0" FOREIGN KEY ("room_id") REFERENCES "room"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "room_participants_user" ADD CONSTRAINT "FK_5f42353cf9deff10af19291b2ff" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room_participants_user" DROP CONSTRAINT "FK_5f42353cf9deff10af19291b2ff"`);
        await queryRunner.query(`ALTER TABLE "room_participants_user" DROP CONSTRAINT "FK_71d7bbb62b50e9ca77c7d1fd1f0"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_6dba64e650488c2002acf3fd18a"`);
        await queryRunner.query(`ALTER TABLE "message" DROP CONSTRAINT "FK_fdfe54a21d1542c564384b74d5c"`);
        await queryRunner.query(`ALTER TABLE "connected_users" DROP CONSTRAINT "FK_bdd2f61e14e03a6019c70bde9cc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5f42353cf9deff10af19291b2f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_71d7bbb62b50e9ca77c7d1fd1f"`);
        await queryRunner.query(`DROP TABLE "room_participants_user"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "message"`);
        await queryRunner.query(`DROP TABLE "room"`);
        await queryRunner.query(`DROP TABLE "connected_users"`);
    }

}
