import { Migration } from '@mikro-orm/migrations';

export class Migration20221002233040 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table `author` (`id` integer not null primary key autoincrement, `name` text not null, `lastname` text not null);');

    this.addSql('create table `note` (`id` integer not null primary key autoincrement, `title` text not null, `content` text not null, `author_id` integer not null, constraint `note_author_id_foreign` foreign key(`author_id`) references `author`(`id`) on update cascade);');
    this.addSql('create index `note_author_id_index` on `note` (`author_id`);');
  }

}
