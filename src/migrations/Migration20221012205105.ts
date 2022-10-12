import { Migration } from "@mikro-orm/migrations";

export class Migration20221012205105 extends Migration {
    async up(): Promise<void> {
        this.addSql("alter table `note` add column `created_at` datetime not null;");
        this.addSql("alter table `note` add column `updated_at` datetime not null;");
    }
}
